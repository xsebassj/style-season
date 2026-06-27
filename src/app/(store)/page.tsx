import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/api';

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. HERO BANNER - Logo como centro de atención */}
      <section className="relative h-[60vh] w-full bg-white flex flex-col items-center justify-center p-6">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <Image
            src="/logo.jpg" 
            alt="Style Season Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="mt-8 text-2xl md:text-3xl font-light tracking-[0.3em] uppercase text-gray-900">
          Colección de Temporada
        </h1>
        <Link 
          href="/shop" 
          className="mt-8 px-10 py-3 border border-gray-900 text-gray-900 font-medium uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300"
        >
          Explorar
        </Link>
      </section>

      {/* 2. SECCIÓN DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 uppercase tracking-widest text-center">
          Lo más nuevo
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product: any) => (
            <Link key={product.id} href={`/producto/${product.slug}`} className="group">
              <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-lg">
                {product.main_image?.image?.url ? (
                  <Image
                    src={product.main_image.image.url}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                )}
              </div>
              <h3 className="mt-4 text-sm text-gray-900 font-medium">{product.title}</h3>
              <p className="text-lg font-bold mt-1 text-gray-900">${product.price}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}