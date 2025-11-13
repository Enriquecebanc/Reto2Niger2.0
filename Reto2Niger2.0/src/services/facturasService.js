const API_URL = "http://localhost:5000/facturas";

export async function getFacturas() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function crearFactura(factura) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura)
  });
  return res.json();
}

export async function actualizarFactura(id, factura) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura)
  });
  return res.json();
}

export async function eliminarFactura(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
