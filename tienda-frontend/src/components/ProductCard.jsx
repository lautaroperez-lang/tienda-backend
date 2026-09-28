export default function ProductCard({ producto }) {
  if (!producto) return null;

  const { nombre, precio_final, cuotas_cantidad, cuotas_valor, garantia_meses } = producto;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
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
            <span>{cuotas_cantidad} cuotas de ${typeof cuotas_valor === 'number' ? cuotas_valor.toFixed(2) : cuotas_valor}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Garantía:</span>
            <span>{garantia_meses} meses</span>
          </p>
        </div>
      </div>
    </div>
  );
}
