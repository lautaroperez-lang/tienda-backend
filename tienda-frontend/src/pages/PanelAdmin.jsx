import { useAuth } from '../context/AuthContext';

export default function PanelAdmin() {
  const { usuario } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Panel de Administración</h2>
            <p className="text-sm text-slate-500">Gestión de productos y usuarios del sistema</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
            Admin
          </span>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 text-sm">
          Bienvenido, <strong>{usuario?.nombre}</strong>. Tenés permisos de administrador en la plataforma.
        </div>
      </div>
    </div>
  );
}
