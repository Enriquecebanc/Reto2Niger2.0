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

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.log("❌ Error al conectar:", err));

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

app.listen(process.env.PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${process.env.PORT}`);
});
