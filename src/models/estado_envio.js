const { Model, DataTypes } = require('sequelize');

class Estado_envio extends Model {
}

module.exports = (sequelize) => {
  Estado_envio.init(
    {
      id_estado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_envio: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      estado: {
        type: DataTypes.VARCHAR(50),
        defaultValue: 'pendiente',
        validate: {
          isIn: [['pendiente', 'en_transito', 'recolectado', 'entregado', 'en_bodega']],}
      }      
    },
    {
      sequelize,
      modelName: 'estado_envio',
      tableName: 'estado_envios',
      timestamps: true,
    }
  );
  return Estado_envio;
};
