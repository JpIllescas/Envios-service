
/**
 * Calcula peso volumétrico y la tarifa en base a reglas configurables.
 * @param {object} medidas - salida de buildMedidaProducto(p)
 * @param {object} reglas  - configuración de precios y recargos
 *
 * Reglas por defecto :
 *  - divisorDimensional: 5000 (cm) -> peso volumétrico = (LxAxH)/5000
 *  - tarifaBase: 10
 *  - precioPorKg: 2.5
 *  - sobrepeso: umbral 20kg, +1.2/ kg extra
 *  - fragil: false, recargo 10%
 *  - seguro: 1.5% del costoBase del producto, mínimo 1
 */
function calcularTarifa(medidas, reglas = {}) {
  const cfg = {
    divisorDimensional: 5000, 
    tarifaBase: 10,           
    precioPorKg: 2.5,         
    umbralSobrepesoKg: 20,    
    extraPorKgSobrepeso: 1.2, 
    fragil: false,            
    recargoFragilPct: 0.10,   
    usarSeguro: true,
    seguroPctSobreCostoBase: 0.015,
    seguroMinimo: 1,
    ...reglas
  };

  const volumenCm3 = medidas.volumen.base_cm3;
  const pesoRealKg = medidas.peso.real_kg;

  const pesoVolumetricoKg = cfg.divisorDimensional > 0
    ? volumenCm3 / cfg.divisorDimensional
    : 0;

  const kgTarifables = Math.max(pesoRealKg, pesoVolumetricoKg);

  const cargoBase = cfg.tarifaBase;
  const cargoPorKg = kgTarifables * cfg.precioPorKg;

  const excesoKg = Math.max(0, kgTarifables - cfg.umbralSobrepesoKg);
  const cargoSobrepeso = excesoKg * cfg.extraPorKgSobrepeso;

  const subtotalSinSeguro = cargoBase + cargoPorKg + cargoSobrepeso;
  const cargoFragil = cfg.fragil ? subtotalSinSeguro * cfg.recargoFragilPct : 0;

  const costoBaseProducto = Number(medidas.costoBase) || 0;
  const cargoSeguro = cfg.usarSeguro
    ? Math.max(cfg.seguroMinimo, costoBaseProducto * cfg.seguroPctSobreCostoBase)
    : 0;

  const total = subtotalSinSeguro + cargoFragil + cargoSeguro;

  return {
    pesos: {
      real_kg: redondear(pesoRealKg),
      volumetrico_kg: redondear(pesoVolumetricoKg),
      tarifable_kg: redondear(kgTarifables)
    },
    costos: {
      base: redondear(cargoBase),
      porKg: redondear(cargoPorKg),
      sobrepeso: redondear(cargoSobrepeso),
      fragil: redondear(cargoFragil),
      seguro: redondear(cargoSeguro),
      total: redondear(total)
    },
    parametros: cfg
  };
}

function redondear(n, dec = 2) {
  return Number(Number(n).toFixed(dec));
}

module.exports = {
  calcularTarifa
};
