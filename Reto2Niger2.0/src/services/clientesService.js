const API_URL = "http://localhost:5000/clientes";

export async function getClientes() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function crearCliente(cliente) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente)
  });
  return res.json();
}

export async function actualizarCliente(id, cliente) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente)
  });
  return res.json();
}

export async function eliminarCliente(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
