import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-200">ModaMinimal</p>
          <p className="text-xs text-slate-500 mt-1">
            Cumplimiento Ley Nº 24.240 de Defensa del Consumidor y Ley Nº 25.326 de Protección de Datos Personales.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/arrepentimiento"
            className="text-sm font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 transition"
          >
            Botón de arrepentimiento
          </Link>
        </div>
      </div>
    </footer>
  );
}
