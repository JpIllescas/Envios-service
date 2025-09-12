const { Model, DataTypes } = require('sequelize');

class Tarifa_envio extends Model {
}

module.exports = (sequelize) => {
  Tarifa_envio.init(
    {
      id_tarifa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      peso_minimo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      peso_maximo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      volumen_min: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      volumen_max: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },      
      costo_base: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      }
      
    },
    {
      sequelize,
      modelName: 'tarifa_envio',
      tableName: 'tarifa_envios',
      timestamps: true,
    }
  );
  return Tarifa_envio;
};
