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
    /**
     * @openapi
     * tags:
     *   - name: Estado de Envío
     *     description: Ciclo de vida del estado de un envío
     * components:
     *   schemas:
     *     EstadoEnvio:
     *       type: object
     *       properties:
     *         id_estado:
     *           type: integer
     *           example: 10
     *         id_envio:
     *           type: integer
     *           example: 3
     *         estado:
     *           type: string
     *           enum: [pendiente, recolectado, en_bodega, en_transito, entregado]
     *           example: "pendiente"
     *         createdAt:
     *           type: string
     *           format: date-time
     *         updatedAt:
     *           type: string
     *           format: date-time
     *     CreateEstadoEnvioInput:
     *       type: object
     *       required: [id_envio]
     *       properties:
     *         id_envio:
     *           type: integer
     *     UpdateEstadoEnvioInput:
     *       type: object
     *       properties:
     *         accion:
     *           type: string
     *           description: "Acción a ejecutar sobre el estado"
     *           enum: [avanzar_estado]
     *           example: "avanzar_estado"
     *     MessageResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *     CreateEstadoEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Estado de envío creado exitosamente."
     *         estado_envio:
     *           $ref: '#/components/schemas/EstadoEnvio'
     *     UpdateEstadoEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Estado de envío actualizado correctamente."
     *         estado_envio:
     *           $ref: '#/components/schemas/EstadoEnvio'
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     */

    /**
     * @openapi
     * /envio-service/estado_envio:
     *   post:
     *     summary: Crear un nuevo estado de envío (inicia como "pendiente")
     *     tags: [Estado de Envío]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateEstadoEnvioInput'
     *     responses:
     *       201:
     *         description: Creado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CreateEstadoEnvioResponse'
     *       400:
     *         description: id_envio es obligatorio
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error al crear el estado de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post("/", this.controller.createEstadoEnvio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/estado_envio:
     *   get:
     *     summary: Obtener todos los estados de envío
     *     tags: [Estado de Envío]
     *     security: []
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/EstadoEnvio'
     *       500:
     *         description: Error al obtener los estados de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/", this.controller.getEstadosEnvio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/estado_envio/envio/{id_envio}:
     *   get:
     *     summary: Obtener los estados de un envío por id_envio
     *     tags: [Estado de Envío]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id_envio
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/EstadoEnvio'
     *       404:
     *         description: No se encontraron estados para este envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error al obtener los estados del envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/envio/:id_envio", this.controller.getEstadosByEnvio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/estado_envio/{id_estado}:
     *   put:
     *     summary: Actualizar un estado de envío por id_estado
     *     description: >-
     *       Con `accion=avanzar_estado` avanza en el flujo: pendiente → recolectado → en_bodega → en_transito → entregado.
     *     tags: [Estado de Envío]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id_estado
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateEstadoEnvioInput'
     *     responses:
     *       200:
     *         description: Actualizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UpdateEstadoEnvioResponse'
     *       404:
     *         description: Estado de envío no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error al actualizar el estado de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.put("/:id_estado", this.controller.updateEstadoEnvio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/estado_envio/{id_estado}:
     *   delete:
     *     summary: Eliminar un estado de envío por id_estado
     *     tags: [Estado de Envío]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id_estado
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Eliminado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       404:
     *         description: Estado de envío no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error al eliminar el estado de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.delete("/:id_estado", this.controller.deleteEstadoEnvio.bind(this.controller));
  }
}

module.exports = EstadoEnvioRoute;
