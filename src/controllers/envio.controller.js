const db = require("../models");
const Envio = db.getModel("Envio");

class EnvioController {
  // Crear un nuevo envío
  async createEnvio(req, res) {
    const { id_usuario, direccion_destino, costo_envio, fecha_estimada } = req.body;
    const estado_actual = 'pendiente'; // Estado inicial por defecto

    if (!id_usuario || !direccion_destino || !costo_envio || !fecha_estimada) {
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
    const { fecha_estimada, accion } = req.body; // 'accion' puede ser 'avanzar_estado'

    try {
      const envio = await Envio.findOne({ where: { numero_guia } });
      if (!envio) {
        return res.status(404).send({ message: "Envío no encontrado." });
      }

      // Actualiza la fecha si se envía
      if (fecha_estimada) {
        envio.fecha_estimada = new Date(fecha_estimada);
      }

      // Avanza el estado solo si se solicita explícitamente
      if (accion === 'avanzar_estado') {
        switch (envio.estado_actual) {
          case 'pendiente':
            envio.estado_actual = 'en_bodega';
            break;
          case 'en_bodega':
            envio.estado_actual = 'en_transito';
            break;
          case 'en_transito':
            envio.estado_actual = 'entregado';
            break;
          // Si ya está entregado, no avanza más
        }
      }

      await envio.save();

      res.send({
        message: "Envío actualizado correctamente.",
        envio,
      });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar el envío." });
    }
  }
}


module.exports = EnvioController;
