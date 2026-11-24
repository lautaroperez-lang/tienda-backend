import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { getMisDatos, exportarMisDatos, eliminarMiCuenta } from '../services/api';

export default function MisDatos() {
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();
  const { vaciar } = useCarrito();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [descargando, setDescargando] = useState(false);
  const [confirmacionTexto, setConfirmacionTexto] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setCargando(true);
    setError(null);

    getMisDatos()
      .then((res) => {
        if (isMounted) {
          setDatos(res);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error al cargar tus datos personales');
          setCargando(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportar = async () => {
    setDescargando(true);
    try {
      await exportarMisDatos();
    } catch (err) {
      alert(err.message || 'Error al descargar datos');
    } finally {
      setDescargando(false);
    }
  };

  const handleEliminarCuenta = async () => {
    if (confirmacionTexto !== 'ELIMINAR' || eliminando) return;
    const seguro = window.confirm(
      '¿Estás completamente seguro de que deseás eliminar tu cuenta? Esta acción es irreversible y anonimizará tus datos.'
    );
    if (!seguro) return;

    setEliminando(true);
    setErrorEliminar(null);

    try {
      await eliminarMiCuenta();
      vaciar();
      cerrarSesion();
      navigate('/', {
        state: { mensaje: 'Tu cuenta ha sido dada de baja y anonimizada correctamente.' },
      });
    } catch (err) {
      setErrorEliminar(err.message || 'Error al dar de baja la cuenta');
      setEliminando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
      <header className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-2">
          Ley Nº 25.326 — Protección de Datos Personales
        </span>
        <h1 className="text-3xl font-bold text-slate-800">Mis Datos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Transparencia y ejercicio de tus derechos de acceso, rectificación, portabilidad y supresión.
        </p>
      </header>

      {cargando && (
        <div className="bg-blue-50 text-blue-700 p-6 rounded-2xl border border-blue-200 font-medium text-center animate-pulse">
          Cargando tus datos personales...
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 font-semibold text-center">
          🚨 {error}
        </div>
      )}

      {!cargando && !error && datos && (
        <div className="space-y-8">
          {/* Datos del titular */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
              Datos del Titular
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Nombre
                </span>
                <p className="text-base font-bold text-slate-800">{datos.titular?.nombre}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Registrado
                </span>
                <p className="text-base font-bold text-slate-800">{datos.titular?.email}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Fecha de Alta
                </span>
                <p className="text-base font-bold text-slate-800">
                  {datos.titular?.alta
                    ? new Date(datos.titular.alta).toLocaleDateString('es-AR')
                    : 'No disponible'}
                </p>
              </div>
            </div>
          </section>

          {/* Consentimiento */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
              Consentimiento de Tratamiento (Ley 25.326)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Estado del Consentimiento:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    datos.consentimiento?.otorgado
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {datos.consentimiento?.otorgado ? 'Otorgado' : 'Revocado'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Fecha de Otorgamiento:</span>
                <span className="text-sm font-bold text-slate-800">
                  {datos.consentimiento?.fecha
                    ? new Date(datos.consentimiento.fecha).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
            </div>
          </section>

          {/* Pedidos asociados */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
              Historial de Pedidos Registrados
            </h2>
            {datos.pedidos && datos.pedidos.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {datos.pedidos.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-slate-800">Pedido #{p.id}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {p.estado}
                      </span>
                      <span className="font-bold text-blue-600">${Number(p.total).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay pedidos asociados a esta cuenta.</p>
            )}
          </section>

          {/* Botón de exportación portabilidad */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Exportar mis datos</h2>
              <p className="text-xs text-slate-500 mt-1">
                Descargá una copia de toda tu información en formato estructurado JSON.
              </p>
            </div>
            <button
              onClick={handleExportar}
              disabled={descargando}
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow hover:shadow-md flex items-center gap-2"
            >
              📥 {descargando ? 'Descargando...' : 'Descargar mis datos (.json)'}
            </button>
          </section>

          {/* Sección separada: Eliminar mi cuenta */}
          <section className="bg-rose-50 rounded-2xl p-6 sm:p-8 border border-rose-200 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-rose-800">Eliminar mi cuenta</h2>
              <p className="text-sm text-rose-700 mt-1 leading-relaxed">
                Esta acción anonimizará de forma permanente tu nombre, email, contraseña y revocará tu consentimiento
                conforme a la Ley Nº 25.326. Tu cuenta quedará inhabilitada de inmediato y no podrás volver a ingresar con este correo.
              </p>
            </div>

            {errorEliminar && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                🚨 {errorEliminar}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <label htmlFor="confirmacion" className="block text-xs font-bold text-rose-900 uppercase tracking-wider">
                Para confirmar la baja definitiva, escribí la palabra <strong>ELIMINAR</strong> a continuación:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="confirmacion"
                  type="text"
                  value={confirmacionTexto}
                  onChange={(e) => setConfirmacionTexto(e.target.value)}
                  placeholder="Escribí ELIMINAR"
                  className="px-4 py-2 bg-white border border-rose-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-xs font-mono font-bold"
                />
                <button
                  onClick={handleEliminarCuenta}
                  disabled={confirmacionTexto !== 'ELIMINAR' || eliminando}
                  className={`py-2 px-6 rounded-lg font-bold text-white transition ${
                    confirmacionTexto !== 'ELIMINAR' || eliminando
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {eliminando ? 'Dando de baja...' : 'Eliminar mi cuenta'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
