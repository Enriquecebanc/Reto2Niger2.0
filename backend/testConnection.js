// testConnection.js
import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar variables de entorno (.env)
dotenv.config();

const uri = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log("🧠 Intentando conectar con MongoDB Atlas...");
    const conn = await mongoose.connect(uri);

    console.log("✅ Conectado correctamente a MongoDB Atlas");
    console.log("📘 Base de datos:", conn.connection.name);

    // Listar colecciones
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("📦 Colecciones encontradas:");
    collections.forEach(c => console.log(" -", c.name));

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("🔒 Conexión cerrada correctamente");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB Atlas:");
    console.error(error.message);
  }
}

testConnection();
