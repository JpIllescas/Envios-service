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
    /**
     * @openapi
     * tags:
     *   - name: Envio-Producto
     *     description: Asociación de productos a un envío
     * components:
     *   schemas:
     *     EnvioProducto:
     *       type: object
     *       properties:
     *         id:           { type: integer, example: 12 }
     *         id_envio:     { type: integer, example: 5 }
     *         id_producto:  { type: integer, example: 101 }
     *         cantidad:     { type: integer, example: 2, minimum: 1 }
     *         createdAt:    { type: string, format: date-time }
     *         updatedAt:    { type: string, format: date-time }
     *     CreateEnvioProductoInput:
     *       type: object
     *       required: [id_envio, id_producto, cantidad]
     *       properties:
     *         id_envio:     { type: integer }
     *         id_producto:  { type: integer }
     *         cantidad:     { type: integer, minimum: 1 }
     *     UpdateEnvioProductoInput:
     *       type: object
     *       required: [cantidad]
     *       properties:
     *         cantidad:     { type: integer, minimum: 1 }
     *     MessageResponse:
     *       type: object
     *       properties:
     *         message: { type: string }
     *     CreateEnvioProductoResponse:
     *       type: object
     *       properties:
     *         message:        { type: string, example: "Producto agregado al envío exitosamente." }
     *         envio_producto: { $ref: '#/components/schemas/EnvioProducto' }
     *     UpdateEnvioProductoResponse:
     *       type: object
     *       properties:
     *         message:        { type: string, example: "Cantidad actualizada correctamente." }
     *         envio_producto: { $ref: '#/components/schemas/EnvioProducto' }
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message: { type: string }
     */

    /**
     * @openapi
     * /envio-service/envio_producto:
     *   post:
     *     summary: Crear un registro de envío-producto
     *     tags: [Envio-Producto]
     *     security: []   # público (anula seguridad global)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/CreateEnvioProductoInput' }
     *     responses:
     *       201:
     *         description: Creado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/CreateEnvioProductoResponse' }
     *       400:
     *         description: Faltan campos o cantidad inválida
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     *       404:
     *         description: El envío especificado no existe
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     *       500:
     *         description: Error al agregar el producto al envío
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.post("/", this.controller.createEnvio_producto.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio_producto:
     *   get:
     *     summary: Listar todos los registros envío-producto
     *     tags: [Envio-Producto]
     *     security: []
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/EnvioProducto' }
     *       500:
     *         description: Error al obtener los productos de los envíos
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.get("/", this.controller.getEnvio_productos.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio_producto/envio/{id_envio}:
     *   get:
     *     summary: Listar productos asociados a un envío
     *     tags: [Envio-Producto]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id_envio
     *         required: true
     *         schema: { type: integer }
     *         description: ID del envío
     *     responses:
     *       200:
     *         description: OK (array vacío si no hay productos)
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/EnvioProducto' }
     *       500:
     *         description: Error al obtener los productos del envío
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.get("/envio/:id_envio", this.controller.getEnvio_productosByEnvio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio_producto/{id}:
     *   get:
     *     summary: Obtener un envío-producto por ID
     *     tags: [Envio-Producto]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Encontrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/EnvioProducto' }
     *       404:
     *         description: Envío-producto no encontrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     *       500:
     *         description: Error al obtener el producto del envío
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.get("/:id", this.controller.getEnvio_productoById.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio_producto/{id}:
     *   put:
     *     summary: Actualizar la cantidad de un envío-producto
     *     tags: [Envio-Producto]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: integer }
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/UpdateEnvioProductoInput' }
     *     responses:
     *       200:
     *         description: Actualizado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/UpdateEnvioProductoResponse' }
     *       400:
     *         description: Cantidad inválida
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     *       404:
     *         description: Envío-producto no encontrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     *       500:
     *         description: Error al actualizar el producto del envío
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.put("/:id", this.controller.updateEnvio_producto.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio_producto/{id}:
     *   delete:
     *     summary: Eliminar un envío-producto
     *     tags: [Envio-Producto]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Eliminado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       404:
     *         description: Envío-producto no encontrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     *       500:
     *         description: Error al eliminar el producto del envío
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.delete("/:id", this.controller.deleteEnvio_producto.bind(this.controller));
  }
}

module.exports = Envio_productoRoute;
