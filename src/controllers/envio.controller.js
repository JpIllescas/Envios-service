const db = require("../models");
const Envio = db.getModel("Envio");
const axios = require("axios");

class EnvioController {
  async createEnvio(req, res) {
    const { id_usuario, direccion_destino, costo_envio } = req.body;
    let { fecha_estimada } = req.body;

    if (!id_usuario || !direccion_destino || !costo_envio || !fecha_estimada) {
      return res
        .status(400)
        .send({ message: "Todos los campos del envio son obligatorios." });
    }

    if (isNaN(costo_envio) || Number(costo_envio) <= 0) {
      return res
        .status(400)
        .send({ message: "El costo de envio debe ser un numero positivo." });
    }

    try {
      let numero_guia;
      let existente;
      do {
        numero_guia = `GUIA-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;
        existente = await Envio.findOne({ where: { numero_guia } });
      } while (existente);

      if (typeof fecha_estimada === "string" && fecha_estimada.includes("T")) {
        fecha_estimada = fecha_estimada.slice(0, 10);
      }

      const nuevoEnvio = await Envio.create({
        id_usuario,
        numero_guia,
        direccion_destino,
        costo_envio,
        fecha_estimada,
      });

      try {
        const url = process.env.ESTADO_ENVIO_URL;
        await axios.post(`${url}/envio-service/estado_envio`, {
          id_envio: nuevoEnvio.id_envio,
        });
      } catch (error) {
        console.error("Error al crear el estado envio:", error?.message || error);
      }

      return res.status(201).send({
        message: "Envío creado exitosamente.",
        envio: nuevoEnvio,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: err.message || "Error al crear el envío." });
    }
  }

  async getEnvios(req, res) {
    try {
      const envios = await Envio.findAll();
      return res.status(200).send(envios);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: "Error al obtener los envíos." });
    }
  }

  async getEnvioByguia(req, res) {
    const { numero_guia } = req.params;
    try {
      const envio = await Envio.findOne({ where: { numero_guia } });
      if (!envio) {
        return res.status(404).send({ message: "Envío no encontrado." });
      }
      return res.send(envio);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Error al obtener el envío." });
    }
  }

  
  async updateEnvio(req, res) {
    const { numero_guia } = req.params;
    let { fecha_estimada } = req.body;

    if (!fecha_estimada) {
      return res
        .status(400)
        .send({ message: "fecha_estimada es requerida" });
    }

    // Normaliza a "YYYY-MM-DD" si viene en ISO
    if (typeof fecha_estimada === "string" && fecha_estimada.includes("T")) {
      fecha_estimada = fecha_estimada.slice(0, 10);
    }

    try {
      // Usar UPDATE directo (evita issues de "dirty state" en instancias)
      const [affected] = await Envio.update(
        { fecha_estimada }, 
        { where: { numero_guia } }
      );
     
      if (affected === 0) {
        return res.status(404).send({ message: "Envío no encontrado." });
      }
      const envio = await Envio.findOne({ where: { numero_guia } });
      return res.send({
        message: "Envío actualizado correctamente.",
        envio,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: "Error al actualizar el envío." });
    }
  }
}

module.exports = EnvioController;
