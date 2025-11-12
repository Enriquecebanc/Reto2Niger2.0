import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  cantidad: { type: Number, required: true, default: 0 },
  precio_unitario: { type: Number, required: true },
  proveedor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Proveedor" }
}, { timestamps: true });

export default mongoose.model("Stock", StockSchema);
