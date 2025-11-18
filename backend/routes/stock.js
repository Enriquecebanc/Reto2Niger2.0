import express from "express";
import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Proveedor from "../models/Proveedor.js";

const router = express.Router();



//  GET: Obtener un producto de stock por ID
router.get("/:id", async (req, res) => {
  try {
    const producto = await Stock.findById(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    // Buscar proveedor
    const proveedor = await Proveedor.findOne({
      tipoProducto: producto.tipo
    });

    res.json({
      ...producto.toObject(),
      proveedor_nombre: proveedor ? proveedor.nombre : "Sin proveedor"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  POST: Crear un nuevo producto en stock
router.post("/", async (req, res) => {
  try {
    const nuevoProducto = new Stock(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  PUT: Actualizar un producto existente
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  DELETE: Eliminar un producto del stock
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const result = await Stock.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      return res.json({ message: "Producto eliminado correctamente" });
    } else {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  GET: Obtener todos los productos en stock con nombre del proveedor
router.get("/", async (req, res) => {
  try {
    const stock = await Stock.find();
    const proveedores = await Proveedor.find();

    const stockConProveedor = stock.map((item) => {
      const proveedor = proveedores.find(
      (prov) => prov.tipoProducto?.toLowerCase() === item.nombre?.toLowerCase()
    );

      return {
        ...item.toObject(),
        proveedor_nombre: proveedor ? proveedor.nombre : "Sin proveedor"
      };
    });

    res.json(stockConProveedor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
