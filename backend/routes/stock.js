import express from "express";
import Stock from "../models/Stock.js";

const router = express.Router();

// ✅ GET: Obtener todos los productos en stock
router.get("/", async (req, res) => {
  try {
    // Populate del proveedor para ver sus datos asociados
    const stock = await Stock.find().populate("proveedor_id", "nombre correo");
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: Obtener un producto de stock por ID
router.get("/:id", async (req, res) => {
  try {
    const producto = await Stock.findById(req.params.id).populate("proveedor_id", "nombre correo");
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST: Crear un nuevo producto en stock
router.post("/", async (req, res) => {
  try {
    const nuevoProducto = new Stock(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ PUT: Actualizar un producto existente
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ DELETE: Eliminar un producto del stock
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await Stock.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
