import mongoose from "mongoose";

const FabricacionSchema = new mongoose.Schema({
  producto: { type: String, required: true },
  materiales: [
    {
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true }
      // Ya NO usamos id_pieza, solo nombre y cantidad
    }
  ],
  fecha_inicio: { type: Date, default: Date.now },
  fecha_fin: { type: Date },
  estado: {
    type: String,
    enum: ["Pendiente", "En proceso", "Finalizado", "Cancelado"],
    default: "Pendiente"
  }
}, { timestamps: true });



export default mongoose.model("Fabricacion", FabricacionSchema);