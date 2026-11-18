import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { crearPedido } from '../services/api';

export default function Carrito() {
  const navigate = useNavigate();
  const { items, quitar, vaciar, total } = useCarrito();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmar = async () => {
    if (enviando) return;
    setError(null);
    setEnviando(true);

    try {
      await crearPedido(items);
      vaciar();
      navigate('/mis-pedidos');
    } catch (err) {
      setError(err.message || 'Error al procesar la compra');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <header className="mb-6 pb-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mi Carrito</h1>
          <p className="text-sm text-slate-500 mt-1">Revisá tus productos antes de finalizar la compra</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={vaciar}
            disabled={enviando}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
          >
            Vaciar carrito
          </button>
        )}
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium shadow-sm flex items-start justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg mb-4">Tu carrito está vacío.</p>
          <Link
            to="/"
            className="inline-block py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => {
              const itemId = item.producto_id || item.id;
              const subtotal = (Number(item.precio_final) || 0) * (Number(item.cantidad) || 1);

              return (
                <div key={itemId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{item.nombre}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Precio unitario: ${Number(item.precio_final).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cantidad: <strong className="text-slate-700">{item.cantidad}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <span className="text-lg font-bold text-slate-800">
                      ${subtotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => quitar(itemId)}
                      disabled={enviando}
                      className="text-sm text-red-500 hover:text-red-700 font-medium p-1 hover:bg-red-50 rounded transition"
                      title="Quitar producto"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-sm text-slate-500 block">Total estimado</span>
              <span className="text-3xl font-extrabold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleConfirmar}
              disabled={enviando || items.length === 0}
              className={`w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-white transition duration-200 shadow-md ${
                enviando || items.length === 0
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {enviando ? 'Confirmando pedido...' : 'Confirmar compra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
