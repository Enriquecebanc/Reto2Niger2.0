import express from "express";
import Factura from "../models/Factura.js";

const router = express.Router();

// GET todas las facturas
router.get("/", async (req, res) => {
  try {
    // Obtener facturas sin populate primero
    const facturas = await Factura.find().lean();
    console.log('GET facturas - Total:', facturas.length);
    if (facturas.length > 0) {
      console.log('Primera factura con ventas_ids:', facturas[0].ventas_ids);
    }
    
    res.json(facturas);
  } catch (err) {
    console.error('Error en GET /facturas:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET factura por ID
router.get("/:id", async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id)
      .populate({
        path: 'ventas_ids',
        populate: [
          { path: 'producto_id' },
          { path: 'cliente_id' }
        ]
      });
    if (!factura) return res.status(404).json({ message: "Factura no encontrada" });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear nueva factura
router.post("/", async (req, res) => {
  try {
    console.log('========================================');
    console.log('Recibiendo factura:', JSON.stringify(req.body, null, 2));
    console.log('ventas_ids recibidos:', req.body.ventas_ids);
    
    const nuevaFactura = new Factura(req.body);
    await nuevaFactura.save();
    console.log('Factura guardada con ventas_ids:', nuevaFactura.ventas_ids);
    
    // Intentar populate, pero devolver la factura original si falla
    try {
      const facturaCompleta = await Factura.findById(nuevaFactura._id)
        .populate({
          path: 'ventas_ids',
          populate: [
            { path: 'producto_id' },
            { path: 'cliente_id' }
          ]
        });
      
      console.log('Factura con populate:', facturaCompleta);
      console.log('ventas_ids después de populate:', facturaCompleta.ventas_ids);
      
      // Si el populate dejó vacío el array, devolver la factura sin populate
      if (facturaCompleta.ventas_ids.length === 0 && nuevaFactura.ventas_ids.length > 0) {
        console.log('⚠️ Populate falló, devolviendo factura sin populate');
        const ventasRaw = await Factura.findById(nuevaFactura._id).lean();
        console.log('Factura sin populate (lean):', ventasRaw);
        console.log('========================================');
        return res.status(201).json(ventasRaw);
      }
      
      console.log('========================================');
      res.status(201).json(facturaCompleta);
    } catch (populateError) {
      console.error('Error en populate:', populateError);
      console.log('Devolviendo factura sin populate');
      console.log('========================================');
      res.status(201).json(nuevaFactura);
    }
  } catch (err) {
    console.error('Error creando factura:', err);
    console.error('Stack:', err.stack);
    console.log('========================================');
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
