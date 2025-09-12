const db = require("../models");
const Tarifa_envio = db.getModel("Tarifa_envio");

class Tarifa_envioController {
  // Crear una nueva tarifa de envío
  async createTarifa_envio(req, res) {
    const { peso_minimo, peso_maximo, volumen_min, volumen_max, costo_base } = req.body;

    if (
      peso_minimo == null || peso_maximo == null ||
      volumen_min == null || volumen_max == null ||
      costo_base == null
    ) {
      return res.status(400).send({ message: "Todos los campos son obligatorios." });
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

  // Obtener una tarifa de envío por ID
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

  // Actualizar una tarifa de envío
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

      await tarifa.save();

      res.send({
        message: "Tarifa de envío actualizada correctamente.",
        tarifa_envio: tarifa
      });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar la tarifa de envío." });
    }
  }
}

module.exports = Tarifa_envioController;