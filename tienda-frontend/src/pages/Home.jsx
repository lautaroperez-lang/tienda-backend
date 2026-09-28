import ProductCard from '../components/ProductCard';

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: 'Audífonos Inalámbricos Premium',
    price: '$89.99',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  },
  {
    id: 2,
    title: 'Reloj Inteligente Sport',
    price: '$129.99',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  },
  {
    id: 3,
    title: 'Teclado Mecánico RGB',
    price: '$74.50',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
  },
];

export default function Home() {
  const handleAddToCart = (product) => {
    console.log('Producto agregado al carrito:', product);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Productos Destacados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {SAMPLE_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
