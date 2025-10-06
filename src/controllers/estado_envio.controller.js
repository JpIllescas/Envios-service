const db = require("../models");
const EstadoEnvio = db.getModel("Estado_envio");

class EstadoEnvioController {
  // Crear un nuevo estado de envío
  async createEstadoEnvio(req, res) {
    const { id_envio } = req.body;
    const estado = 'pendiente'; 

    if (!id_envio ) {
      return res.status(400).send({ message: "id_envio es obligatorio" });
    }

    try {
      const nuevoEstado = await EstadoEnvio.create({ id_envio, estado });
      res.status(201).send({
        message: "Estado de envío creado exitosamente.",
        estado_envio: nuevoEstado
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al crear el estado de envío." });
    }
  }

  // Obtener todos los estados de envío
  async getEstadosEnvio(req, res) {
    try {
      const estados = await EstadoEnvio.findAll();
      res.send(estados);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener los estados de envío." });
    }
  }

  // Obtener estados de envío por id_envio
  async getEstadosByEnvio(req, res) {
    const { id_envio } = req.params;
    try {
      const estados = await EstadoEnvio.findAll({ where: { id_envio } });
      if (!estados || estados.length === 0) {
        return res.status(404).send({ message: "No se encontraron estados para este envío." });
      }
      res.send(estados);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener los estados del envío." });
    }
  }

  // Actualizar un estado de envío por id_estado
  async updateEstadoEnvio(req, res) {
    const { id_estado } = req.params;

    try {
      const estadoEnvio = await EstadoEnvio.findByPk(id_estado);
      if (!estadoEnvio) {
        return res.status(404).send({ message: "Estado de envío no encontrado." });
      }
      
      if (estadoEnvio.estado === 'pendiente') {
        estadoEnvio.estado = 'recolectado';
        await estadoEnvio.save(); 
      }
      if (estadoEnvio.estado === 'recolectado') {
        estadoEnvio.estado = 'en_bodega';
        await estadoEnvio.save(); 
      }
      if (estadoEnvio.estado === 'en_bodega') {
        estadoEnvio.estado = 'en_transito';
        await estadoEnvio.save(); 
      }
      if (estadoEnvio.estado === 'en_transito') {
        estadoEnvio.estado = 'entregado';
        await estadoEnvio.save(); 
      }      

      res.send({
        message: "Estado de envío actualizado correctamente.",
        estado_envio: estadoEnvio,
      });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar el estado de envío." });
    }
  }

  // Eliminar un estado de envío por id_estado
  async deleteEstadoEnvio(req, res) {
    const { id_estado } = req.params;
    try {
      const estadoEnvio = await EstadoEnvio.findByPk(id_estado);
      if (!estadoEnvio) {
        return res.status(404).send({ message: "Estado de envío no encontrado." });
      }
      await estadoEnvio.destroy();
      res.send({ message: "Estado de envío eliminado exitosamente." });
    } catch (err) {
      res.status(500).send({ message: "Error al eliminar el estado de envío." });
    }
  }
}

module.exports = EstadoEnvioController;