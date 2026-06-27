// src/lib/api.ts
export async function getProducts() {
  // Quitamos el filtro de "_status" porque la colección es pública directa
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/products`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Detalle del error de la API:", errorData);
    throw new Error(`Error al cargar los productos. HTTP Status: ${res.status}`);
  }

  const data = await res.json();
  return data.docs;
}

export async function getProductBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/products?where[slug][equals]=${slug}&limit=1`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Error al cargar el producto por slug');
  }

  const data = await res.json();
  return data.docs[0] || null;
}