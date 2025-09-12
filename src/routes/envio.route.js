const express = require('express');
const EnvioController = require('../controllers/envio.controller.js');

class EnvioRoute {
  constructor(app) {
    this.router = express.Router();
    this.controller = new EnvioController();
    this.registerRoutes();
    app.use("/envio-service/envio", this.router);
  }

  registerRoutes() {
    // Crear un nuevo envio
    this.router.post("/", this.controller.createEnvio.bind(this.controller));

    // Obtener todos los envios
    this.router.get("/", this.controller.getEnvios.bind(this.controller));

    // Obtener un envio por numero de guia
    this.router.get("/:numero_guia", this.controller.getEnvioByguia.bind(this.controller));

    // Actualizar un envio por numero de guia
    this.router.put("/:numero_guia", this.controller.updateEnvio.bind(this.controller));

    // Eliminar un envio por id_envio
    this.router.delete("/:id_envio", this.controller.deleteEnvio.bind(this.controller));
  }
}

module.exports = EnvioRoute;
