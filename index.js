// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PORT, FRONTEND_URL } = require('./src/config/config.js');
const db = require('./src/models/index.js');

const EnvioRoute = require('./src/routes/envio.route.js');
const Tarifa_envioRoute = require('./src/routes/tarifa_envio.route.js');
const Estado_envioRoute = require('./src/routes/estado_envio.route.js');
const Envio_productoRoute = require('./src/routes/envio_producto.route.js');

const swaggerJsdoc = require('swagger-jsdoc');
const { apiReference } = require('@scalar/express-api-reference');

class Server {
  constructor() {
    this.app = express();
    this.port = PORT;

    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.configureMiddlewares();
    this.configureOpenAPI();  
    this.configureRoutes();
    this.connectDatabase();
  }

  configureMiddlewares() {
    this.app.use(cors({
      origin: FRONTEND_URL,     
      credentials: true,        
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization']
    }));
  }

  configureOpenAPI() {
    const openapiDefinition = {
      openapi: '3.0.3',
      info: {
        title: 'Envio Service',
        version: '1.0.0',
        description: 'Servicios de envíos, tarifas y estados',
      },
      servers: [
        { url:`http://localhost:${this.port}` },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          cookieAuth: { type: 'apiKey', in: 'cookie', name: 'access_token' },
        },
      },
      security: [{ cookieAuth: [] }],
    };

    const openapi = swaggerJsdoc({
      definition: openapiDefinition,
      apis: [
        './src/routes/**/*.js',
        './src/routes/*.js',
      ],
    });

    this.app.get('/health', (_req, res) => res.json({ ok: true }));

    this.app.get('/openapi.json', (_req, res) => res.json(openapi));
    this.app.use('/docs', apiReference({
      url: '/openapi.json',
      theme: 'purple',
      layout: 'modern',
    }));
  }

  configureRoutes() {
    new EnvioRoute(this.app);
    new Estado_envioRoute(this.app);
    new Tarifa_envioRoute(this.app);
    new Envio_productoRoute(this.app);
  }

  async connectDatabase() {
    try {
      await db.sequelize.sync({ alter: true });
      console.log('Base de datos conectada y sincronizada.');

      const tables = await db.sequelize.getQueryInterface().showAllTables();
      console.log('Tablas en la base de datos:', tables);
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
      console.log(`Docs: http://localhost:${this.port}/docs`);
    });
  }
}

const server = new Server();
server.start();
