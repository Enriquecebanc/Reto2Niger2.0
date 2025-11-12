import mongoose from "mongoose";

const VentaSchema = new mongoose.Schema({
  producto_id: { type: mongoose.Schema.Types.ObjectId, ref: "Fabricacion" },
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente" },
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
