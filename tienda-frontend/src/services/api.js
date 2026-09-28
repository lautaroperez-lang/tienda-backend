export async function getProductos() {
  const response = await fetch('/api/productos');
  if (!response.ok) {
    throw new Error('No se pudo conectar con el servidor');
  }
  return await response.json();
}
