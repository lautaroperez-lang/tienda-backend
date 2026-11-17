const BASE_URL = import.meta.env.VITE_API_URL;

export async function getProductos({ page = 1, limit = 12, nombre = "" } = {}) {
  const params = new URLSearchParams({ page, limit, nombre });
  const response = await fetch(`${BASE_URL}/productos/?${params}`);
  if (!response.ok) {
    throw new Error('No se pudo conectar con el servidor');
  }
  return await response.json();
}

export async function getProducto(id) {
  const response = await fetch(`${BASE_URL}/productos/${id}`);
  if (!response.ok) {
    throw new Error('No se pudo conectar con el servidor');
  }
  return await response.json();
}
