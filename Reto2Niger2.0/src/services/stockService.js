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
  if (!res.ok && res.status === 404) {
    return { message: 'Producto no encontrado', notFound: true };
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}
