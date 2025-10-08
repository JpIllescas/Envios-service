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
    /**
     * @openapi
     * tags:
     *   - name: Envío
     *     description: Gestión de envíos
     * components:
     *   schemas:
     *     Envio:
     *       type: object
     *       properties:
     *         id_envio:
     *           type: integer
     *           example: 1
     *         id_usuario:
     *           type: integer
     *           example: 42
     *         numero_guia:
     *           type: string
     *           example: "GUIA-ABC123XYZ"
     *         direccion_destino:
     *           type: string
     *           example: "4a calle 3-45, Zona 1, Antigua"
     *         costo_envio:
     *           type: number
     *           format: float
     *           example: 75.5
     *         fecha_estimada:
     *           type: string
     *           format: date-time
     *           example: "2025-10-15T18:00:00.000Z"
     *         createdAt:
     *           type: string
     *           format: date-time
     *         updatedAt:
     *           type: string
     *           format: date-time
     *     CreateEnvioInput:
     *       type: object
     *       required:
     *         - id_usuario
     *         - direccion_destino
     *         - costo_envio
     *         - fecha_estimada
     *       properties:
     *         id_usuario:
     *           type: integer
     *           minimum: 1
     *         direccion_destino:
     *           type: string
     *         costo_envio:
     *           type: number
     *           format: float
     *           minimum: 0.01
     *         fecha_estimada:
     *           type: string
     *           format: date-time
     *       example:
     *         id_usuario: 42
     *         direccion_destino: "4a calle 3-45, Zona 1, Antigua"
     *         costo_envio: 75.5
     *         fecha_estimada: "2025-10-15T18:00:00.000Z"
     *     UpdateEnvioInput:
     *       type: object
     *       properties:
     *         fecha_estimada:
     *           type: string
     *           format: date-time
     *       example:
     *         fecha_estimada: "2025-10-18T18:00:00.000Z"
     *     CreateEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Envío creado exitosamente."
     *         envio:
     *           $ref: '#/components/schemas/Envio'
     *     UpdateEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Envío actualizado correctamente."
     *         envio:
     *           $ref: '#/components/schemas/Envio'
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Error al crear el envío."
     */

    /**
     * @openapi
     * /envio-service/envio:
     *   post:
     *     summary: Crear un nuevo envío
     *     tags:
     *       - Envío
     *     security: []   # anula seguridad global si existe
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateEnvioInput'
     *     responses:
     *       201:
     *         description: Envío creado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CreateEnvioResponse'
     *       400:
     *         description: Faltan campos o costo inválido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error del servidor o al crear estado_envio
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post("/", this.controller.createEnvio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio:
     *   get:
     *     summary: Obtener todos los envíos
     *     tags:
     *       - Envío
     *     security: []
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Envio'
     *       500:
     *         description: Error al obtener los envíos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/", this.controller.getEnvios.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio/{numero_guia}:
     *   get:
     *     summary: Obtener un envío por número de guía
     *     tags:
     *       - Envío
     *     security: []
     *     parameters:
     *       - in: path
     *         name: numero_guia
     *         required: true
     *         schema:
     *           type: string
     *         example: "GUIA-ABC123XYZ"
     *     responses:
     *       200:
     *         description: Envío encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Envio'
     *       404:
     *         description: Envío no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error al obtener el envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/:numero_guia", this.controller.getEnvioByguia.bind(this.controller));

    /**
     * @openapi
     * /envio-service/envio/{numero_guia}:
     *   put:
     *     summary: Actualizar un envío por número de guía
     *     tags:
     *       - Envío
     *     security: []
     *     parameters:
     *       - in: path
     *         name: numero_guia
     *         required: true
     *         schema:
     *           type: string
     *         example: "GUIA-ABC123XYZ"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateEnvioInput'
     *     responses:
     *       200:
     *         description: Envío actualizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UpdateEnvioResponse'
     *       404:
     *         description: Envío no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error al actualizar el envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.put("/:numero_guia", this.controller.updateEnvio.bind(this.controller));
  }
}

module.exports = EnvioRoute;
