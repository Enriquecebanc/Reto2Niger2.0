import express from "express";
import Fabricacion from "../models/Fabricacion.js";
import Stock from "../models/Stock.js";

const router = express.Router();

// Lista de materiales por tipo de maceta
const materialesPorMaceta = {
  "Maceta pequeña": [
    "LED Rojo: 2",
    "LED Verde: 2",
    "LED Amarillo: 2",
    "Maceta de plástico Pequeño",
    "Sensor de humedad",
    "Sensor de luz",
    "Batería"
  ],
  "Maceta mediana": [
    "LED Rojo: 2",
    "LED Verde: 2",
    "LED Amarillo: 2",
    "Maceta de plástico Mediano",
    "Sensor de humedad",
    "Sensor de luz",
    "Batería"
  ],
  "Maceta grande": [
    "LED Rojo: 2",
    "LED Verde: 2",
    "LED Amarillo: 2",
    "Maceta de plástico Grande",
    "Sensor de humedad",
    "Sensor de luz",
    "Batería"
  ]
};

// GET todas las fabricaciones
router.get("/", async (req, res) => {
  try {
    const fabricaciones = await Fabricacion.find()
      .populate({
        path: "materiales.id_pieza",
        select: "nombre precio_unitario"
      })
      .lean();

    res.json(fabricaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET fabricación por ID
router.get("/:id", async (req, res) => {
  try {
    const fabricacion = await Fabricacion.findById(req.params.id)
      .populate({ path: "materiales.id_pieza", select: "nombre precio_unitario" })
      .lean();
    if (!fabricacion) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json(fabricacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear nueva fabricación y descontar stock
router.post("/", async (req, res) => {
  try {
    const { producto } = req.body;

    if (!materialesPorMaceta[producto]) {
      return res.status(400).json({ error: "Tipo de maceta no válido" });
    }

    const materiales = [];
    for (const mat of materialesPorMaceta[producto]) {
      let nombre = mat;
      let cantidad = 1;

      if (mat.includes(":")) {
        const [n, c] = mat.split(":").map(s => s.trim());
        nombre = n;
        cantidad = parseInt(c);
      }

      const stockItem = await Stock.findOne({ nombre });
      if (!stockItem) return res.status(400).json({ error: `No hay stock del material: ${nombre}` });
      if (stockItem.cantidad < cantidad) return res.status(400).json({ error: `No hay suficiente stock de ${nombre}` });

      stockItem.cantidad -= cantidad;
      await stockItem.save();

      materiales.push({ id_pieza: stockItem._id, cantidad });
    }

    const nuevaFabricacion = new Fabricacion({ producto, materiales, estado: "Pendiente" });
    await nuevaFabricacion.save();

    const fabricacionPopulada = await Fabricacion.findById(nuevaFabricacion._id).populate("materiales.id_pieza");
    res.status(201).json(fabricacionPopulada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar fabricación y manejar fecha_fin
router.put("/:id", async (req, res) => {
  try {
    const { estado } = req.body;
    const updateData = { ...req.body };

    if (estado === "Finalizado") {
      updateData.fecha_fin = new Date();
    }

    const fabricacionActualizada = await Fabricacion.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("materiales.id_pieza");
    if (!fabricacionActualizada) return res.status(404).json({ message: "Fabricación no encontrada" });

    res.json(fabricacionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE eliminar fabricación
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
