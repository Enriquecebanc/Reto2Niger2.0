import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Proveedor from '../models/Proveedor.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/niger';

async function run() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB:', uri);

    const filter = { $or: [ { tamano: { $exists: false } }, { tipoProducto: { $exists: false } } ] };
    const update = { $set: { tamano: 'Mediana', tipoProducto: 'Sensores' } };

    const result = await Proveedor.updateMany(filter, update);
    console.log('Migración completada. Documentos modificados:', result.modifiedCount || result.nModified || result.modified || result);
  } catch (err) {
    console.error('Error en migración:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
