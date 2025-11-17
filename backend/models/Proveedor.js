import mongoose from "mongoose";

const ProveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String },
  direccion: { type: String },
  correo: { type: String },
  tamano: { type: String },
  tipoProducto: { type: String },
  productos: [
    {
      pieza_id: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
      precio_unitario: Number
    }
  ]
}, { timestamps: true });

export default mongoose.model("Proveedor", ProveedorSchema);
