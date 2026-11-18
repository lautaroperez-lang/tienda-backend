import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ rol }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-600 font-medium">
        Cargando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rol && usuario.rol !== rol) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
