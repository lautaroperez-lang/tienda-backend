const BASE_URL = import.meta.env.VITE_API_URL;

export function authHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function manejarRespuesta(res) {
  if (res.status === 401) {
    throw new Error('Tu sesión venció. Volvé a entrar.');
  }
  if (res.status === 409) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Conflicto de stock');
  }
  if (!res.ok) {
    throw new Error('No se pudo confirmar la compra');
  }
  return await res.json();
}

export async function registrar(datos) {
  const response = await fetch(`${BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al registrar el usuario');
  }
  return await response.json();
}

export async function login(email, password) {
  const params = new URLSearchParams({ username: email, password });
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al iniciar sesión');
  }
  return await response.json();
}

export async function getMe() {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      ...authHeaders(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener perfil');
  }
  return await response.json();
}

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

export async function crearPedido(items) {
  const payload = {
    items: items.map((i) => ({
      producto_id: i.producto_id || i.id,
      cantidad: i.cantidad,
    })),
  };

  const response = await fetch(`${BASE_URL}/pedidos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return await manejarRespuesta(response);
}

export async function getMisPedidos() {
  const response = await fetch(`${BASE_URL}/pedidos/mios`, {
    headers: {
      ...authHeaders(),
    },
  });
  if (response.status === 401) {
    throw new Error('Tu sesión venció. Volvé a entrar.');
  }
  if (!response.ok) {
    throw new Error('No se pudieron obtener tus pedidos');
  }
  return await response.json();
}
