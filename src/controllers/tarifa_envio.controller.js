const db = require("../models");
const Tarifa_envio = db.getModel("Tarifa_envio");
const { calcularTarifa } = require("../utils/buildMedidas");

function round(n, dec = 2) {
  return Number(Number(n).toFixed(dec));
}

class Tarifa_envioController {
  async createTarifa_envio(req, res) {
    const { peso_minimo, peso_maximo, volumen_min, volumen_max, costo_base } = req.body;

    if (
      peso_minimo == null || peso_maximo == null ||
      volumen_min == null || volumen_max == null ||
      costo_base == null
    ) {
      return res.status(400).send({ message: "Todos los campos son obligatorios." });
    }

    // Validaciones de consistencia
    if (Number(peso_minimo) > Number(peso_maximo)) {
      return res.status(400).send({ message: "peso_minimo no puede ser mayor que peso_maximo." });
    }
    if (Number(volumen_min) > Number(volumen_max)) {
      return res.status(400).send({ message: "volumen_min no puede ser mayor que volumen_max." });
    }

    try {
      const nuevaTarifa = await Tarifa_envio.create({
        peso_minimo,
        peso_maximo,
        volumen_min,
        volumen_max,
        costo_base
      });
      res.status(201).send({
        message: "Tarifa de envío creada exitosamente.",
        tarifa_envio: nuevaTarifa
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al crear la tarifa de envío." });
    }
  }

  // Obtener todas las tarifas de envío
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
      if (!tarifa) {
        return res.status(404).send({ message: "Tarifa de envío no encontrada." });
      }
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
      if (!tarifa) {
        return res.status(404).send({ message: "Tarifa de envío no encontrada." });
      }

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

      res.send({
        message: "Tarifa de envío actualizada correctamente.",
        tarifa_envio: tarifa
      });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar la tarifa de envío." });
    }
  }


  async calcularEnvio(req, res) {
    try {
      const { items = [] } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).send({ message: "Debe enviar 'items' con al menos un elemento." });
      }
      const tramos = await Tarifa_envio.findAll();
      if (!tramos || tramos.length === 0) {
        return res.status(404).send({ message: "No hay tramos de tarifa configurados." });
        }

      const DIVISOR_DIM_CM = 5000; 

      let totalEnvio = 0;
      const detalle = [];

      for (const it of items) {
        const cantidad = Number(it?.cantidad) || 1;
        const alto  = Number(it?.alto)  || 0;
        const ancho = Number(it?.ancho) || 0;
        const largo = Number(it?.largo) || 0;
        const pesoRealKg = Number(it?.peso) || 0;
        const precioItem = Number(it?.precio) || 0;
        const esFragil   = Boolean(it?.fragil);

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

     
        const reglas = {
          divisorDimensional: DIVISOR_DIM_CM,
          tarifaBase: Number(tramo.costo_base) || 0, 
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

        const unitarioEnvio = round(resultado.costos.total);
        const totalItem = round(unitarioEnvio * cantidad);
        totalEnvio += totalItem;

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
            id_tarifa: tramo.id_tarifa,
            peso_minimo: tramo.peso_minimo,
            peso_maximo: tramo.peso_maximo,
            volumen_min: tramo.volumen_min,
            volumen_max: tramo.volumen_max,
            costo_base: tramo.costo_base
          },
          costos: {
            unitario_envio: unitarioEnvio,
            total_item: totalItem
          }
        });
      }

      res.status(200).send({
        message: "Tarifa de envío calculada correctamente.",
        total_envio: round(totalEnvio),
        moneda: "Q", 
        detalle
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message || "Error al calcular la tarifa de envío." });
    }
  }
}

module.exports = Tarifa_envioController;
