import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.log("❌ Error al conectar:", err));

// Endpoint temporal de prueba
app.get("/", (req, res) => {
  res.send("API ERP funcionando correctamente 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${process.env.PORT}`);
});
