"use client";
import { useCart } from "@/context/CartContext";
import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation"; // <-- IMPORTANTE: Importamos el router

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter(); // <-- Inicializamos el router

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // NUEVA LÓGICA REDUCIDA: Cierra el panel y manda al cliente a la página de checkout
  const handleCheckout = () => {
    closeCart(); 
    router.push('/checkout'); 
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro desenfocado */}
      <div 
        className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={closeCart} 
      />
      
      {/* Panel del Carrito */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-brand-white z-[110] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 font-sans">
        
        {/* Cabecera */}
        <div className="px-8 py-6 border-b border-brand-navy/10 flex justify-between items-center bg-brand-white">
          <h2 className="font-serif text-xl tracking-widest text-brand-navy uppercase font-bold">Tu Carrito</h2>
          <button onClick={closeCart} className="p-2 text-brand-navy/50 hover:text-brand-navy transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-navy/40 space-y-6">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-[10px] uppercase tracking-[0.2em]">El carrito está vacío</p>
              <button 
                onClick={closeCart} 
                className="mt-4 px-8 py-4 border border-brand-navy text-brand-navy text-[10px] uppercase tracking-widest font-bold hover:bg-brand-navy hover:text-brand-white transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            cart.map((item: any, index: number) => (
              <div key={`${item.id}-${item.size}-${index}`} className="flex gap-6 border border-brand-navy/5 p-4 bg-white shadow-sm group">
                
                {/* Imagen del Producto */}
                <div className="w-20 h-28 bg-gray-50 shrink-0 overflow-hidden border border-brand-navy/5">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-brand-navy/30 tracking-widest uppercase">Foto</div>
                  )}
                </div>

                {/* Info y Controles */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  
                  {/* Título y Basurero */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-[11px] uppercase tracking-wider text-brand-navy line-clamp-2">{item.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-brand-navy/50 mt-1.5">Talle: {item.size}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.size)} 
                      className="text-brand-navy/30 hover:text-red-600 transition-colors p-1"
                      title="Eliminar producto"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Cantidad y Precio */}
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex border border-brand-navy/20 items-center bg-brand-white">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} 
                        className="px-2.5 py-1.5 text-brand-navy hover:bg-brand-navy/5 transition-colors"
                      >
                        <Minus size={12} strokeWidth={1.5} />
                      </button>
                      <span className="px-3 font-mono text-xs text-brand-navy">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} 
                        className="px-2.5 py-1.5 text-brand-navy hover:bg-brand-navy/5 transition-colors"
                      >
                        <Plus size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                    
                    <p className="font-mono text-sm font-bold text-brand-navy">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </p>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total y Botón) */}
        {cart.length > 0 && (
          <div className="border-t border-brand-navy/10 p-8 bg-brand-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-navy">Total Estimado</span>
              <span className="font-mono text-xl font-bold text-brand-navy">${total.toLocaleString('es-AR')}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              className="w-full py-5 bg-brand-navy text-brand-white font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-brand-navy/90 transition-all flex justify-center items-center gap-3"
            >
              Finalizar Compra
            </button>
          </div>
        )}

      </div>
    </>
  );
}