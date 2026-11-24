import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMisPedidos } from '../services/api';

export default function Arrepentimiento() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setCargando(true);
      getMisPedidos()
        .then((data) => {
          // Filtrar pedidos revocables: no cancelados y <= 10 días
          const ahora = new Date();
          const revocables = (data || []).filter((p) => {
            if (p.estado === 'cancelado') return false;
            const fecha = new Date(p.creado_en);
            const diffDias = (ahora - fecha) / (1000 * 60 * 60 * 24);
            return diffDias <= 10;
          });
          setPedidos(revocables);
        })
        .catch((err) => console.error('Error al cargar pedidos para arrepentimiento', err))
        .finally(() => setCargando(false));
    }
  }, [usuario]);

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <header className="mb-6 pb-4 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block mb-2">
            Disposición 954/2025 & Ley Nº 24.240
          </span>
          <h1 className="text-3xl font-bold text-slate-800">Derecho de Arrepentimiento</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Conforme al Artículo 34 de la Ley de Defensa del Consumidor (Ley Nº 24.240) y la Disposición 954/2025 de la
            Secretaría de Industria y Comercio, tenés derecho a revocar la aceptación del producto o servicio durante el plazo
            de <strong>10 (diez) días corridos</strong> contados a partir de la fecha de compra o de entrega, sin costo ni responsabilidad alguna.
          </p>
        </header>

        <div className="space-y-6">
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 text-amber-900 text-sm leading-relaxed">
            <h2 className="font-bold text-base mb-2">¿Cómo funciona el trámite?</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>El ejercicio del derecho es completamente gratuito.</li>
              <li>Al confirmar la solicitud, el sistema te asignará de inmediato un <strong>código de seguimiento registral</strong>.</li>
              <li>Se cancelará el pedido y se reingresará el stock correspondiente.</li>
            </ul>
          </div>

          {!usuario ? (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-4">
              <p className="text-slate-700 font-medium">
                Para solicitar la revocación de una compra, debés identificarte en tu cuenta:
              </p>
              <Link
                to="/login"
                className="inline-block py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow"
              >
                Iniciar sesión para gestionar revocaciones
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Tus pedidos revocables</h2>

              {cargando ? (
                <p className="text-sm text-slate-500">Buscando compras en plazo legal...</p>
              ) : pedidos.length === 0 ? (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 text-center">
                  <p>No tenés pedidos pendientes de entrega o en plazo de revocación (10 días corridos).</p>
                  <Link
                    to="/mis-pedidos"
                    className="inline-block mt-3 text-sm text-blue-600 font-semibold hover:underline"
                  >
                    Ver historial completo en Mis Pedidos →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Tenés <strong>{pedidos.length}</strong> compra(s) dentro del plazo legal de 10 días:
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                    {pedidos.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Pedido #{p.id}</p>
                          <p className="text-xs text-slate-500">
                            Total: ${Number(p.total).toFixed(2)} — Estado: {p.estado}
                          </p>
                        </div>
                        <Link
                          to="/mis-pedidos"
                          className="py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm"
                        >
                          Revocar en Mis Pedidos
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  to="/mis-pedidos"
                  className="inline-block py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow"
                >
                  Ir a Mis Pedidos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
