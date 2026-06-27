'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importamos el router

export default function CartPage() {
  const { cart, removeFromCart, totalPrice } = useCart();
  const router = useRouter(); // Inicializamos el router

  if (cart.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Parece que aún no has agregado nada a tu estilo de esta temporada.</p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-900 transition-colors"
        >
          Volver al Catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Tu Carrito</h1>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <ul role="list" className="divide-y divide-gray-200">
          {cart.map((item) => (
            <li key={`${item.id}-${item.size}`} className="flex py-6 px-4 sm:px-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">Sin foto</div>
                )}
              </div>

              <div className="ml-4 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3><Link href={`/producto/${item.slug}`}>{item.title}</Link></h3>
                    <p className="ml-4">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Talle: {item.size}</p>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">Cant: {item.quantity}</p>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="font-medium text-red-600 hover:text-red-500 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between text-lg font-medium text-gray-900">
            <p>Subtotal</p>
            <p>${totalPrice.toLocaleString('es-AR')}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">Los costos de envío en Resistencia y a todo el país se calcularán en el siguiente paso.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/checkout')} // <-- Aquí está la magia
              className="flex w-full items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors bg-black hover:bg-gray-800"
            >
              Ir al Pago (Checkout)
            </button>
          </div>
          <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
            <p>
              o{' '}
              <Link href="/" className="font-medium text-black hover:text-gray-800 transition-colors">
                Continuar Comprando <span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}