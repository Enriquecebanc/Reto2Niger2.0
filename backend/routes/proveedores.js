import express from "express";
import Proveedor from "../models/Proveedor.js";

const router = express.Router();

/* 
   GET /proveedores 
  Obtiene todos los proveedores (incluyendo sus productos)
*/
router.get("/", async (req, res) => {
  try {
    const proveedores = await Proveedor.find().populate("productos.pieza_id");
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 
   POST /proveedores 
  Crea un nuevo proveedor
  
*/
router.post("/", async (req, res) => {
  try {
    console.log('POST /proveedores - body recibido:', req.body);
    const proveedor = new Proveedor(req.body);
    await proveedor.save();
    console.log('POST /proveedores - creado:', proveedor);
    res.status(201).json(proveedor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*
   GET /proveedores/:id 
  Obtener un proveedor específico por ID
*/
router.get("/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id).populate("productos.pieza_id");
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json(proveedor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
   PUT /proveedores/:id 
  Actualizar un proveedor existente
*/
router.put("/:id", async (req, res) => {
  try {
    console.log(`PUT /proveedores/${req.params.id} - body recibido:`, req.body);
    const proveedor = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    console.log(`PUT /proveedores/${req.params.id} - actualizado:`, proveedor);
    res.json(proveedor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*
   DELETE /proveedores/:id 
  Eliminar un proveedor
*/
router.delete("/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
