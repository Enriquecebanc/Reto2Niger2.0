import express from "express";
import Venta from "../models/Venta.js";

const router = express.Router();

//  GET todas las ventas
router.get("/", async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate("producto_id")   // información de la fabricación
      .populate("cliente_id");  // información del cliente
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  GET venta por ID
router.get("/:id", async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate("producto_id")
      .populate("cliente_id");
    if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  POST crear nueva venta
router.post("/", async (req, res) => {
  try {
    const nuevaVenta = new Venta(req.body);
    await nuevaVenta.save();
    res.status(201).json(nuevaVenta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  PUT actualizar venta
router.put("/:id", async (req, res) => {
  try {
    const ventaActualizada = await Venta.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ventaActualizada) return res.status(404).json({ message: "Venta no encontrada" });
    res.json(ventaActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  DELETE eliminar venta
router.delete("/:id", async (req, res) => {
  try {
    const ventaEliminada = await Venta.findByIdAndDelete(req.params.id);
    if (!ventaEliminada) return res.status(404).json({ message: "Venta no encontrada" });
    res.json({ message: "Venta eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
