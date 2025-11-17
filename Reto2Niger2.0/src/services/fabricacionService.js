import axios from "axios";

const API_URL = "http://localhost:5000/fabricaciones";

// Obtener todas las fabricaciones
export async function getFabricaciones() {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    console.error("SERVICE -> error GET:", err.response?.data || err.message);
    throw err;
  }
}

// Crear una fabricación nueva
export async function crearFabricacion({ producto }) {
  const nueva = {
    producto,
    estado: "Pendiente",
    fecha_inicio: new Date()
  };

  console.log("SERVICE -> POST a", API_URL, "con body:", nueva);

  try {
    const res = await axios.post(API_URL, nueva);
    console.log("SERVICE -> respuesta POST:", res.status, res.data);
    return res.data;
  } catch (err) {
    console.error("SERVICE -> error POST:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

// Actualizar fabricación (estado / fecha fin)
export async function actualizarFabricacion(id, data) {
  try {
    console.log("SERVICE -> PUT", `${API_URL}/${id}`, "body:", data);
    const res = await axios.put(`${API_URL}/${id}`, data);
    console.log("SERVICE -> respuesta PUT:", res.status, res.data);
    return res.data;
  } catch (err) {
    console.error("SERVICE -> error PUT:", err.response?.data || err.message);
    throw err;
  }
}
