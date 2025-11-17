import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import clientesRouter from "./routes/clientes.js";
import proveedoresRouter from "./routes/proveedores.js";
import stockRouter from "./routes/stock.js";
import facturasRouter from "./routes/facturas.js";
import fabricacionRouter from "./routes/fabricacion.js";
import ventasRouter from "./routes/ventas.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mejor manejo de errores globales para capturar traces en la terminal
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION -', err && err.stack ? err.stack : err);
  // No cerramos inmediatamente para que el desarrollador vea el log, pero saldremos
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION - Promise:', promise, 'Reason:', reason && reason.stack ? reason.stack : reason);
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/niger';

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => {
    console.error("❌ Error al conectar a MongoDB:", err);
    // no hacemos process.exit para permitir poner la API arriba y mostrar errores
  });

// Rutas
  app.use("/clientes", clientesRouter);
  app.use("/proveedores", proveedoresRouter);
  app.use("/stock", stockRouter);
  app.use("/facturas", facturasRouter);
  app.use("/fabricaciones", fabricacionRouter);
  app.use("/ventas", ventasRouter);


// Endpoint temporal de prueba
app.get("/", (req, res) => {
  res.send("API ERP funcionando correctamente 🚀");
});

// Endpoint admin para ejecutar migración de proveedores desde la app
import Proveedor from './models/Proveedor.js';
app.post('/admin/migrar-proveedores', async (req, res) => {
  try {
    const filter = { $or: [ { tamano: { $exists: false } }, { tipoProducto: { $exists: false } } ] };
    const update = { $set: { tamano: 'Mediana', tipoProducto: 'Sensores' } };
    const result = await Proveedor.updateMany(filter, update);
    console.log('ADMIN migración - result:', result);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('ADMIN migración - error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
