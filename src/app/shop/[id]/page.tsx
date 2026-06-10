"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, MessageCircle, X } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      // 1. Traer el producto actual
      const { data: prodData } = await supabase.from("products").select("*").eq("id", id).single();
      if (prodData) {
        setProduct(prodData);
        setActiveImage(prodData.image_url);
        
        // 2. Traer 4 productos adicionales para rellenar la pantalla
        const { data: relatedData } = await supabase
          .from("products")
          .select("*")
          .neq("id", id) // Excluir el producto actual
          .limit(4);
        
        if (relatedData) setRelatedProducts(relatedData);
      }
      setLoading(false);
    };
    fetchProductAndRelated();
  }, [id]);

  // Función para consultas de WhatsApp
  const handleWhatsAppQuery = () => {

    const numero = "5493625337909"; 
    const mensaje = `¡Hola! Me interesa el producto *${product.title}*.\n\n¿Podrías darme más información?\n\nLink: ${window.location.href}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-navy tracking-widest text-xs uppercase animate-pulse">Cargando...</div>;

  return (
    <div className="min-h-screen bg-brand-white pt-32 px-6 pb-20 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* SECCIÓN PRINCIPAL DEL PRODUCTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          
          {/* COLUMNA IZQUIERDA: IMÁGENES */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] bg-gray-50 overflow-hidden border border-brand-navy/5">
              <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {/* Galería pequeña */}
            <div className="grid grid-cols-5 gap-2">
              {[product.image_url, ...(product.gallery || [])].map((img, i) => (
                <button key={i} onClick={() => setActiveImage(img)} className={`aspect-square border-2 transition-colors ${activeImage === img ? 'border-brand-navy' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO Y COMPRA COMPACTA */}
          <div className="flex flex-col">
            <p className="text-[10px] text-brand-navy/50 uppercase tracking-widest mb-2">Inicio / Shop / {product.title}</p>
            <h1 className="text-4xl font-serif font-bold text-brand-navy mb-4 uppercase">{product.title}</h1>
            <p className="text-2xl font-mono text-brand-navy mb-6">${product.price.toLocaleString('es-AR')}</p>

            {/* Promociones visuales */}
            <div className="bg-brand-navy/5 p-4 mb-8 text-[12px] text-brand-navy border-l-4 border-brand-navy">
              <p className="font-bold">🔥 6 cuotas sin interés de ${(product.price / 6).toFixed(0)}</p>
              <p className="text-brand-navy/70 mt-1">10% de descuento pagando con Transferencia</p>
            </div>

            {/* BLOQUE DE COMPRA (Todo junto y organizado) */}
            <div className="bg-white border border-brand-navy/10 p-6 shadow-sm">
              
              {/* Talles */}
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy block mb-3">Talle seleccionado: {selectedSize}</label>
                <div className="flex gap-2">
                  {["S", "M", "L", "XL"].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 border text-xs font-medium transition-colors ${selectedSize === s ? 'bg-brand-navy text-brand-white border-brand-navy' : 'border-brand-navy/20 text-brand-navy hover:border-brand-navy'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setIsSizeGuideOpen(true)} className="w-full py-3 mb-6 border border-brand-navy text-brand-navy text-[10px] uppercase tracking-widest font-bold hover:bg-brand-navy hover:text-brand-white transition-colors">
                Conocé tu talle
              </button>

              {/* Cantidad y Agregar (Directamente debajo) */}
              <div className="flex gap-4 mb-4">
                <div className="flex border border-brand-navy/20 items-center">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-brand-navy hover:bg-brand-navy/5 h-full py-3"><Minus size={14}/></button>
                  <span className="px-4 font-mono text-sm text-brand-navy">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-brand-navy hover:bg-brand-navy/5 h-full py-3"><Plus size={14}/></button>
                </div>
                <button onClick={() => { addToCart({ id: product.id, name: product.title, price: product.price, size: selectedSize, quantity, image_url: product.image_url }); openCart(); }} className="flex-1 bg-brand-navy text-brand-white font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-brand-navy/90 transition-colors">
                  Añadir a la bolsa
                </button>
              </div>

              {/* WhatsApp */}
              <button 
                onClick={handleWhatsAppQuery}
                className="w-full flex items-center justify-center gap-2 py-3 text-[#25D366] border border-[#25D366]/20 bg-[#25D366]/5 font-bold text-[10px] uppercase tracking-widest hover:bg-[#25D366]/10 transition-colors"
              >
                <MessageCircle size={16} /> Consultar por WhatsApp
              </button>
            </div>
            
          </div>
        </div>

        {/* SECCIÓN DE PRODUCTOS RELACIONADOS (Rellena el espacio inferior) */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-brand-navy/10 pt-16">
            <h2 className="text-xl font-serif font-bold text-brand-navy uppercase tracking-widest mb-8 text-center">
              También podría interesarte
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <Link href={`/shop/${relProd.id}`} key={relProd.id} className="group block">
                  <div className="aspect-[4/5] bg-gray-50 overflow-hidden mb-4 relative">
                    <img src={relProd.image_url} alt={relProd.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="text-xs font-bold text-brand-navy uppercase">{relProd.title}</h3>
                  <p className="text-sm font-mono text-brand-navy/80 mt-1">${relProd.price.toLocaleString('es-AR')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL / GUÍA DE TALLES Y DESCRIPCIÓN (Se alimenta del panel Admin) */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 bg-brand-navy/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#f7f7f7] w-full max-w-6xl max-h-[90vh] overflow-y-auto relative p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12">
            
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-6 right-6 text-brand-navy/50 hover:text-brand-navy transition-colors">
              <X size={24} />
            </button>

            <div className="flex-1 text-sm text-brand-navy/80 leading-relaxed font-sans space-y-6">
              <div>
                <h3 className="font-bold text-brand-navy text-lg mb-4 uppercase font-serif">{product.title}</h3>
                {/* ESTO ES LO QUE EDITAS EN EL PANEL ADMIN */}
                <p className="whitespace-pre-line">{product.description || "Sin descripción adicional."}</p>
              </div>

              <div className="pt-6 border-t border-brand-navy/10">
                <p className="font-bold text-brand-navy mb-2">Cuidados:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Lavar en agua fría.</li>
                  <li>A mano del lado del revés.</li>
                  <li>No usar lavandina.</li>
                  <li>No planchar sobre estampa.</li>
                </ul>
              </div>
            </div>

            <div className="flex-[1.5]">
              <h3 className="font-bold text-brand-navy text-lg mb-6">Medidas aproximadas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-brand-navy">
                  <thead className="bg-brand-navy/5">
                    <tr>
                      <th className="p-4 font-bold">Talle</th>
                      <th className="p-4">Largo</th>
                      <th className="p-4">Ancho</th>
                      <th className="p-4">Mangas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-navy/10">
                    <tr><td className="p-4 font-bold">S</td><td className="p-4">72 cm</td><td className="p-4">61 cm</td><td className="p-4">24 cm</td></tr>
                    <tr><td className="p-4 font-bold">M</td><td className="p-4">74 cm</td><td className="p-4">63 cm</td><td className="p-4">25 cm</td></tr>
                    <tr><td className="p-4 font-bold">L</td><td className="p-4">76 cm</td><td className="p-4">65 cm</td><td className="p-4">26 cm</td></tr>
                    <tr><td className="p-4 font-bold">XL</td><td className="p-4">78 cm</td><td className="p-4">67 cm</td><td className="p-4">27 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
}