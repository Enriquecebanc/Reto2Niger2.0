const API_URL = "http://localhost:5000/fabricaciones";

export async function getFabricaciones() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener fabricaciones");
  return res.json();
}

export async function crearFabricacion(fabricacion) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fabricacion)
  });
  if (!res.ok) throw new Error("Error al crear fabricación");
  return res.json();
}

export async function actualizarFabricacion(id, fabricacion) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fabricacion)
  });
  if (!res.ok) throw new Error("Error al actualizar fabricación");
  return res.json();
}
