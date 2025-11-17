import express from "express";
import Fabricacion from "../models/Fabricacion.js";
import Stock from "../models/Stock.js";

const router = express.Router();

const materialesPorMaceta = {
  "Maceta pequeña": [
    { nombre: "LED Rojo", cantidad: 2 },
    { nombre: "LED Verde", cantidad: 2 },
    { nombre: "LED Amarillo", cantidad: 2 },
    { nombre: "Maceta de plástico Pequeño", cantidad: 1 },
    { nombre: "Sensor de humedad", cantidad: 1 },
    { nombre: "Sensor de luz", cantidad: 1 },
    { nombre: "Batería", cantidad: 1 }
  ],
  "Maceta mediana": [
    { nombre: "LED Rojo", cantidad: 2 },
    { nombre: "LED Verde", cantidad: 2 },
    { nombre: "LED Amarillo", cantidad: 2 },
    { nombre: "Maceta de plástico Mediano", cantidad: 1 },
    { nombre: "Sensor de humedad", cantidad: 1 },
    { nombre: "Sensor de luz", cantidad: 1 },
    { nombre: "Batería", cantidad: 1 }
  ],
  "Maceta grande": [
    { nombre: "LED Rojo", cantidad: 2 },
    { nombre: "LED Verde", cantidad: 2 },
    { nombre: "LED Amarillo", cantidad: 2 },
    { nombre: "Maceta de plástico Grande", cantidad: 1 },
    { nombre: "Sensor de humedad", cantidad: 1 },
    { nombre: "Sensor de luz", cantidad: 1 },
    { nombre: "Batería", cantidad: 1 }
  ]
};

// GET todas las fabricaciones
router.get("/", async (req, res) => {
  try {
    const fabricaciones = await Fabricacion.find();
    res.json(fabricaciones);
  } catch (err) {
    console.error("GET /fabricaciones error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET por id
router.get("/:id", async (req, res) => {
  try {
    const fabricacion = await Fabricacion.findById(req.params.id);
    if (!fabricacion) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json(fabricacion);
  } catch (err) {
    console.error("GET /fabricaciones/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST crear nueva fabricación y descontar stock
router.post("/", async (req, res) => {
  try {
    const { producto } = req.body;
    if (!producto) {
      return res.status(400).json({ error: "Falta campo 'producto' en body" });
    }
    if (!materialesPorMaceta[producto]) {
      return res.status(400).json({ error: "Tipo de maceta no válido" });
    }

    const materiales = [];
    for (const { nombre, cantidad } of materialesPorMaceta[producto]) {
      const stockItems = await Stock.find({ nombre, cantidad: { $gt: 0 } });
      const totalCantidad = stockItems.reduce((acc, item) => acc + item.cantidad, 0);

      if (totalCantidad < cantidad) {
        return res.status(400).json({ error: `No hay suficiente stock de ${nombre}` });
      }

      let resta = cantidad;
      for (const item of stockItems) {
        if (resta === 0) break;
        const descontar = Math.min(item.cantidad, resta);
        item.cantidad -= descontar;
        resta -= descontar;
        await item.save(); // deja el doc aunque cantidad sea 0
        if (descontar > 0) {
          materiales.push({ nombre, cantidad: descontar });
        }
      }
    }

    const nuevaFabricacion = new Fabricacion({
      producto,
      materiales,
      fecha_inicio: new Date(),
      estado: "Pendiente"
    });

    await nuevaFabricacion.save();

    const fabricacionPopulada = await Fabricacion.findById(nuevaFabricacion._id);
    return res.status(201).json(fabricacionPopulada);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error inesperado" });
  }
});

// PUT actualizar fabricación y sumar maceta fabricada a stock con PRECIO correcto
router.put("/:id", async (req, res) => {
  try {
    const { estado } = req.body;
    const updateData = { ...req.body };

    if (estado === "Finalizado") {
      updateData.fecha_fin = new Date();

      const fabricacion = await Fabricacion.findById(req.params.id);
      if (!fabricacion) return res.status(404).json({ message: "Fabricación no encontrada" });

      const nombreMaceta = fabricacion.producto;
      let precio = 0;
      if (nombreMaceta === "Maceta pequeña") precio = 27;
      if (nombreMaceta === "Maceta mediana") precio = 34;
      if (nombreMaceta === "Maceta grande") precio = 40;

      let stockMaceta = await Stock.findOne({ nombre: nombreMaceta, tipo: "Maceta fabricada" });
      if (stockMaceta) {
        stockMaceta.cantidad += 1;
        stockMaceta.precio_unitario = precio;
        await stockMaceta.save();
      } else {
        stockMaceta = new Stock({
          nombre: nombreMaceta,
          tipo: "Maceta fabricada",
          cantidad: 1,
          precio_unitario: precio
        });
        await stockMaceta.save();
      }
    }

    const updated = await Fabricacion.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) return res.status(404).json({ message: "Fabricación no encontrada" });

    const fabricacionActualizada = await Fabricacion.findById(req.params.id);
    res.json(fabricacionActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const fabricacionEliminada = await Fabricacion.findByIdAndDelete(req.params.id);
    if (!fabricacionEliminada) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json({ message: "Fabricación eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de debug para stock
router.get("/debug/stock", async (req, res) => {
  const all = await Stock.find().limit(50);
  res.json(all);
});

export default router;