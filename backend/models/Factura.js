import mongoose from "mongoose";

const FacturaSchema = new mongoose.Schema({
  ventas_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Venta" }],
  ventas_info: [{
    _id: String,
    cliente: String,
    producto: String,
    cantidad: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  impuestos: { type: Number, required: true },
  total: { type: Number, required: true },
  metodo_pago: { type: String, required: true },
  estado: { type: String, enum: ["Pendiente", "Pagada", "Cancelada"], default: "Pendiente" },
  fecha_emision: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Factura", FacturaSchema);
