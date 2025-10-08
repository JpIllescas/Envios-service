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
    /**
     * @openapi
     * tags:
     *   - name: Tarifa de Envío
     *     description: Tramos de tarifas y cálculo de costo de envío
     * components:
     *   schemas:
     *     TarifaEnvio:
     *       type: object
     *       properties:
     *         id:
     *           type: integer
     *           example: 7
     *         id_tarifa:
     *           type: integer
     *           description: "Algunos modelos usan id_tarifa como PK"
     *           example: 7
     *         peso_minimo:
     *           type: number
     *           format: float
     *           example: 0.1
     *         peso_maximo:
     *           type: number
     *           format: float
     *           example: 5
     *         volumen_min:
     *           type: number
     *           format: float
     *           description: "en cm³"
     *           example: 0
     *         volumen_max:
     *           type: number
     *           format: float
     *           description: "en cm³"
     *           example: 50000
     *         costo_base:
     *           type: number
     *           format: float
     *           example: 10
     *         createdAt:
     *           type: string
     *           format: date-time
     *         updatedAt:
     *           type: string
     *           format: date-time
     *     CreateTarifaEnvioInput:
     *       type: object
     *       required:
     *         - peso_minimo
     *         - peso_maximo
     *         - volumen_min
     *         - volumen_max
     *         - costo_base
     *       properties:
     *         peso_minimo:
     *           type: number
     *           format: float
     *         peso_maximo:
     *           type: number
     *           format: float
     *         volumen_min:
     *           type: number
     *           format: float
     *         volumen_max:
     *           type: number
     *           format: float
     *         costo_base:
     *           type: number
     *           format: float
     *     UpdateTarifaEnvioInput:
     *       type: object
     *       properties:
     *         peso_minimo:
     *           type: number
     *           format: float
     *         peso_maximo:
     *           type: number
     *           format: float
     *         volumen_min:
     *           type: number
     *           format: float
     *         volumen_max:
     *           type: number
     *           format: float
     *         costo_base:
     *           type: number
     *           format: float
     *     MessageResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *     CreateTarifaEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Tarifa de envío creada exitosamente."
     *         tarifa_envio:
     *           $ref: '#/components/schemas/TarifaEnvio'
     *     UpdateTarifaEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Tarifa de envío actualizada correctamente."
     *         tarifa_envio:
     *           $ref: '#/components/schemas/TarifaEnvio'
     *     CalculateEnvioItem:
     *       type: object
     *       properties:
     *         cantidad:
     *           type: integer
     *           example: 2
     *         alto:
     *           type: number
     *           format: float
     *           description: "cm"
     *           example: 20
     *         ancho:
     *           type: number
     *           format: float
     *           description: "cm"
     *           example: 15
     *         largo:
     *           type: number
     *           format: float
     *           description: "cm"
     *           example: 30
     *         peso:
     *           type: number
     *           format: float
     *           description: "kg"
     *           example: 1.2
     *         precio:
     *           type: number
     *           format: float
     *           description: "precio del artículo (para descuentos)"
     *           example: 200
     *         fragil:
     *           type: boolean
     *           example: false
     *     CalculateEnvioInput:
     *       type: object
     *       required:
     *         - items
     *       properties:
     *         items:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/CalculateEnvioItem'
     *         envio:
     *           type: object
     *           properties:
     *             distance_km:
     *               type: number
     *               format: float
     *               description: "Distancia directa en km (opcional si envías coordenadas)"
     *             origen_lat:
     *               type: number
     *               format: float
     *             origen_lng:
     *               type: number
     *               format: float
     *             destino_lat:
     *               type: number
     *               format: float
     *             destino_lng:
     *               type: number
     *               format: float
     *             rural:
     *               type: boolean
     *               description: "Aplica recargo rural si es true"
     *     CalculateEnvioDetalle:
     *       type: object
     *       properties:
     *         item:
     *           type: object
     *           description: "Item original con cantidad normalizada"
     *         medidas:
     *           type: object
     *           properties:
     *             dimensiones:
     *               type: object
     *               properties:
     *                 alto_cm:
     *                   type: number
     *                 ancho_cm:
     *                   type: number
     *                 largo_cm:
     *                   type: number
     *             volumen_cm3:
     *               type: number
     *         pesos:
     *           type: object
     *           properties:
     *             real_kg:
     *               type: number
     *             volumetrico_kg:
     *               type: number
     *             tarifable_kg:
     *               type: number
     *         tramo_usado:
     *           type: object
     *           properties:
     *             id_tarifa:
     *               type: integer
     *             peso_minimo:
     *               type: number
     *             peso_maximo:
     *               type: number
     *             volumen_min:
     *               type: number
     *             volumen_max:
     *               type: number
     *             costo_base:
     *               type: number
     *         costos:
     *           type: object
     *           properties:
     *             unitario_envio_base:
     *               type: number
     *             total_item_base:
     *               type: number
     *             recargo_distancia_item:
     *               type: number
     *             costo_base_envio_item:
     *               type: number
     *             descuento_envio_item:
     *               type: number
     *             total_item:
     *               type: number
     *     CalculateEnvioResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           example: "Tarifa de envío calculada correctamente."
     *         total_envio:
     *           type: number
     *         moneda:
     *           type: string
     *           example: "Q"
     *         distancia_km:
     *           type: number
     *         recargo_distancia_total:
     *           type: number
     *         costo_base_envio_unico:
     *           type: number
     *         rural:
     *           type: boolean
     *         subtotal_mercaderia:
     *           type: number
     *         descuento_por_envio_pct:
     *           type: number
     *         descuento_por_envio_total:
     *           type: number
     *         detalle:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/CalculateEnvioDetalle'
     */

    /**
     * @openapi
     * /envio-service/tarifa_envio:
     *   post:
     *     summary: Crear un nuevo tramo de tarifa de envío
     *     tags:
     *       - Tarifa de Envío
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateTarifaEnvioInput'
     *     responses:
     *       201:
     *         description: Creado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CreateTarifaEnvioResponse'
     *       400:
     *         description: Validación fallida (rango peso/volumen o campos faltantes)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       500:
     *         description: Error al crear la tarifa de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     */
    this.router.post("/", this.controller.createTarifa_envio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/tarifa_envio:
     *   get:
     *     summary: Listar todos los tramos de tarifa
     *     tags:
     *       - Tarifa de Envío
     *     security: []
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TarifaEnvio'
     *       500:
     *         description: Error al obtener las tarifas de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     */
    this.router.get("/", this.controller.getTarifa_envios.bind(this.controller));

    /**
     * @openapi
     * /envio-service/tarifa_envio/{id}:
     *   get:
     *     summary: Obtener un tramo de tarifa por ID
     *     tags:
     *       - Tarifa de Envío
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TarifaEnvio'
     *       404:
     *         description: No encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       500:
     *         description: Error al obtener la tarifa de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     */
    this.router.get("/:id", this.controller.getTarifa_envioById.bind(this.controller));

    /**
     * @openapi
     * /envio-service/tarifa_envio/{id}:
     *   put:
     *     summary: Actualizar un tramo de tarifa por ID
     *     tags:
     *       - Tarifa de Envío
     *     security: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateTarifaEnvioInput'
     *     responses:
     *       200:
     *         description: Actualizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UpdateTarifaEnvioResponse'
     *       400:
     *         description: Validación fallida (rango peso/volumen)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       404:
     *         description: No encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       500:
     *         description: Error al actualizar la tarifa de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     */
    this.router.put("/:id", this.controller.updateTarifa_envio.bind(this.controller));

    /**
     * @openapi
     * /envio-service/tarifa_envio/calcular:
     *   post:
     *     summary: Calcular costo de envío para un carrito
     *     description: >-
     *       Reglas principales: DIM divisor configurable (SHIP_DIVISOR_DIM_CM), costo base + costo/km (SHIP_BASE y SHIP_COST_PER_KM) con mínimo de km (SHIP_MIN_KM),
     *       recargo rural (SHIP_RURAL_SURCHARGE_PCT) y descuentos por subtotal (SHIP_DISCOUNT_TIERS).
     *     tags:
     *       - Tarifa de Envío
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CalculateEnvioInput'
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CalculateEnvioResponse'
     *       400:
     *         description: Debe enviar items con al menos un elemento
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       404:
     *         description: No hay tramos de tarifa configurados o no existe una tarifa que cubra un ítem
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       500:
     *         description: Error al calcular la tarifa de envío
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     */
    this.router.post("/calcular", this.controller.calcularEnvio.bind(this.controller));
  }
}

module.exports = Tarifa_envioRoute;
