const db = require("../models");
const Envio = db.getModel("Envio");

class EnvioController {
  // Crear un nuevo envío
  async createEnvio(req, res) {
    const { id_usuario, direccion_destino, costo_envio, estado_actual, fecha_estimada } = req.body;

    if (!id_usuario || !direccion_destino || !costo_envio || !estado_actual || !fecha_estimada) {
      return res.status(400).send({ message: "Todos los campos del envio son obligatorios." });
    }

    if (isNaN(costo_envio) || Number(costo_envio) <= 0) {
      return res.status(400).send({ message: "El costo de envio debe ser un numero positivo." });
    }

    try {
      let numero_guia;
      let existente;
      // Generar un número de guía único
      do {
        numero_guia = `GUIA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        existente = await Envio.findOne({ where: { numero_guia } });
      } while (existente);

      // Formatear la fecha a objeto Date
      const fechaFormateada = new Date(fecha_estimada);

      const nuevoEnvio = await Envio.create({
        id_usuario,
        numero_guia,
        direccion_destino,
        costo_envio,
        estado_actual,
        fecha_estimada: fechaFormateada
      });

      res.status(201).send({
        message: "Envío creado exitosamente.",
        envio: nuevoEnvio
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al crear el envío." });
    }
  }

  // Obtener todos los envíos
  async getEnvios(req, res) {
    try {
      const envios = await Envio.findAll();
      res.send(envios);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener los envíos." });
    }
  }

  // Obtener un envío por número de guía
  async getEnvioByguia(req, res) {
    const { numero_guia } = req.params;
    try {
      const envio = await Envio.findOne({ where: { numero_guia } });
      if (!envio) {
        return res.status(404).send({ message: "Envío no encontrado." });
      }
      res.send(envio);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener el envío." });
    }
  }

  // Actualizar un envío
  async updateEnvio(req, res) {
    const { numero_guia } = req.params;
    const { fecha_estimada, estado_actual } = req.body;

    try {
      const envio = await Envio.findOne({ where: { numero_guia } });
      if (!envio) {
        return res.status(404).send({ message: "Envío no encontrado." });
      }

      if (fecha_estimada) envio.fecha_estimada = new Date(fecha_estimada);
      if (estado_actual) envio.estado_actual = estado_actual;

      await envio.save();

      res.send({
        message: "Envío actualizado correctamente.",
        envio,
      });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar el envío." });
    }
  }

  // Eliminar un envío
  async deleteEnvio(req, res) {
    const { id_envio } = req.params;
    try {
      const envio = await Envio.findByPk(id_envio);
      if (!envio) {
        return res.status(404).send({ message: "Envío no encontrado." });
      }
      await envio.destroy();
      res.send({ message: "Envío eliminado exitosamente." });
    } catch (err) {
      res.status(500).send({ message: "Error al eliminar el envío." });
    }
  }
}

module.exports = EnvioController;
