import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisPedidos, revocarPedido } from '../services/api';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState(null);
  const [enviandoRevocacion, setEnviandoRevocacion] = useState(null);
  const [errorRevocacion, setErrorRevocacion] = useState(null);

  const cargarPedidos = () => {
    setCargando(true);
    setError(null);

    getMisPedidos()
      .then((data) => {
        setPedidos(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar tus pedidos');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const esRevocable = (pedido) => {
    if (pedido.estado === 'cancelado') return false;
    if (!pedido.creado_en) return false;
    const diffDias = (new Date() - new Date(pedido.creado_en)) / (1000 * 60 * 60 * 24);
    return diffDias <= 10;
  };

  const handleRevocar = async (pedidoId) => {
    if (enviandoRevocacion) return;
    const confirma = window.confirm('¿Estás seguro de que deseás revocar la compra de este pedido?');
    if (!confirma) return;

    setEnviandoRevocacion(pedidoId);
    setErrorRevocacion(null);

    try {
      const res = await revocarPedido(pedidoId);
      setCodigoSeguimiento(res.codigo);
      const data = await getMisPedidos();
      setPedidos(data);
    } catch (err) {
      setErrorRevocacion(err.message || 'Error al procesar la revocación');
    } finally {
      setEnviandoRevocacion(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Mis Pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">Historial de compras realizadas</p>
      </header>

      {/* Bloque de éxito de revocación con role="status" */}
      {codigoSeguimiento && (
        <div
          role="status"
          className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shadow-sm flex items-start justify-between"
        >
          <div>
            <p className="font-bold text-base">Solicitud registrada.</p>
            <p className="text-sm mt-0.5">
              Tu código de seguimiento es:{' '}
              <strong className="font-mono text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded">
                {codigoSeguimiento}
              </strong>
            </p>
          </div>
          <button
            onClick={() => setCodigoSeguimiento(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 text-lg"
          >
            ×
          </button>
        </div>
      )}

      {errorRevocacion && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium flex items-center justify-between">
          <span>⚠️ {errorRevocacion}</span>
          <button
            onClick={() => setErrorRevocacion(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

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

            const puedeRevocar = esRevocable(pedido);

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
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full ${
                          pedido.estado === 'cancelado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pedido.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{fecha}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                    <div>
                      <span className="text-xs text-slate-400 block text-right">Total</span>
                      <span className="text-2xl font-black text-blue-600">
                        ${Number(pedido.total).toFixed(2)}
                      </span>
                    </div>

                    {puedeRevocar && (
                      <button
                        onClick={() => handleRevocar(pedido.id)}
                        disabled={enviandoRevocacion === pedido.id}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-sm ${
                          enviandoRevocacion === pedido.id
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-600'
                        }`}
                        title="Ejercer derecho de revocación (Ley 24.240)"
                      >
                        {enviandoRevocacion === pedido.id ? 'Cancelando...' : 'Arrepentirme'}
                      </button>
                    )}
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
