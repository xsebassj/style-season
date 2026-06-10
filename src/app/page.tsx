"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Eye, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [activeDrop, setActiveDrop] = useState<any>(null);
  const [dropProducts, setDropProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para la configuración de diseño editable
  const [settings, setSettings] = useState<any>({
    marquee_text: "Envío gratis superando los $150.000 • 10% OFF pagando por transferencia",
    hero_image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop",
    hero_subtitle: "NUEVA TEMPORADA",
    b1_img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    b1_title: "Heavyweight",
    b1_btn: "Shop Buzos",
    b2_img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    b2_title: "Boxy Tees",
    b2_btn: "Shop Remeras",
  });

  const { addToCart, openCart } = useCart();

  useEffect(() => {
    const fetchHomeData = async () => {
      // 1. Cargar Configuración Visual
      const { data: settingsData } = await supabase.from("settings").select("*");
      if (settingsData) {
        const settingsMap: any = { ...settings };
        settingsData.forEach(s => settingsMap[s.key] = s.value);
        setSettings(settingsMap);
      }

      // 2. Buscar Drop Activo
      const { data: dropData } = await supabase.from("drops").select("*").eq("is_active", true).maybeSingle();

      if (dropData) {
        setActiveDrop(dropData);
        const { data: dProducts } = await supabase.from("products").select("*").eq("drop_id", dropData.id).limit(4);
        setDropProducts(dProducts || []);
      }

      // 3. Productos Destacados (Esenciales)
      let query = supabase.from("products").select("*").order("created_at", { ascending: false }).limit(4);
      if (dropData) query = query.neq("drop_id", dropData.id);
      
      const { data: fProducts } = await query;
      setFeaturedProducts(fProducts || []);

      setLoading(false);
    };

    fetchHomeData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-bold tracking-widest text-xs uppercase animate-pulse">Cargando Style Season...</div>;

  return (
    <div className="bg-white font-sans text-black pt-20">
      
      {/* 1. CINTA DE ANUNCIOS (Editable) */}
      <div className="bg-black text-white py-2 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee flex gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
          <span>{settings.marquee_text}</span><span>•</span>
          <span>{settings.marquee_text}</span><span>•</span>
          <span>{settings.marquee_text}</span><span>•</span>
          <span>{settings.marquee_text}</span>
        </div>
      </div>

      {/* 2. HERO BANNER PRINCIPAL (Editable) */}
      <section className="relative w-full h-[75vh] md:h-[85vh] bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={settings.hero_image} alt="Style Season Campaign" className="w-full h-full object-cover opacity-60" />
        </div>
        
        <div className="relative z-10 text-center px-6 flex flex-col items-center">
          <h2 className="text-[10px] md:text-xs text-white uppercase tracking-[0.3em] font-bold mb-4 drop-shadow-md">
            {settings.hero_subtitle}
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold uppercase text-white tracking-wider mb-8 drop-shadow-lg">
            {activeDrop ? activeDrop.name : "Colección Actual"}
          </h1>
          <Link href="/shop" className="bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300">
            Explorar Catálogo
          </Link>
        </div>
      </section>

      {/* 3. SECCIÓN: DROP ACTIVO */}
      {activeDrop && dropProducts.length > 0 && (
        <section className="py-20 px-6 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Último Lanzamiento</p>
              <h2 className="text-3xl font-bold uppercase tracking-wider">{activeDrop.name}</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
              Ver todo el drop <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {dropProducts.map(renderProductCard)}
          </div>
        </section>
      )}

      {/* 4. BANNERS DIVIDIDOS (Editables) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-20 max-w-[1600px] mx-auto">
        <Link href="/shop" className="relative h-[50vh] bg-gray-100 group overflow-hidden">
          <img src={settings.b1_img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h3 className="text-3xl font-bold uppercase tracking-wider mb-4">{settings.b1_title}</h3>
            <span className="border border-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-colors">{settings.b1_btn}</span>
          </div>
        </Link>
        <Link href="/shop" className="relative h-[50vh] bg-gray-100 group overflow-hidden">
          <img src={settings.b2_img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h3 className="text-3xl font-bold uppercase tracking-wider mb-4">{settings.b2_title}</h3>
            <span className="border border-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-colors">{settings.b2_btn}</span>
          </div>
        </Link>
      </section>

      {/* 5. SECCIÓN: ESENCIALES */}
      {featuredProducts.length > 0 && (
        <section className="pb-24 px-6 max-w-[1600px] mx-auto bg-white">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold uppercase tracking-wider">The Essentials</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Básicos atemporales para el día a día.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {featuredProducts.map(renderProductCard)}
          </div>
        </section>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 20s linear infinite; }
      `}} />
    </div>
  );

  function renderProductCard(p: any) {
    return (
      <div key={p.id} className="group relative flex flex-col">
        <Link href={`/shop/${p.id}`} className="relative bg-gray-100 aspect-[3/4] overflow-hidden mb-4 block">
          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </Link>
        <div>
          <h3 className="text-sm text-gray-800 line-clamp-1">{p.title}</h3>
          <p className="font-bold text-lg mt-1">${p.price.toLocaleString('es-AR')}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-white pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20 flex gap-2 shadow-[0_-20px_20px_-15px_rgba(255,255,255,1)]">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ id: p.id, name: p.title, price: p.price, size: "M", quantity: 1, image_url: p.image_url }); openCart(); }} className="flex-1 bg-black text-white text-[11px] font-bold uppercase tracking-widest py-3 hover:bg-gray-800 transition-colors">Comprar</button>
          <Link href={`/shop/${p.id}`} className="flex-[0.5] border border-gray-300 text-black flex items-center justify-center gap-2 text-[11px] font-bold uppercase py-3 hover:border-black transition-colors"><Eye size={14} /> Ver</Link>
        </div>
      </div>
    );
  }
}