import express from "express";
import Fabricacion from "../models/Fabricacion.js";
import Stock from "../models/Stock.js";

const router = express.Router();

// Definición correcta de materiales
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

// --------------------------------------------------------
// ✅ POST: Crear una fabricación
// --------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { producto } = req.body;

    if (!materialesPorMaceta[producto]) {
      return res.status(400).json({ error: "Producto no válido" });
    }

    const materiales = [];

    // Descontar stock
    for (const { nombre, cantidad } of materialesPorMaceta[producto]) {
      const stockItem = await Stock.findOne({ nombre });

      if (!stockItem) {
        return res.status(400).json({ error: `No existe en stock: ${nombre}` });
      }

      if (stockItem.cantidad < cantidad) {
        return res.status(400).json({ error: `No hay suficiente stock de ${nombre}` });
      }

      stockItem.cantidad -= cantidad;
      await stockItem.save();

      materiales.push({
        id_pieza: stockItem._id,
        cantidad
      });
    }

    const nuevaFabricacion = new Fabricacion({
      producto,
      fecha_inicio: new Date(),
      estado: "En proceso",
      materiales
    });

    await nuevaFabricacion.save();

    res.status(201).json(nuevaFabricacion);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear fabricación" });
  }
});

// --------------------------------------------------------
// ✅ GET: Obtener todas las fabricaciones (incluye populate)
// --------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const fabricaciones = await Fabricacion.find()
      .populate("materiales.id_pieza");

    res.json(fabricaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener fabricaciones" });
  }
});

// --------------------------------------------------------
// ✅ PUT: Cambiar estado + fecha de fin automática
// --------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { estado } = req.body;

    const fabricacion = await Fabricacion.findById(req.params.id);

    if (!fabricacion) {
      return res.status(404).json({ error: "Fabricación no encontrada" });
    }

    fabricacion.estado = estado;

    if (estado === "Finalizado") {
      fabricacion.fecha_fin = new Date();
    }

    await fabricacion.save();

    res.json(fabricacion);

  } catch (error) {
    res.status(500).json({ error: "Error al actualizar fabricación" });
  }
});

export default router;
