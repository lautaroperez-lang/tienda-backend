import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito');
      return guardado ? JSON.parse(guardado) : [];
    } catch (e) {
      console.error('Error al parsear el carrito desde localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('carrito', JSON.stringify(items));
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage', e);
    }
  }, [items]);

  const agregar = (producto, cantidad = 1) => {
    const prodId = producto.producto_id || producto.id;
    setItems((prevItems) => {
      const existe = prevItems.find((item) => (item.producto_id || item.id) === prodId);
      if (existe) {
        return prevItems.map((item) =>
          (item.producto_id || item.id) === prodId
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...producto,
          id: prodId,
          producto_id: prodId,
          cantidad,
        },
      ];
    });
  };

  const quitar = (producto_id) => {
    setItems((prevItems) =>
      prevItems.filter((item) => (item.producto_id || item.id) !== producto_id)
    );
  };

  const vaciar = () => {
    setItems([]);
  };

  const total = items.reduce(
    (acum, item) => acum + (Number(item.precio_final) || 0) * (Number(item.cantidad) || 1),
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregar,
        quitar,
        vaciar,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
}
