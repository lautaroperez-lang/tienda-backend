import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../services/api';

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    acepto_tratamiento: false,
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await registrar({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Crear una cuenta</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="nombre">
              Nombre completo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              id="acepto_tratamiento"
              name="acepto_tratamiento"
              type="checkbox"
              checked={formData.acepto_tratamiento}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="acepto_tratamiento" className="text-xs text-slate-600 leading-snug">
              Acepto el tratamiento de mis datos personales conforme a la <strong>Ley Nº 25.326</strong> de Protección de los Datos Personales.
            </label>
          </div>

          <button
            type="submit"
            disabled={!formData.acepto_tratamiento || cargando}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition duration-200 ${
              !formData.acepto_tratamiento || cargando
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
