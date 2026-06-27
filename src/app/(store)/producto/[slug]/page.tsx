// src/app/(store)/producto/[slug]/page.tsx
import { getProductBySlug } from '@/lib/api';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  // 1. Desempaquetar la promesa de los parámetros (Requisito Next.js 15+)
  const resolvedParams = await params;
  
  // 2. Ahora sí podemos usar el slug de forma segura
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 xl:gap-x-16">
        {/* Galería de Imágenes */}
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].image.url}
              alt={product.title}
              width={800}
              height={800}
              className="h-full w-full object-cover object-center"
              priority
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              Imagen no disponible
            </div>
          )}
        </div>

        {/* Info del Producto */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {product.title}
          </h1>
          
          <div className="mt-3">
            <h2 className="sr-only">Información del producto</h2>
            <p className="text-3xl text-gray-900">${product.price.toLocaleString('es-AR')}</p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Descripción</h3>
            <div className="text-base text-gray-700 space-y-6">
              <p>{product.meta?.description || 'Una pieza exclusiva de Style Season.'}</p>
            </div>
          </div>

          <div className="mt-10 flex">
            <AddToCartButton 
              product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.images?.[0]?.image?.url || '',
              }} 
            />
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900">Envíos y Devoluciones</h2>
            <div className="mt-4 prose prose-sm text-gray-500">
              <ul className="list-disc pl-4 space-y-2">
                <li>Envíos a todo el país.</li>
                <li>Cambios dentro de los 30 días con etiqueta original.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}