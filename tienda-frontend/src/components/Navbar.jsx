import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-blue-400 transition">
            ModaMinimal
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition">
            Catálogo
          </Link>
          {usuario?.rol === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-purple-300 hover:text-purple-200 transition">
              Panel Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              <Link to="/mi-cuenta" className="text-sm font-medium text-slate-200 hover:text-white transition">
                Hola, <span className="font-semibold text-blue-400">{usuario.nombre}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="text-sm px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
