import express from "express";
import Fabricacion from "../models/Fabricacion.js";
import Stock from "../models/Stock.js";

const router = express.Router();

// Materiales por maceta (objeto nombre+cantidad)
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
    const fabricaciones = await Fabricacion.find(); // el pre-hook hará el populate
    res.json(fabricaciones);
  } catch (err) {
    console.error("GET /fabricaciones error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET por id
router.get("/:id", async (req, res) => {
  try {
    const fabricacion = await Fabricacion.findById(req.params.id); // pre-hook activa populate
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
    console.log("POST /fabricaciones body:", req.body);

    const { producto } = req.body;
    if (!producto) {
      console.error("POST error: falta campo 'producto'");
      return res.status(400).json({ error: "Falta campo 'producto' en body" });
    }

    if (!materialesPorMaceta[producto]) {
      console.error("POST error: tipo de maceta no válido:", producto);
      return res.status(400).json({ error: "Tipo de maceta no válido" });
    }

    const materiales = [];

    for (const { nombre, cantidad } of materialesPorMaceta[producto]) {
      console.log("Buscando stock para:", nombre, "cantidad:", cantidad);
      const stockItem = await Stock.findOne({ nombre });
      console.log("stockItem encontrado:", stockItem);

      if (!stockItem) {
        console.error("No existe en stock:", nombre);
        return res.status(400).json({ error: `No hay stock del material: ${nombre}` });
      }

      if (stockItem.cantidad < cantidad) {
        console.error("Stock insuficiente para:", nombre, "necesita:", cantidad, "tiene:", stockItem.cantidad);
        return res.status(400).json({ error: `No hay suficiente stock de ${nombre}` });
      }

      stockItem.cantidad -= cantidad;
      await stockItem.save();
      materiales.push({ id_pieza: stockItem._id, cantidad });
    }

    const nuevaFabricacion = new Fabricacion({
      producto,
      materiales,
      fecha_inicio: new Date(),
      estado: "Pendiente"
    });

    console.log("Guardando nuevaFabricacion:", nuevaFabricacion);
    await nuevaFabricacion.save();

    // Leerla otra vez para que se aplique el populate del pre-hook
    const fabricacionPopulada = await Fabricacion.findById(nuevaFabricacion._id);
    console.log("Fabricacion creada y poblada:", fabricacionPopulada);

    return res.status(201).json(fabricacionPopulada);
  } catch (err) {
    console.error("POST /fabricaciones EXCEPTION:", err);
    return res.status(500).json({ error: err.message || "Error inesperado" });
  }
});

router.get("/debug/stock", async (req, res) => {
  const all = await Stock.find().limit(50);
  res.json(all);
});


// PUT actualizar fabricación y manejar fecha_fin
router.put("/:id", async (req, res) => {
  try {
    const { estado } = req.body;
    const updateData = { ...req.body };

    if (estado === "Finalizado") {
      updateData.fecha_fin = new Date();
    }

    // Usar findByIdAndUpdate pero luego reconsultar para activar pre-hook
    const updated = await Fabricacion.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) return res.status(404).json({ message: "Fabricación no encontrada" });

    const fabricacionActualizada = await Fabricacion.findById(req.params.id);
    res.json(fabricacionActualizada);
  } catch (err) {
    console.error("PUT /fabricaciones/:id error:", err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const fabricacionEliminada = await Fabricacion.findByIdAndDelete(req.params.id);
    if (!fabricacionEliminada) return res.status(404).json({ message: "Fabricación no encontrada" });
    res.json({ message: "Fabricación eliminada correctamente" });
  } catch (err) {
    console.error("DELETE /fabricaciones/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
