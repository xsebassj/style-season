"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext"; // Traemos el contexto global

export default function Cart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [shippingMethod, setShippingMethod] = useState("local");
  const [isProcessing, setIsProcessing] = useState(false); // Para mostrar un estado de carga al pagar

  // Traemos el carrito real de tu estado global
  const { cart } = useCart();

  // Cálculos matemáticos reales
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === "local" ? 1500 : 6500;
  const total = subtotal + shippingCost;

  // ESTA ES LA FUNCIÓN MÁGICA QUE CONECTA CON MERCADO PAGO
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Armamos el paquete que le enviaremos al servidor
      // Incluimos el costo de envío como si fuera un "producto" más para que Mercado Pago lo cobre
      const itemsToPay = [
        ...cart,
        {
          id: "envio",
          name: `Envío ${shippingMethod === "local" ? "Resistencia" : "Nacional"}`,
          size: "Único",
          quantity: 1,
          price: shippingCost,
        }
      ];

      // 2. Llamamos a la API que creaste en el paso anterior
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: itemsToPay }),
      });

      const data = await response.json();

      // 3. Si Mercado Pago nos devuelve el ID, redirigimos al cliente a la pasarela segura
      if (data.id) {
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
      } else {
        alert("Hubo un error al generar el link de pago.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-navy/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-brand-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-brand-navy/10 flex justify-between items-center">
          <h2 className="font-serif text-2xl text-brand-navy uppercase">Tu Bolsa</h2>
          <button onClick={onClose} className="font-sans text-xs tracking-widest uppercase hover:text-brand-navy/50">
            Cerrar [X]
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span className="font-sans text-xs tracking-widest uppercase text-brand-navy/50">
              Tu carrito está vacío
            </span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-6">
                  <div>
                    <p className="font-sans text-xs font-semibold tracking-wider uppercase text-brand-navy">{item.name}</p>
                    <p className="font-sans text-[10px] tracking-widest text-brand-navy/50 uppercase">Talle: {item.size} | Cant: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-sm text-brand-navy">${item.price.toLocaleString('es-AR')}</span>
                </div>
              ))}

              <div className="mt-10">
                <h3 className="font-sans text-[10px] tracking-widest text-brand-navy uppercase mb-4">Método de entrega</h3>
                
                <label className={`block p-4 mb-3 border cursor-pointer transition-colors ${shippingMethod === "local" ? "border-brand-navy bg-brand-navy/5" : "border-brand-navy/20 hover:border-brand-navy/50"}`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="shipping" value="local" checked={shippingMethod === "local"} onChange={() => setShippingMethod("local")} className="accent-brand-navy" />
                      <span className="font-sans text-xs uppercase tracking-wider text-brand-navy">Cadetería (Resistencia)</span>
                    </div>
                    <span className="font-mono text-xs text-brand-navy">$1.500</span>
                  </div>
                  <p className="font-sans text-[10px] text-brand-navy/60 pl-6">Envío en moto en el día.</p>
                </label>

                <label className={`block p-4 border cursor-pointer transition-colors ${shippingMethod === "nacional" ? "border-brand-navy bg-brand-navy/5" : "border-brand-navy/20 hover:border-brand-navy/50"}`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="shipping" value="nacional" checked={shippingMethod === "nacional"} onChange={() => setShippingMethod("nacional")} className="accent-brand-navy" />
                      <span className="font-sans text-xs uppercase tracking-wider text-brand-navy">Envío Nacional</span>
                    </div>
                    <span className="font-mono text-xs text-brand-navy">$6.500</span>
                  </div>
                  <p className="font-sans text-[10px] text-brand-navy/60 pl-6">Despacho por correo a todo el país.</p>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-brand-navy/10 bg-brand-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-[10px] tracking-widest uppercase text-brand-navy/60">Subtotal</span>
                <span className="font-mono text-xs text-brand-navy">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-sans text-[10px] tracking-widest uppercase text-brand-navy/60">Envío</span>
                <span className="font-mono text-xs text-brand-navy">${shippingCost.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-sans text-xs tracking-widest uppercase font-bold text-brand-navy">Total</span>
                <span className="font-serif text-xl text-brand-navy">${total.toLocaleString('es-AR')}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full py-4 font-sans text-xs tracking-widest uppercase transition-colors ${
                  isProcessing ? "bg-brand-navy/50 cursor-not-allowed" : "bg-brand-navy hover:bg-brand-navy/90 text-brand-white"
                }`}
              >
                {isProcessing ? "Procesando..." : "Ir a Pagar"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}