const { Model, DataTypes } = require('sequelize');

class Envio_producto extends Model {
}

module.exports = (sequelize) => {
  Envio_producto.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_envio: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
      }      
    },
    {
      sequelize,
      modelName: 'envio_producto',
      tableName: 'envio_productos',
      timestamps: true,
    }
  );
  return Envio_producto;
};
