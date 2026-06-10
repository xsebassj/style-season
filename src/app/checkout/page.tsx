"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Truck, CreditCard, AlertCircle, MapPin, ChevronDown, ChevronUp, Store, Smartphone } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, closeCart } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  
  // Paso 1
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Argentina");
  const [zipCode, setZipCode] = useState("");
  const [errors, setErrors] = useState({ email: false, zipCode: false });
  
  // Paso 2 (Logística)
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [showAllShipping, setShowAllShipping] = useState(false);
  const [locationName, setLocationName] = useState("");
  
  const [formData, setFormData] = useState({
    nombre: "", apellido: "", telefono: "", calle: "", numero: "",
    depto: "", barrio: "", ciudad: "", dni: "", sinNumero: false, facturaMismosDatos: true
  });

  // Paso 3 (Pago)
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;
  // Calculamos el total con descuento si elige transferencia
  const finalTotal = paymentMethod === "transferencia" ? total * 0.9 : total;

  useEffect(() => {
    if (cart.length === 0) router.push("/shop");
    else setLoading(false);
  }, [cart, router]);

  useEffect(() => {
    const selected = shippingOptions.find(opt => opt.id === selectedShippingId);
    if (selected) setShippingCost(selected.price);
  }, [selectedShippingId, shippingOptions]);

  const handleContinueStep1 = () => {
    const newErrors = { email: !email.includes("@"), zipCode: zipCode.length < 4 };
    setErrors(newErrors);

    if (!newErrors.email && !newErrors.zipCode) {
      // AQUÍ ESTABA EL ERROR: Agregamos ": any[]" para que TypeScript no se queje
      let options: any[] = []; 
      
      const localPickup = { 
        id: "pickup", 
        name: "Retiro en el Local (Resistencia, Chaco)", 
        time: "Listo para retirar en 24hs hábiles", 
        price: 0,
        icon: "store"
      };
      
      if (country === "Argentina") {
        if (zipCode.startsWith("35")) {
          setLocationName("Chaco, Argentina");
          options = [
            localPickup,
            { id: "moto", name: "Moto Mensajería Local", time: "Llega hoy o mañana", price: 2500, icon: "truck" },
            { id: "correo_regional", name: "Correo Argentino a Domicilio", time: "Llega en 2 a 4 días hábiles", price: 8500, icon: "truck" },
          ];
        } else {
          const tarifaBase = 9500;
          const difDistancia = Math.abs(3500 - parseInt(zipCode));
          const costoDinamico = Math.round((tarifaBase + (difDistancia * 1.8)) / 100) * 100; 

          let zona = "Argentina";
          if (zipCode.startsWith("1") || zipCode.startsWith("C") || zipCode.startsWith("B")) zona = "Buenos Aires";
          else if (zipCode.startsWith("3")) zona = "Región Litoral/Norte";
          else if (zipCode.startsWith("5")) zona = "Córdoba/Centro";
          else if (zipCode.startsWith("9")) zona = "Patagonia";
          
          setLocationName(zona);
          
          options = [
            { id: "correo_nacional", name: "Correo Argentino (Clásico)", time: "Llega en 4 a 7 días hábiles", price: costoDinamico, icon: "truck" },
            { id: "andreani_express", name: "Andreani Express", time: "Llega en 2 a 4 días hábiles", price: costoDinamico * 1.45, icon: "truck" }
          ];
        }
      } else {
        setLocationName(country);
        options = [
          { id: "dhl", name: "DHL Express International", time: "Llega en 7 a 15 días hábiles", price: 45000, icon: "truck" }
        ];
      }

      setShippingOptions(options);
      setSelectedShippingId(options[0].id); 
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handleGoToPaymentStep = () => {
    if (selectedShippingId !== "pickup" && (!formData.nombre || !formData.apellido || !formData.calle || !formData.dni)) {
      alert("Completá los campos obligatorios del destinatario.");
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- LÓGICA DE CONEXIÓN (MP y WhatsApp) ---
  const handleFinalizeOrder = async () => {
    setIsProcessing(true);

    if (paymentMethod === "transferencia") {
      // 1. LÓGICA WHATSAPP
      // Reemplaza ESTE número por el de tu negocio (incluyendo el código de país, ej: 549 para Argentina)
      const numeroVendedor = "5493621234567"; 
      
      let texto = `*¡Hola! Quiero confirmar mi pedido de Style Season* 🖤\n\n`;
      texto += `👤 *Datos:* ${formData.nombre} ${formData.apellido} (DNI: ${formData.dni})\n`;
      texto += `🚚 *Envío:* ${shippingOptions.find(o => o.id === selectedShippingId)?.name}\n`;
      if (selectedShippingId !== "pickup") texto += `📍 *Dirección:* ${formData.calle} ${formData.numero}, ${formData.ciudad}\n`;
      
      texto += `\n🛍️ *Productos:*\n`;
      cart.forEach(item => {
        texto += `- ${item.quantity}x ${item.name} (Talle: ${item.size}) - $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
      });
      
      texto += `\n💵 *Subtotal:* $${subtotal.toLocaleString('es-AR')}\n`;
      texto += `📦 *Costo de envío:* $${shippingCost.toLocaleString('es-AR')}\n`;
      texto += `🎁 *Descuento Transferencia (10%):* -$${(total * 0.1).toLocaleString('es-AR')}\n`;
      texto += `💳 *TOTAL A TRANSFERIR:* $${finalTotal.toLocaleString('es-AR')}\n\n`;
      texto += `*Espero los datos bancarios para transferir. ¡Gracias!*`;

      const urlWhatsApp = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(texto)}`;
      
      // Abrimos WhatsApp y limpiamos el carrito simulando que ya compró
      window.open(urlWhatsApp, '_blank');
      // Podrías llamar a closeCart() o limpiar el carrito aquí
      setIsProcessing(false);

    } else {
      // 2. LÓGICA MERCADO PAGO
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items: cart, 
            shippingCost: shippingCost, 
            shippingName: shippingOptions.find(o => o.id === selectedShippingId)?.name 
          })
        });
        
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url; // Redirige a Mercado Pago
        } else {
          alert("Error al conectar con Mercado Pago.");
        }
      } catch (error) {
        console.error(error);
        alert("Hubo un error al iniciar el pago.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      {/* HEADER */}
      <header className="w-full py-6 px-8 border-b border-gray-200 flex justify-between items-center">
        <Link href="/" className="font-serif text-3xl font-bold tracking-widest italic">Style Season</Link>
      </header>

      {/* STEPPER */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="flex items-center justify-center space-x-2 md:space-x-4">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500 stroke-1" />
            <span className="text-[11px] text-gray-500 uppercase tracking-widest">Carrito</span>
          </div>
          <div className="h-[1px] w-12 md:w-32 bg-gray-300 -mt-5"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {step > 1 ? <CheckCircle2 className="w-6 h-6 text-green-500 stroke-1" /> : <Circle className="w-6 h-6 text-black fill-black stroke-1" />}
              {step === 1 && <Truck className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />}
            </div>
            <span className={`text-[11px] uppercase tracking-widest ${step === 1 ? 'text-black font-bold' : 'text-gray-500'}`}>Entrega</span>
          </div>
          <div className="h-[1px] w-12 md:w-32 bg-gray-300 -mt-5"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {step === 3 ? <Circle className="w-6 h-6 text-black fill-black stroke-1" /> : <Circle className="w-6 h-6 text-gray-300 stroke-1" />}
              <CreditCard className={`w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${step === 3 ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className={`text-[11px] uppercase tracking-widest ${step === 3 ? 'text-black font-bold' : 'text-gray-400'}`}>Pago</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          <section>
            <h2 className="text-lg font-medium mb-4">Datos de contacto</h2>
            {step === 1 ? (
              <div className="space-y-2">
                <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded text-sm outline-none focus:border-black" />
              </div>
            ) : (
              <div className="w-full p-3 border border-gray-300 rounded text-sm flex justify-between items-center bg-gray-50">
                <span className="text-gray-800">{email}</span>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium mb-4">Entrega</h2>
            {step === 1 ? (
              <div className="space-y-4">
                <input type="text" placeholder="Código Postal" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full p-3 border border-gray-300 rounded text-sm outline-none focus:border-black" />
                <div className="flex justify-end pt-4">
                  <button onClick={handleContinueStep1} className="bg-black text-white px-12 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800">Continuar</button>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  {shippingOptions.map((option) => (
                    <label key={option.id} className={`border rounded p-4 flex justify-between items-start cursor-pointer transition-colors ${selectedShippingId === option.id ? 'border-black bg-gray-50/50' : 'border-gray-200'}`}>
                      <div className="flex gap-3">
                        <input type="radio" checked={selectedShippingId === option.id} onChange={() => setSelectedShippingId(option.id)} className="mt-1 accent-black" />
                        <div>
                          <p className="text-sm font-medium">{option.name}</p>
                          <p className="text-xs text-gray-500">{option.time}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{option.price === 0 ? "Gratis" : `$${option.price}`}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-base font-medium">Datos del destinatario</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="p-3 border border-gray-300 rounded text-sm focus:border-black" />
                    <input type="text" placeholder="Apellido" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="p-3 border border-gray-300 rounded text-sm focus:border-black" />
                  </div>
                  <input type="text" placeholder="DNI" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full p-3 border border-gray-300 rounded text-sm focus:border-black" />
                  
                  {selectedShippingId !== "pickup" && (
                    <input type="text" placeholder="Calle y Número" value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} className="w-full p-3 border border-gray-300 rounded text-sm focus:border-black" />
                  )}
                </div>

                <div className="flex justify-end pt-8">
                  <button onClick={handleGoToPaymentStep} className="bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800">Ir al Pago</button>
                </div>
              </div>
            ) : (
              <div className="w-full p-3 border border-gray-300 rounded text-sm flex justify-between items-center bg-gray-50 mb-8">
                <div>
                  <span className="text-gray-800 font-bold block">{shippingOptions.find(o => o.id === selectedShippingId)?.name}</span>
                  <span className="text-gray-500 text-xs">{selectedShippingId === "pickup" ? "Retiro en local" : `${formData.calle}, CP ${zipCode}`}</span>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-black font-medium hover:underline">Cambiar</button>
              </div>
            )}
          </section>

          {/* NUEVO: SECCIÓN 3 - PAGO */}
          {step === 3 && (
            <section className="animate-in fade-in duration-500">
              <h2 className="text-lg font-medium mb-4">Medio de pago</h2>
              
              <div className="space-y-4">
                {/* Opción Mercado Pago */}
                <label className={`border rounded p-4 flex flex-col cursor-pointer transition-colors ${paymentMethod === 'mercadopago' ? 'border-black bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} className="accent-black" />
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-sm">Mercado Pago (Tarjetas o Dinero en cuenta)</span>
                  </div>
                  {paymentMethod === 'mercadopago' && (
                    <p className="ml-8 mt-2 text-xs text-gray-500">Serás redirigido al sitio seguro de Mercado Pago para completar tu compra.</p>
                  )}
                </label>

                {/* Opción Transferencia / WhatsApp */}
                <label className={`border rounded p-4 flex flex-col cursor-pointer transition-colors ${paymentMethod === 'transferencia' ? 'border-black bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'transferencia'} onChange={() => setPaymentMethod('transferencia')} className="accent-black" />
                      <Smartphone className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-sm">Transferencia Bancaria (Acordar por WhatsApp)</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded">10% OFF</span>
                  </div>
                  {paymentMethod === 'transferencia' && (
                    <p className="ml-8 mt-2 text-xs text-gray-500">Se abrirá WhatsApp con el resumen de tu pedido. Envianos el comprobante de transferencia por ese medio.</p>
                  )}
                </label>
              </div>

              <div className="flex justify-end pt-8 mt-8 border-t border-gray-100">
                <button 
                  onClick={handleFinalizeOrder} 
                  disabled={isProcessing}
                  className="bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors w-full md:w-auto disabled:bg-gray-400"
                >
                  {isProcessing ? "Procesando..." : paymentMethod === "transferencia" ? "Comprar por WhatsApp" : "Pagar con Mercado Pago"}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8 bg-white border border-gray-100 p-6 rounded shadow-sm">
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto scrollbar-hide pr-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-16 bg-gray-50 overflow-hidden shrink-0 rounded border"><img src={item.image_url} className="w-full h-full object-cover" /></div>
                    <p className="text-sm">{item.name} ({item.size}) <span className="text-gray-400">× {item.quantity}</span></p>
                  </div>
                  <p className="text-sm whitespace-nowrap">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm"><p>Subtotal</p><p>${subtotal.toLocaleString('es-AR')}</p></div>
              {step >= 2 && <div className="flex justify-between text-sm"><p>Envío</p><p>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString('es-AR')}`}</p></div>}
              
              {/* Mostramos el descuento en vivo si eligió Transferencia */}
              {paymentMethod === "transferencia" && step === 3 && (
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <p>Descuento Transferencia (10%)</p>
                  <p>-$${(total * 0.1).toLocaleString('es-AR')}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t">
                <span className="text-lg">Total</span>
                <span className="text-xl font-medium">${finalTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}