const express = require('express');
const Envio_productoController = require('../controllers/envio_producto.controller.js');

class Envio_productoRoute {
  constructor(app) {
    this.router = express.Router();
    this.controller = new Envio_productoController();
    this.registerRoutes();
    app.use("/envio-service/envio_producto", this.router);
  }

  registerRoutes() {
    // Crear un nuevo envio_producto
    this.router.post("/", this.controller.createEnvio_producto.bind(this.controller));

    // Obtener todos los envio_productos
    this.router.get("/", this.controller.getEnvio_productos.bind(this.controller));

    // Obtener todos los productos de un envío específico
    this.router.get("/envio/:id_envio", this.controller.getEnvio_productosByEnvio.bind(this.controller));

    // Obtener un envio_producto por ID
    this.router.get("/:id", this.controller.getEnvio_productoById.bind(this.controller));

    // Actualizar un envio_producto
    this.router.put("/:id", this.controller.updateEnvio_producto.bind(this.controller));

    // Eliminar un envio_producto
    this.router.delete("/:id", this.controller.deleteEnvio_producto.bind(this.controller));
  }
}

module.exports = Envio_productoRoute;