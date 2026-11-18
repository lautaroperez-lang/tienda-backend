import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisPedidos } from '../services/api';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setCargando(true);
    setError(null);

    getMisPedidos()
      .then((data) => {
        if (isMounted) {
          setPedidos(data);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error al cargar tus pedidos');
          setCargando(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Mis Pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">Historial de compras realizadas</p>
      </header>

      {/* Estado 1: Cargando */}
      {cargando && (
        <div className="bg-blue-50 text-blue-700 p-6 rounded-2xl border border-blue-200 font-medium text-center animate-pulse">
          Cargando tus pedidos...
        </div>
      )}

      {/* Estado 2: Error */}
      {!cargando && error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 font-semibold shadow-sm text-center">
          🚨 {error}
        </div>
      )}

      {/* Estado 3: Lista vacía */}
      {!cargando && !error && pedidos.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg mb-4">Todavía no compraste nada.</p>
          <Link
            to="/"
            className="inline-block py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {/* Listado de pedidos */}
      {!cargando && !error && pedidos.length > 0 && (
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            const fecha = pedido.creado_en
              ? new Date(pedido.creado_en).toLocaleString('es-AR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Fecha no disponible';

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 mb-4 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-800">
                        Pedido #{pedido.id}
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-100 text-amber-800">
                        {pedido.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{fecha}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-2xl font-black text-blue-600">
                      ${Number(pedido.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Ítems comprados
                  </h4>
                  <ul className="divide-y divide-slate-50">
                    {pedido.items && pedido.items.length > 0 ? (
                      pedido.items.map((it) => (
                        <li
                          key={it.id}
                          className="py-2 flex justify-between items-center text-sm"
                        >
                          <div>
                            <span className="font-medium text-slate-700">
                              {it.nombre_producto || `Producto #${it.producto_id}`}
                            </span>
                            <span className="text-slate-400 ml-2">
                              x{it.cantidad}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-600">
                            ${(Number(it.precio_unitario) * Number(it.cantidad)).toFixed(2)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400 py-1">Sin ítems</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
