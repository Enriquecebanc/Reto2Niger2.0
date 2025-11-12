import mongoose from "mongoose";

const FacturaSchema = new mongoose.Schema({
  venta_id: { type: mongoose.Schema.Types.ObjectId, ref: "Venta" },
  subtotal: { type: Number, required: true },
  impuestos: { type: Number, required: true },
  total: { type: Number, required: true },
  metodo_pago: { type: String, required: true },
  fecha_emision: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Factura", FacturaSchema);
