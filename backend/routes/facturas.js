import express from "express";
import Factura from "../models/Factura.js";

const router = express.Router();

// GET todas las facturas
router.get("/", async (req, res) => {
  try {
    const facturas = await Factura.find().populate("venta_id");
    res.json(facturas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET factura por ID
router.get("/:id", async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id).populate("venta_id");
    if (!factura) return res.status(404).json({ message: "Factura no encontrada" });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear nueva factura
router.post("/", async (req, res) => {
  try {
    const nuevaFactura = new Factura(req.body);
    await nuevaFactura.save();
    res.status(201).json(nuevaFactura);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT actualizar factura
router.put("/:id", async (req, res) => {
  try {
    const facturaActualizada = await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!facturaActualizada) return res.status(404).json({ message: "Factura no encontrada" });
    res.json(facturaActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE eliminar factura
router.delete("/:id", async (req, res) => {
  try {
    const facturaEliminada = await Factura.findByIdAndDelete(req.params.id);
    if (!facturaEliminada) return res.status(404).json({ message: "Factura no encontrada" });
    res.json({ message: "Factura eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
