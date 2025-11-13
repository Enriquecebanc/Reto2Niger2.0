const API_URL = "http://localhost:5000/ventas";

export async function getVentas() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function crearVenta(venta) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(venta)
  });
  return res.json();
}

export async function actualizarVenta(id, venta) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(venta)
  });
  return res.json();
}

export async function eliminarVenta(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
