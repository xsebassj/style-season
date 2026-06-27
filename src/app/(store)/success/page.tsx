'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function SuccessPage() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    // Usamos un ref para asegurarnos de que el carrito se limpie solo una vez 
    // y evitar problemas con el StrictMode de React en desarrollo.
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center min-h-[70vh] flex flex-col justify-center items-center">
      <div className="flex justify-center mb-8">
        <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
        ¡Pago exitoso!
      </h1>
      
      <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
        Tu pedido ha sido procesado correctamente. En breve nos pondremos en contacto contigo para coordinar los detalles del envío.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
        >
          Volver al Catálogo
        </Link>
      </div>
    </main>
  );
}