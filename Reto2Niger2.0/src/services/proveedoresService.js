const API_URL = "http://localhost:5000/proveedores";

export async function getProveedores() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`getProveedores failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function crearProveedor(proveedor) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`crearProveedor failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function actualizarProveedor(id, proveedor) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`actualizarProveedor failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function eliminarProveedor(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
