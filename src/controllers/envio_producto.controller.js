const db = require("../models");
const Envio_producto = db.getModel("Envio_producto");

class Envio_productoController {
  // Crear un nuevo envio_producto
  async createEnvio_producto(req, res) {
    const { id_envio, id_producto, cantidad } = req.body;

    if (!id_envio || !id_producto || !cantidad) {
      return res.status(400).send({ message: "Todos los campos son obligatorios." });
    }

    if (isNaN(cantidad) || Number(cantidad) <= 0) {
      return res.status(400).send({ message: "La cantidad debe ser un número positivo." });
    }

    // Validar que el envío exista
    const envio = await Envio.findByPk(id_envio);
    if (!envio) {
      return res.status(404).send({ message: "El envío especificado no existe." });
    }

    try {
      const nuevoEnvioProducto = await Envio_producto.create({
        id_envio,
        id_producto,
        cantidad
      });
      res.status(201).send({
        message: "Producto agregado al envío exitosamente.",
        envio_producto: nuevoEnvioProducto
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al agregar el producto al envío." });
    }
  }

  // Obtener todos los envio_productos
  async getEnvio_productos(req, res) {
    try {
      const envioProductos = await Envio_producto.findAll();
      res.send(envioProductos);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener los productos de los envíos." });
    }
  }

  // Obtener todos los productos de un envío específico
  async getEnvio_productosByEnvio(req, res) {
    const { id_envio } = req.params;
    try {
      const productos = await Envio_producto.findAll({ where: { id_envio } });
      res.send(productos);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener los productos del envío." });
    }
  }

  // Obtener un envio_producto por ID
  async getEnvio_productoById(req, res) {
    const { id } = req.params;
    try {
      const envioProducto = await Envio_producto.findByPk(id);
      if (!envioProducto) {
        return res.status(404).send({ message: "Envío-producto no encontrado." });
      }
      res.send(envioProducto);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener el producto del envío." });
    }
  }

  // Actualizar un envio_producto
  async updateEnvio_producto(req, res) {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) {
      return res.status(400).send({ message: "La cantidad debe ser un número positivo." });
    }

    try {
      const envioProducto = await Envio_producto.findByPk(id);
      if (!envioProducto) {
        return res.status(404).send({ message: "Envío-producto no encontrado." });
      }

      envioProducto.cantidad = cantidad;
      await envioProducto.save();

      res.send({
        message: "Cantidad actualizada correctamente.",
        envio_producto: envioProducto
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al actualizar el producto del envío." });
    }
  }

  // Eliminar un envio_producto
  async deleteEnvio_producto(req, res) {
    const { id } = req.params;
    try {
      const envioProducto = await Envio_producto.findByPk(id);
      if (!envioProducto) {
        return res.status(404).send({ message: "Envío-producto no encontrado." });
      }
      await envioProducto.destroy();
      res.send({ message: "Producto eliminado del envío exitosamente." });
    } catch (err) {
      res.status(500).send({ message: "Error al eliminar el producto del envío." });
    }
  }
}

module.exports = Envio_productoController;