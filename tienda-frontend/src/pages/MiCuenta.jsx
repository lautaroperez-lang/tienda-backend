import { useAuth } from '../context/AuthContext';

export default function MiCuenta() {
  const { usuario } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Mi Cuenta</h2>
        
        {usuario ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Nombre
              </span>
              <p className="text-lg font-medium text-slate-800">{usuario.nombre}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Correo Electrónico
              </span>
              <p className="text-lg font-medium text-slate-800">{usuario.email}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Rol
              </span>
              <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                {usuario.rol}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">No hay información de usuario disponible.</p>
        )}
      </div>
    </div>
  );
}
