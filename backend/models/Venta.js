import mongoose from "mongoose";

const VentaSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  tipo_maceta: { type: String, enum: ["Pequeña", "Mediana", "Grande", "small", "medium", "big"], required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  total: { type: Number, required: true },
  metodo_pago: {
    type: String,
    enum: ["Crédito", "Débito", "PayPal", "Efectivo"],
    required: true
  },
  fecha_venta: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Venta", VentaSchema);
