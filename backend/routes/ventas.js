import express from 'express';
import mongoose from 'mongoose';
import Venta from '../models/Venta.js';

const router = express.Router();

// Obtener todas las ventas
router.get('/', async (req, res) => {
    try {
        const ventas = await Venta.find();
        res.json(ventas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear nueva venta
router.post('/', async (req, res) => {
    const { cliente, tamaño, producto, precio } = req.body;

    if (!cliente || !tamaño) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const nuevaVenta = new Venta({
        cliente,
        tamaño,
        producto,
        precio
    });

    try {
        const ventaGuardada = await nuevaVenta.save();
        res.status(201).json(ventaGuardada);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Actualizar una venta
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id.trim();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        
        const db = mongoose.connection.db;
        const collection = db.collection('ventas');
        const todosLosDocs = await collection.find({}).toArray();
        
        const docEncontrado = todosLosDocs.find(doc => doc._id.toString() === id);
        
        if (docEncontrado) {
            const updateData = {};
            if (req.body.cliente !== undefined) updateData.cliente = req.body.cliente;
            if (req.body.cantidad !== undefined) updateData.cantidad = req.body.cantidad;
            if (req.body.tamaño !== undefined) updateData.tamaño = req.body.tamaño;
            if (req.body.producto !== undefined) updateData.producto = req.body.producto;
            if (req.body.precio !== undefined) updateData.precio = req.body.precio;
            
            const resultUpdate = await collection.updateOne(
                { _id: docEncontrado._id },
                { $set: updateData }
            );
            
            if (resultUpdate.modifiedCount > 0 || resultUpdate.matchedCount > 0) {
                const ventaActualizada = await collection.findOne({ _id: docEncontrado._id });
                return res.json(ventaActualizada);
            }
        }
        
        return res.status(404).json({ message: "Venta no encontrada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id.trim();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        
        const db = mongoose.connection.db;
        const collection = db.collection('ventas');
        const todosLosDocs = await collection.find({}).toArray();
        
        const docEncontrado = todosLosDocs.find(doc => doc._id.toString() === id);
        
        if (docEncontrado) {
            const resultDelete = await collection.deleteOne({ _id: docEncontrado._id });
            
            if (resultDelete.deletedCount > 0) {
                return res.json({ message: "Venta eliminada correctamente" });
            }
        }
        
        return res.status(404).json({ message: "Venta no encontrada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
