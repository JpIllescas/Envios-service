const express = require('express');
const cors = require('cors');
const { APP_PORT, FRONTEND_URL } = require('./src/config/config.js');
const db = require('./src/models/index.js'); 
const EnvioRoute = require('./src/routes/envio.route.js');
const Tarifa_envioRoute = require('./src/routes/tarifa_envio.route.js');
const Estado_envioRoute = require('./src/routes/estado_envio.route.js');
const Envio_productoRoute = require('./src/routes/envio_producto.route.js');
  
class Server {
  constructor() {
    this.app = express();
    this.port = APP_PORT;

    // Middlewares principales
    this.app.use(express.json()); 
    this.configureMiddlewares();
    this.configureRoutes();
    this.connectDatabase();
  }

  configureMiddlewares() {
    this.app.use(cors({
      origin: FRONTEND_URL,
      credentials: true 
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
    });
  }
}

const server = new Server();
server.start();
