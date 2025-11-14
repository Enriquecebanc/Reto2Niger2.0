import mongoose from "mongoose";


const FabricacionSchema = new mongoose.Schema({
  producto: { type: String, required: true }, // ej. "Maceta pequeña"
  materiales: [
    {
      id_pieza: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
      cantidad: { type: Number, required: true }
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

FabricacionSchema.pre(/^find/, function (next) {
  this.populate({
    path: "materiales.id_pieza",
    select: "nombre precio_unitario"
  });
  next();
});

export default mongoose.model("Fabricacion", FabricacionSchema);
