"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Eye, ChevronRight } from "lucide-react";
import { getProducts } from "@/lib/api";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Usamos la función de tu API que conecta con Payload
        const fetchedProducts = await getProducts();
        
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        
        // Payload puede devolver la categoría como string o como objeto dependiendo de tu config.
        // Aquí extraemos el nombre de la categoría.
        const uniqueCategories = Array.from(
          new Set(
            fetchedProducts
              .map((p: any) => typeof p.category === 'object' ? p.category?.title : p.category)
              .filter(Boolean)
          )
        ) as string[];
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Función para filtrar por categoría
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredProducts(products.filter(p => {
        const catName = typeof p.category === 'object' ? p.category?.title : p.category;
        return catName === category;
      }));
    } else {
      setFilteredProducts(products); // Muestra todos si es null
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black tracking-widest text-xs uppercase animate-pulse">
        Cargando colección...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-sans text-black">
      
      {/* Contenedor Principal */}
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row gap-12">
        
        {/* ================= BARRA LATERAL (SIDEBAR) ================= */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-10">
          
          {/* Navegación de Categorías Dinámica */}
          <div>
            <button 
              onClick={() => handleCategoryClick(null)}
              className="flex items-center gap-2 text-sm font-bold uppercase mb-6 hover:text-gray-600 transition-colors"
            >
              <ChevronRight size={16} /> VER TODO
            </button>
            
            <ul className="space-y-4 text-sm font-medium uppercase text-gray-700">
              {categories.map((cat, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleCategoryClick(cat)}
                    className={`hover:text-black transition-colors ${selectedCategory === cat ? 'font-bold text-black' : ''}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filtros visuales */}
          <div>
            <h3 className="font-bold text-sm uppercase mb-4">Filtrar por</h3>
            
            {/* Talles */}
            <div className="mb-8">
              <h4 className="text-xs uppercase text-gray-500 mb-3">Talle</h4>
              <div className="space-y-2">
                {["S", "M", "L", "XL"].map((talle) => (
                  <label key={talle} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 accent-black border-gray-300 rounded-sm" />
                    <span className="text-sm text-gray-700 group-hover:text-black">{talle}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Precios */}
            <div>
              <h4 className="text-xs uppercase text-gray-500 mb-3">Precio</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-gray-400 uppercase">Desde</span>
                  <input type="number" placeholder="0" className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-gray-400 uppercase">Hasta</span>
                  <input type="number" placeholder="99999" className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black" />
                </div>
                <button className="mt-4 border border-gray-300 p-2 hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* ================= ÁREA DE PRODUCTOS (GRID) ================= */}
        <main className="flex-1">
          
          {/* Cabecera del Grid */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold uppercase">
              {selectedCategory ? selectedCategory : "Ver Todo"}
            </h1>
            <select className="border border-gray-300 p-2 text-sm outline-none bg-white cursor-pointer hover:border-black transition-colors">
              <option>DESTACADO</option>
              <option>MENOR PRECIO</option>
              <option>MAYOR PRECIO</option>
              <option>MÁS RECIENTES</option>
            </select>
          </div>

          {/* Grilla 4 Columnas */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12">
            {filteredProducts.map((p) => {
              // Extraemos la imagen segura desde Payload
              const imageUrl = p.main_image?.image?.url || p.images?.[0]?.image?.url || "";
              
              return (
                <div key={p.id} className="group relative flex flex-col">
                  
                  {/* Imagen del producto */}
                  <Link href={`/producto/${p.slug}`} className="relative bg-gray-100 aspect-[3/4] overflow-hidden mb-4 block">
                    
                    <div className="absolute top-2 right-2 bg-[#d9381e] text-white text-[10px] font-bold uppercase px-2 py-1 z-10 rounded-sm">
                      Envío Gratis
                    </div>

                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </Link>

                  {/* Info del Producto */}
                  <div>
                    <h3 className="text-sm text-gray-800 line-clamp-1">{p.title}</h3>
                    <p className="font-bold text-lg mt-1">${p.price.toLocaleString('es-AR')}</p>
                    
                    {/* Simulación de cuotas estilo Kongo */}
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#d9381e] font-bold">
                      <CreditCardIcon />
                      <span>6 cuotas sin interés de ${(p.price / 6).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* ================= BOTONES HOVER ================= */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20 flex gap-2 shadow-[0_-20px_20px_-15px_rgba(255,255,255,1)]">
                    
                    {/* Botón Comprar */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({ 
                          id: p.id, 
                          slug: p.slug,
                          title: p.title, 
                          price: p.price, 
                          size: "M", // Talle por defecto
                          quantity: 1, 
                          image: imageUrl 
                        }); 
                        // Como no usamos menú lateral, enviamos al usuario al carrito
                        router.push("/carrito"); 
                      }}
                      className="flex-1 bg-black text-white text-[11px] font-bold uppercase tracking-widest py-3 hover:bg-gray-800 transition-colors"
                    >
                      Comprar
                    </button>

                    {/* Botón Ver */}
                    <Link 
                      href={`/producto/${p.slug}`} 
                      className="flex-[0.5] border border-gray-300 text-black flex items-center justify-center gap-2 text-[11px] font-bold uppercase py-3 hover:border-black transition-colors"
                    >
                      <Eye size={14} /> Ver
                    </Link>

                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm uppercase tracking-widest">
              No se encontraron productos en esta categoría.
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function CreditCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
  );
}