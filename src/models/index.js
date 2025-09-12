const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config.js');

class Database {
  constructor() {
    this._sequelize = new Sequelize(
      dbConfig.DB,
      dbConfig.USER,
      dbConfig.PASSWORD,
      {
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: dbConfig.dialect,
        pool: dbConfig.pool,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      }
    );

    this.Sequelize = Sequelize;
    this.models = {};

    this._loadModels();
    this._associateModels();
  }

  _loadModels() {
    const sequelize = this._sequelize;

    // Catálogos y productos
    this.models.Envio = require('./envio.js')(sequelize);
    this.models.Estado_envio = require('./estado_envio.js')(sequelize);
    this.models.Envio_producto = require('./envio_producto.js')(sequelize);
    this.models.Tarifa_envio = require('./tarifa_envio.js')(sequelize);
  }

  _associateModels() {
    const {
      Envio, Estado_envio, Envio_producto,
    } = this.models;

    // Estado envio ↔ Envio
    Envio.hasMany(Estado_envio, { foreignKey: 'id_envio', as: 'estados' });
    Estado_envio.belongsTo(Envio, { foreignKey: 'id_envio', as: 'envio' });

    // Envio producto ↔ Envio
    Envio.hasMany(Envio_producto, { foreignKey: 'id_envio', as: 'productos' });
    Envio_producto.belongsTo(Envio, { foreignKey: 'id_envio', as: 'envioproducto' });

  }

  get sequelize() {
    return this._sequelize;
  }

  getModel(name) {
    return this.models[name];
  }
}

module.exports = new Database();
