const express = require('express');
const Tarifa_envioController = require('../controllers/tarifa_envio.controller.js');

class Tarifa_envioRoute {
  constructor(app) {
    this.router = express.Router();
    this.controller = new Tarifa_envioController();
    this.registerRoutes();
    app.use("/envio-service/tarifa_envio", this.router);
  }

  registerRoutes() {
    // Crear un nuevo Tarifa_envio
    this.router.post("/", this.controller.createTarifa_envio.bind(this.controller));

    // Obtener todos los Tarifa envios
    this.router.get("/", this.controller.getTarifa_envios.bind(this.controller));

    // Obtener un Tarifa envio por ID
    this.router.get("/:id", this.controller.getTarifa_envioById.bind(this.controller));

    // Actualizar un Tarifa envio
    this.router.put("/:id", this.controller.updateTarifa_envio.bind(this.controller));
    //calcula un envio 
    this.router.post("/calcular", this.controller.calcularEnvio.bind(this.controller));
  }
}

module.exports = Tarifa_envioRoute;
