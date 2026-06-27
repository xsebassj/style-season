'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

type AddToCartProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string;
  };
};

export default function AddToCartButton({ product }: AddToCartProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      size: 'U', // Por ahora lo dejamos en Talle Único
      quantity: 1,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000); // Feedback visual temporal
  };

  return (
    <button
      onClick={handleAdd}
      type="button"
      className={`flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:w-full ${
        added ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-black hover:bg-gray-900 focus:ring-gray-900'
      }`}
    >
      {added ? '¡Añadido!' : 'Agregar al Carrito'}
    </button>
  );
}