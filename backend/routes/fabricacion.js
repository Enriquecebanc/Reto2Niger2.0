import express from "express";
import Fabricacion from "../models/Fabricacion.js";

const router = express.Router();

//  GET todas las fabricaciones
router.get("/", async (req, res) => {
  try {
    const fabricaciones = await Fabricacion.find().populate("materiales.id_pieza");
    res.json(fabricaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  GET fabricación por ID
router.get("/:id", async (req, res) => {
  try {
    const fabricacion = await Fabricacion.findById(req.params.id).populate("materiales.id_pieza");
    if (!fabricacion) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json(fabricacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  POST crear nueva fabricación
router.post("/", async (req, res) => {
  try {
    const nuevaFabricacion = new Fabricacion(req.body);
    await nuevaFabricacion.save();
    res.status(201).json(nuevaFabricacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  PUT actualizar fabricación
router.put("/:id", async (req, res) => {
  try {
    const fabricacionActualizada = await Fabricacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fabricacionActualizada) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json(fabricacionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  DELETE eliminar fabricación
router.delete("/:id", async (req, res) => {
  try {
    const fabricacionEliminada = await Fabricacion.findByIdAndDelete(req.params.id);
    if (!fabricacionEliminada) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json({ message: "Fabricación eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
