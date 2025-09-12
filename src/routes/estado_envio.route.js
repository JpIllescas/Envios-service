const express = require('express');
const EstadoEnvioController = require('../controllers/estado_envio.controller.js');

class EstadoEnvioRoute {
  constructor(app) {
    this.router = express.Router();
    this.controller = new EstadoEnvioController();
    this.registerRoutes();
    app.use("/envio-service/estado_envio", this.router);
  }

  registerRoutes() {
    // Crear un nuevo estado de envío
    this.router.post("/", this.controller.createEstadoEnvio.bind(this.controller));

    // Obtener todos los estados de envío
    this.router.get("/", this.controller.getEstadosEnvio.bind(this.controller));

    // Obtener todos los estados de un envío específico
    this.router.get("/envio/:id_envio", this.controller.getEstadosByEnvio.bind(this.controller));

    // Actualizar un estado de envío por id_estado
    this.router.put("/:id_estado", this.controller.updateEstadoEnvio.bind(this.controller));

    // Eliminar un estado de envío por id_estado
    this.router.delete("/:id_estado", this.controller.deleteEstadoEnvio.bind(this.controller));
  }
}

module.exports = EstadoEnvioRoute;
