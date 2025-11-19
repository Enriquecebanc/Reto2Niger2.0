import express from 'express';
import Venta from '../models/Venta.js';
import Stock from '../models/Stock.js';

const router = express.Router();

// GET todas las ventas
router.get('/', async (req, res) => {
    try {
        const ventas = await Venta.find();
        console.log('GET /ventas - Devolviendo', ventas.length, 'ventas');
        res.json(ventas);
    } catch (err) {
        console.error('Error GET /ventas:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST crear nueva venta
router.post('/', async (req, res) => {
    console.log('POST /ventas - Recibido:', req.body);
    
    const { cliente, tipo_maceta, cantidad, precio_unitario, metodo_pago, fecha_venta } = req.body;

    // Validar campos obligatorios
    if (!cliente || !tipo_maceta || cantidad === undefined || !precio_unitario || !metodo_pago) {
        console.error('Campos faltantes');
        return res.status(400).json({ 
            message: 'Faltan campos: cliente, tipo_maceta, cantidad, precio_unitario, metodo_pago' 
        });
    }

    try {
        // Mapear el tipo de maceta al nombre en el inventario
        const nombreMap = {
            'Pequeña': 'Maceta pequeña',
            'Mediana': 'Maceta mediana',
            'Grande': 'Maceta grande'
        };
        
        const nombreProducto = nombreMap[tipo_maceta];
        if (!nombreProducto) {
            return res.status(400).json({ 
                message: `Tipo de maceta no válido: '${tipo_maceta}'` 
            });
        }

        // Verificar que hay suficiente stock (buscar todos los registros con ese nombre)
        const macetasEnStock = await Stock.find({ 
            nombre: { $regex: new RegExp(`^${nombreProducto}$`, 'i') }
        });

        if (!macetasEnStock || macetasEnStock.length === 0) {
            return res.status(400).json({ 
                message: `No se encontró el producto '${nombreProducto}' en el inventario` 
            });
        }

        // Sumar todas las cantidades disponibles
        const cantidadTotal = macetasEnStock.reduce((sum, item) => sum + item.cantidad, 0);

        if (cantidadTotal < cantidad) {
            return res.status(400).json({ 
                message: `Stock insuficiente. Disponible: ${cantidadTotal}, Solicitado: ${cantidad}` 
            });
        }

        // Calcular total
        const total = Number(cantidad) * Number(precio_unitario);

        // Crear la venta
        const nuevaVenta = new Venta({
            cliente,
            tipo_maceta,
            cantidad: Number(cantidad),
            precio_unitario: Number(precio_unitario),
            total,
            metodo_pago,
            fecha_venta: fecha_venta ? new Date(fecha_venta) : new Date()
        });

        const ventaGuardada = await nuevaVenta.save();
        console.log('Venta guardada en BD:', ventaGuardada);

        // Restar del stock - ir restando de los registros disponibles
        let cantidadRestante = Number(cantidad);
        for (const maceta of macetasEnStock) {
            if (cantidadRestante <= 0) break;
            
            if (maceta.cantidad >= cantidadRestante) {
                // Este registro tiene suficiente para cubrir lo que falta
                maceta.cantidad -= cantidadRestante;
                if (maceta.cantidad === 0) {
                    // Si la cantidad llega a 0, eliminar el registro
                    await Stock.findByIdAndDelete(maceta._id);
                    console.log(`Stock eliminado: ${maceta.nombre} (ID: ${maceta._id})`);
                } else {
                    await maceta.save();
                    console.log(`Stock actualizado: ${maceta.nombre} (ID: ${maceta._id}) - Nueva cantidad: ${maceta.cantidad}`);
                }
                cantidadRestante = 0;
            } else {
                // Este registro no tiene suficiente, usar todo y eliminarlo
                cantidadRestante -= maceta.cantidad;
                await Stock.findByIdAndDelete(maceta._id);
                console.log(`Stock eliminado: ${maceta.nombre} (ID: ${maceta._id}) - cantidad agotada`);
            }
        }

        res.status(201).json(ventaGuardada);
    } catch (err) {
        console.error('Error POST /ventas:', err);
        res.status(400).json({ message: err.message });
    }
});

// PUT actualizar venta
router.put('/:id', async (req, res) => {
    console.log('PUT /ventas/:id - ID:', req.params.id, 'Body:', req.body);
    
    try {
        const venta = await Venta.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!venta) {
            console.error('Venta no encontrada:', req.params.id);
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        console.log('Venta actualizada:', venta);
        res.json(venta);
    } catch (err) {
        console.error('Error PUT /ventas/:id:', err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE eliminar venta
router.delete('/:id', async (req, res) => {
    console.log('DELETE /ventas/:id - ID:', req.params.id);
    
    try {
        const venta = await Venta.findByIdAndDelete(req.params.id);

        if (!venta) {
            console.error('Venta no encontrada:', req.params.id);
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        console.log('Venta eliminada');
        res.json({ message: 'Venta eliminada correctamente' });
    } catch (err) {
        console.error('Error DELETE /ventas/:id:', err);
        res.status(400).json({ message: err.message });
    }
});

export default router;
