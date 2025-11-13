const API_URL = "http://localhost:5000/fabricacion";

export async function getFabricaciones() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function crearFabricacion(fabricacion) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fabricacion)
  });
  return res.json();
}

export async function actualizarFabricacion(id, fabricacion) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fabricacion)
  });
  return res.json();
}

export async function eliminarFabricacion(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
