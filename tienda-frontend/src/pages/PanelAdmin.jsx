import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, crearProducto, subirImagen, urlImagen } from '../services/api';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function PanelAdmin() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Formulario nuevo producto
  const [nuevoForm, setNuevoForm] = useState({
    nombre: '',
    precio_final: '',
    cuotas_cantidad: '1',
    cuotas_valor: '0',
    garantia_meses: '6',
    stock: '10',
  });
  const [archivoNuevo, setArchivoNuevo] = useState(null);
  const [previewNuevo, setPreviewNuevo] = useState(null);
  const fileInputNuevoRef = useRef(null);

  // File input refs para productos de la lista
  const fileInputListaRefs = useRef({});

  // Cargar productos
  const cargarLista = () => {
    setCargando(true);
    getProductos()
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar productos');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarLista();
  }, []);

  // Manejo de preview y revocación de URL en montaje/cambio/desmontaje
  useEffect(() => {
    if (!archivoNuevo) {
      setPreviewNuevo(null);
      return;
    }
    const objectUrl = URL.createObjectURL(archivoNuevo);
    setPreviewNuevo(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [archivoNuevo]);

  const validarArchivo = (file) => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WEBP.');
    }
    if (file.size > MAX_BYTES) {
      throw new Error('La imagen pasa de 2 MB. Elegí una imagen más liviana.');
    }
  };

  const handleArchivoNuevoChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setArchivoNuevo(null);
      return;
    }
    try {
      validarArchivo(file);
      setArchivoNuevo(file);
    } catch (err) {
      setError(err.message);
      if (fileInputNuevoRef.current) fileInputNuevoRef.current.value = '';
      setArchivoNuevo(null);
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (subiendo) return;
    setError(null);
    setExito(null);
    setSubiendo(true);

    try {
      const prodData = {
        nombre: nuevoForm.nombre,
        precio_final: parseFloat(nuevoForm.precio_final),
        cuotas_cantidad: parseInt(nuevoForm.cuotas_cantidad, 10),
        cuotas_valor: parseFloat(nuevoForm.cuotas_valor),
        garantia_meses: parseInt(nuevoForm.garantia_meses, 10),
        stock: parseInt(nuevoForm.stock, 10),
      };

      const creado = await crearProducto(prodData);

      if (archivoNuevo) {
        await subirImagen(creado.id, archivoNuevo);
      }

      setExito(`Producto "${creado.nombre}" creado exitosamente.`);
      setNuevoForm({
        nombre: '',
        precio_final: '',
        cuotas_cantidad: '1',
        cuotas_valor: '0',
        garantia_meses: '6',
        stock: '10',
      });
      setArchivoNuevo(null);
      if (fileInputNuevoRef.current) fileInputNuevoRef.current.value = '';
      cargarLista();
    } catch (err) {
      setError(err.message || 'Error al procesar el producto');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubirImagenExistente = async (productoId, file) => {
    if (!file || subiendo) return;
    setError(null);
    setExito(null);

    try {
      validarArchivo(file);
      setSubiendo(true);
      await subirImagen(productoId, file);
      setExito(`Imagen del producto #${productoId} actualizada con éxito.`);
      if (fileInputListaRefs.current[productoId]) {
        fileInputListaRefs.current[productoId].value = '';
      }
      cargarLista();
    } catch (err) {
      setError(err.message || 'Error al subir la imagen');
      if (fileInputListaRefs.current[productoId]) {
        fileInputListaRefs.current[productoId].value = '';
      }
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
            <p className="text-sm text-slate-500">Gestión de catálogo, stock e imágenes</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
            Admin: {usuario?.nombre}
          </span>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium flex items-center justify-between">
            <span>🚨 {error}</span>
            <button onClick={() => setError(null)} className="font-bold text-lg ml-2">×</button>
          </div>
        )}

        {exito && (
          <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm font-medium flex items-center justify-between">
            <span>✅ {exito}</span>
            <button onClick={() => setExito(null)} className="font-bold text-lg ml-2">×</button>
          </div>
        )}

        {/* Formulario para agregar producto nuevo */}
        <form onSubmit={handleCrearProducto} className="mt-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Agregar nuevo producto</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={nuevoForm.nombre}
                onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                placeholder="Ej: Remera Algodón"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1" htmlFor="precio_final">
                Precio final ($)
              </label>
              <input
                id="precio_final"
                type="number"
                step="0.01"
                required
                value={nuevoForm.precio_final}
                onChange={(e) => setNuevoForm({ ...nuevoForm, precio_final: e.target.value })}
                placeholder="29.99"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1" htmlFor="stock">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                required
                value={nuevoForm.stock}
                onChange={(e) => setNuevoForm({ ...nuevoForm, stock: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1" htmlFor="cuotas_cantidad">
                Cuotas cantidad
              </label>
              <input
                id="cuotas_cantidad"
                type="number"
                value={nuevoForm.cuotas_cantidad}
                onChange={(e) => setNuevoForm({ ...nuevoForm, cuotas_cantidad: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1" htmlFor="cuotas_valor">
                Valor de cuota ($)
              </label>
              <input
                id="cuotas_valor"
                type="number"
                step="0.01"
                value={nuevoForm.cuotas_valor}
                onChange={(e) => setNuevoForm({ ...nuevoForm, cuotas_valor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1" htmlFor="garantia_meses">
                Garantía (meses)
              </label>
              <input
                id="garantia_meses"
                type="number"
                value={nuevoForm.garantia_meses}
                onChange={(e) => setNuevoForm({ ...nuevoForm, garantia_meses: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Campo de imagen con input file no controlado y preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="fotoNuevo">
              Foto del producto (opcional, máx 2 MB, JPG/PNG/WEBP)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                id="fotoNuevo"
                type="file"
                accept="image/*"
                ref={fileInputNuevoRef}
                onChange={handleArchivoNuevoChange}
                className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {previewNuevo && (
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                  <img
                    src={previewNuevo}
                    alt="Vista previa"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <span className="text-xs text-slate-500">Vista previa local</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={subiendo}
            className={`py-2.5 px-6 rounded-lg font-bold text-white transition ${
              subiendo
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow hover:shadow-md'
            }`}
          >
            {subiendo ? 'Subiendo…' : 'Crear Producto'}
          </button>
        </form>
      </div>

      {/* Lista de productos con carga y actualización de imágenes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-800">Productos en Catálogo</h2>

        {cargando ? (
          <p className="text-sm text-slate-500">Cargando catálogo...</p>
        ) : productos.length === 0 ? (
          <p className="text-sm text-slate-500">No hay productos cargados todavía.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {productos.map((prod) => {
              const imgActual = urlImagen(prod);
              return (
                <div
                  key={prod.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                      {imgActual ? (
                        <img
                          src={imgActual}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Sin foto</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{prod.nombre}</h3>
                      <p className="text-xs text-slate-500">
                        Precio: ${Number(prod.precio_final).toFixed(2)} | Stock: {prod.stock}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label
                      htmlFor={`subir-foto-${prod.id}`}
                      className="cursor-pointer text-xs font-semibold py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      {subiendo ? 'Subiendo…' : 'Cambiar imagen'}
                    </label>
                    <input
                      id={`subir-foto-${prod.id}`}
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        fileInputListaRefs.current[prod.id] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSubirImagenExistente(prod.id, file);
                      }}
                      className="hidden"
                      disabled={subiendo}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
