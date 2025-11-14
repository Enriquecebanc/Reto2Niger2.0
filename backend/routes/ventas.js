import express from 'express';
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

export default router;
