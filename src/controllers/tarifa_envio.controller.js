const db = require("../models");
const Tarifa_envio = db.getModel("Tarifa_envio");
const { calcularTarifa } = require("../utils/buildMedidas");

function round(n, dec = 2) { return Number(Number(n).toFixed(dec)); }
function parseDiscountTiers(src) {
  if (!src) return [];
  return String(src)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(pair => {
      const [thr, pct] = pair.split(":").map(x => x.trim());
      const t = Number(thr), p = Number(pct);
      if (!Number.isFinite(t) || !Number.isFinite(p)) return null;
      return { threshold: t, pct: p };
    })
    .filter(Boolean)
    .sort((a, b) => a.threshold - b.threshold);
}
function getDiscountPct(subtotal, tiers) {
  let pct = 0;
  for (const t of tiers) if (subtotal >= t.threshold) pct = t.pct;
  return pct;
}
function haversineKm(aLat, aLng, bLat, bLng) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

class Tarifa_envioController {
  async createTarifa_envio(req, res) {
    const { peso_minimo, peso_maximo, volumen_min, volumen_max, costo_base } = req.body;
    if (peso_minimo == null || peso_maximo == null || volumen_min == null || volumen_max == null || costo_base == null) {
      return res.status(400).send({ message: "Todos los campos son obligatorios." });
    }
    if (Number(peso_minimo) > Number(peso_maximo)) {
      return res.status(400).send({ message: "peso_minimo no puede ser mayor que peso_maximo." });
    }
    if (Number(volumen_min) > Number(volumen_max)) {
      return res.status(400).send({ message: "volumen_min no puede ser mayor que volumen_max." });
    }
    try {
      const nuevaTarifa = await Tarifa_envio.create({ peso_minimo, peso_maximo, volumen_min, volumen_max, costo_base });
      res.status(201).send({ message: "Tarifa de envío creada exitosamente.", tarifa_envio: nuevaTarifa });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al crear la tarifa de envío." });
    }
  }

  async getTarifa_envios(req, res) {
    try {
      const tarifas = await Tarifa_envio.findAll();
      res.send(tarifas);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener las tarifas de envío." });
    }
  }

  async getTarifa_envioById(req, res) {
    const { id } = req.params;
    try {
      const tarifa = await Tarifa_envio.findByPk(id);
      if (!tarifa) return res.status(404).send({ message: "Tarifa de envío no encontrada." });
      res.send(tarifa);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener la tarifa de envío." });
    }
  }

  async updateTarifa_envio(req, res) {
    const { id } = req.params;
    const { peso_minimo, peso_maximo, volumen_min, volumen_max, costo_base } = req.body;
    try {
      const tarifa = await Tarifa_envio.findByPk(id);
      if (!tarifa) return res.status(404).send({ message: "Tarifa de envío no encontrada." });

      if (peso_minimo != null) tarifa.peso_minimo = peso_minimo;
      if (peso_maximo != null) tarifa.peso_maximo = peso_maximo;
      if (volumen_min != null) tarifa.volumen_min = volumen_min;
      if (volumen_max != null) tarifa.volumen_max = volumen_max;
      if (costo_base != null) tarifa.costo_base = costo_base;

      if (Number(tarifa.peso_minimo) > Number(tarifa.peso_maximo)) {
        return res.status(400).send({ message: "peso_minimo no puede ser mayor que peso_maximo." });
      }
      if (Number(tarifa.volumen_min) > Number(tarifa.volumen_max)) {
        return res.status(400).send({ message: "volumen_min no puede ser mayor que volumen_max." });
      }

      await tarifa.save();
      res.send({ message: "Tarifa de envío actualizada correctamente.", tarifa_envio: tarifa });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar la tarifa de envío." });
    }
  }

  async calcularEnvio(req, res) {
    try {
      const { items = [], envio = {} } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).send({ message: "Debe enviar 'items' con al menos un elemento." });
      }

      const tramos = await Tarifa_envio.findAll();
      if (!tramos || tramos.length === 0) {
        return res.status(404).send({ message: "No hay tramos de tarifa configurados." });
      }

      const DIVISOR_DIM_CM = Number(process.env.SHIP_DIVISOR_DIM_CM || 5000);
      const COSTO_BASE_ENVIO = Number(process.env.SHIP_BASE || 5);
      const COSTO_POR_KM = Number(process.env.SHIP_COST_PER_KM || 0.4);
      const DISTANCIA_MIN_KM = Number(process.env.SHIP_MIN_KM || 3);
      const RURAL_SURCHARGE_PCT = Number(process.env.SHIP_RURAL_SURCHARGE_PCT || 0.1);
      const DISCOUNT_TIERS = parseDiscountTiers(process.env.SHIP_DISCOUNT_TIERS || "200:0.05,400:0.1,700:0.15");

      let distanceKm = 0;
      if (Number.isFinite(Number(envio.distance_km))) {
        distanceKm = Number(envio.distance_km);
      } else if (
        envio.origen_lat != null && envio.origen_lng != null &&
        envio.destino_lat != null && envio.destino_lng != null
      ) {
        distanceKm = haversineKm(
          Number(envio.origen_lat), Number(envio.origen_lng),
          Number(envio.destino_lat), Number(envio.destino_lng)
        );
      }
      const rural = Boolean(envio.rural);

      let totalEnvio = 0;
      const detalle = [];
      let totalKgTarifables = 0;
      let maxCostoBaseTramo = 0;
      let subtotalMercaderia = 0;

      for (const it of items) {
        const cantidad = Number(it?.cantidad) || 1;
        const alto  = Number(it?.alto)  || 0;
        const ancho = Number(it?.ancho) || 0;
        const largo = Number(it?.largo) || 0;
        const pesoRealKg = Number(it?.peso) || 0;
        const precioItem = Number(it?.precio) || 0;
        const esFragil   = Boolean(it?.fragil);

        subtotalMercaderia += round(precioItem * cantidad);

        const volumenCm3 = alto * ancho * largo;
        const pesoVolumetricoKg = DIVISOR_DIM_CM > 0 ? (volumenCm3 / DIVISOR_DIM_CM) : 0;
        const kgTarifables = Math.max(pesoRealKg, pesoVolumetricoKg);

        const tramo = tramos.find(t =>
          kgTarifables >= Number(t.peso_minimo) &&
          kgTarifables <= Number(t.peso_maximo) &&
          volumenCm3  >= Number(t.volumen_min) &&
          volumenCm3  <= Number(t.volumen_max)
        );
        if (!tramo) {
          return res.status(404).send({
            message: "No existe una tarifa que cubra el rango de peso/volumen para un ítem.",
            item: it,
            kgTarifables: round(kgTarifables),
            volumenCm3
          });
        }

        maxCostoBaseTramo = Math.max(maxCostoBaseTramo, Number(tramo.costo_base) || 0);

        const reglas = {
          divisorDimensional: DIVISOR_DIM_CM,
          tarifaBase: 0,
          precioPorKg: 0,
          umbralSobrepesoKg: Infinity,
          extraPorKgSobrepeso: 0,
          fragil: esFragil,
          recargoFragilPct: 0,
          usarSeguro: false,
          seguroPctSobreCostoBase: 0,
          seguroMinimo: 0
        };

        const medidas = {
          costoBase: precioItem,
          volumen: { base_cm3: volumenCm3 },
          peso: { real_kg: pesoRealKg }
        };

        const resultado = calcularTarifa(medidas, reglas);
        const unitarioVariable = round(resultado.costos.total);
        const totalItemBase = round(unitarioVariable * cantidad);
        totalEnvio += totalItemBase;

        detalle.push({
          item: { ...it, cantidad },
          medidas: {
            dimensiones: { alto_cm: alto, ancho_cm: ancho, largo_cm: largo },
            volumen_cm3: volumenCm3
          },
          pesos: {
            real_kg: round(pesoRealKg),
            volumetrico_kg: round(pesoVolumetricoKg),
            tarifable_kg: round(kgTarifables)
          },
          tramo_usado: {
            id_tarifa: tramo.id_tarifa ?? tramo.id,
            peso_minimo: tramo.peso_minimo,
            peso_maximo: tramo.peso_maximo,
            volumen_min: tramo.volumen_min,
            volumen_max: tramo.volumen_max,
            costo_base: tramo.costo_base
          },
          costos: {
            unitario_envio_base: 0,
            total_item_base: totalItemBase
          },
          _kg_tarifables_item: kgTarifables * cantidad,
          _shipping_cost_before_adjustments: totalItemBase
        });

        totalKgTarifables += kgTarifables * cantidad;
      }

      const kmCobrables = Math.max(round(distanceKm), DISTANCIA_MIN_KM);
      let distanceCharge = COSTO_BASE_ENVIO + kmCobrables * COSTO_POR_KM;
      if (rural && RURAL_SURCHARGE_PCT > 0) {
        distanceCharge = distanceCharge * (1 + RURAL_SURCHARGE_PCT);
      }

      const costoBaseEnvioUnico = round(maxCostoBaseTramo);

      let recargoDistribuible = round(distanceCharge + costoBaseEnvioUnico);
      if (recargoDistribuible > 0 && totalKgTarifables > 0) {
        let sumDistribuido = 0;
        detalle.forEach((d, idx) => {
          const share = d._kg_tarifables_item / totalKgTarifables;
          let extra = round(recargoDistribuible * share);
          if (idx === detalle.length - 1) extra = round(recargoDistribuible - sumDistribuido);
          else sumDistribuido += extra;

          d.costos.recargo_distancia_item = extra;
          d.costos.costo_base_envio_item = 0;
          d.costos.total_item = round((d.costos.total_item_base || 0) + extra);
          d._shipping_cost_before_adjustments += extra;
        });
        totalEnvio = round(totalEnvio + recargoDistribuible);
      } else {
        detalle.forEach((d) => {
          d.costos.recargo_distancia_item = 0;
          d.costos.costo_base_envio_item = 0;
          d.costos.total_item = d.costos.total_item_base;
        });
      }

      const discountPct = getDiscountPct(subtotalMercaderia, DISCOUNT_TIERS);
      let discountTotal = 0;
      if (discountPct > 0 && totalEnvio > 0) {
        const preDiscountTotal = detalle.reduce((acc, d) => acc + (d._shipping_cost_before_adjustments || d.costos.total_item), 0);
        discountTotal = round(preDiscountTotal * discountPct);

        let distributed = 0;
        detalle.forEach((d, idx) => {
          const base = d._shipping_cost_before_adjustments || d.costos.total_item;
          const share = preDiscountTotal > 0 ? base / preDiscountTotal : 0;
          let disc = round(discountTotal * share);
          if (idx === detalle.length - 1) disc = round(discountTotal - distributed);
          else distributed += disc;

          d.costos.descuento_envio_item = disc;
          d.costos.total_item = round((d.costos.total_item || 0) - disc);
        });

        totalEnvio = round(totalEnvio - discountTotal);
      } else {
        detalle.forEach(d => { d.costos.descuento_envio_item = 0; });
      }

      detalle.forEach((d) => {
        delete d._kg_tarifables_item;
        delete d._shipping_cost_before_adjustments;
      });

      res.status(200).send({
        message: "Tarifa de envío calculada correctamente.",
        total_envio: round(totalEnvio),
        moneda: "Q",
        distancia_km: round(distanceKm),
        recargo_distancia_total: round(distanceCharge),
        costo_base_envio_unico: costoBaseEnvioUnico,
        rural: Boolean(rural),
        subtotal_mercaderia: round(subtotalMercaderia),
        descuento_por_envio_pct: discountPct,
        descuento_por_envio_total: round(discountTotal),
        detalle
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al calcular la tarifa de envío." });
    }
  }
}

module.exports = Tarifa_envioController;
