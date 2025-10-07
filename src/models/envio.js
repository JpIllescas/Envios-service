const { Model, DataTypes } = require('sequelize');

class Envio extends Model {
}

module.exports = (sequelize) => {
  Envio.init(
    {
      id_envio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_usuario: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      numero_guia: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      direccion_destino: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      costo_envio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_estimada: {
        type: DataTypes.DATE,
        allowNull: true
      }
      
    },
    {
      sequelize,
      modelName: 'envio',
      tableName: 'envios',
      timestamps: true,
    }
  );
  return Envio;
};
