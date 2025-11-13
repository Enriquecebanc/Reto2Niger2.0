const API_URL = "http://localhost:5000/stock";

export async function getStock() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function crearStock(producto) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  });
  return res.json();
}

export async function actualizarStock(id, producto) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  });
  return res.json();
}

export async function eliminarStock(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
