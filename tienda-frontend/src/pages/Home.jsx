import { useState, useEffect } from 'react';
import { getProductos } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lento, setLento] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLento(true);
    }, 5000);

    getProductos()
      .then((data) => {
        setProductos(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'No se pudo conectar con el servidor');
        setIsLoading(false);
      })
      .finally(() => {
        clearTimeout(timer);
      });

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Catálogo de Productos</h1>
        <p className="text-slate-500 text-sm mt-1">Cumpliendo con Ley Nº 24.240 de Defensa del Consumidor</p>
      </header>

      {isLoading && (
        <div
          role="status"
          className="bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-200 font-medium animate-pulse"
        >
          {lento
            ? 'Despertando el servidor, puede tardar un minuto…'
            : 'Cargando productos…'}
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg border border-red-300 font-semibold shadow-sm">
          🚨 {error}
        </div>
      )}

      {!isLoading && !error && productos.length === 0 && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 font-medium">
          No hay productos disponibles en este momento.
        </div>
      )}

      {!isLoading && !error && productos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
