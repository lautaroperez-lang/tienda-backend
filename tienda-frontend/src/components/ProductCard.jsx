import { useCarrito } from '../context/CarritoContext';
import { urlImagen } from '../services/api';

export default function ProductCard({ producto }) {
  const { agregar } = useCarrito();

  if (!producto) return null;

  const { nombre, precio_final, cuotas_cantidad, cuotas_valor, garantia_meses, stock = 0 } = producto;
  const imagenUrl = urlImagen(producto);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        {/* Contenedor cuadrado de imagen con object-cover y loading="lazy" */}
        <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={nombre}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <span className="text-3xl mb-1">🖼️</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sin imagen
              </span>
            </div>
          )}
        </div>

        <div className="p-6 pb-2">
          <h3 className="text-xl font-bold text-slate-800 mb-3">{nombre}</h3>

          <div className="mb-4">
            <span className="text-sm text-slate-500 block">Precio Final</span>
            <span className="text-2xl font-extrabold text-blue-600">
              ${typeof precio_final === 'number' ? precio_final.toFixed(2) : precio_final}
            </span>
          </div>

          <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Financiación:</span>
              <span>
                {cuotas_cantidad} cuotas de ${typeof cuotas_valor === 'number' ? cuotas_valor.toFixed(2) : cuotas_valor}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Garantía:</span>
              <span>{garantia_meses} meses</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Stock disponible:</span>
              <span className={`font-semibold ${stock > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                {stock > 0 ? `${stock} unid.` : 'Agotado'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={() => agregar(producto, 1)}
          disabled={stock <= 0}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition duration-200 ${
            stock <= 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
          }`}
        >
          {stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
