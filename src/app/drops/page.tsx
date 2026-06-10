"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";

export default function DropsPage() {
  const [dropName, setDropName] = useState("Siguiente Colección");
  const [dropDate, setDropDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{días?: number, horas?: number, minutos?: number, segundos?: number}>({});
  const [loading, setLoading] = useState(true);

  // Conexión con el Panel Admin
  useEffect(() => {
    const fetchDropData = async () => {
      const { data: nameData } = await supabase.from("settings").select("value").eq("key", "drop_name").maybeSingle();
      const { data: dateData } = await supabase.from("settings").select("value").eq("key", "drop_date").maybeSingle();
      
      if (nameData?.value) setDropName(nameData.value);
      if (dateData?.value) setDropDate(dateData.value);
      setLoading(false);
    };
    fetchDropData();
  }, []);

  // Lógica del Contador
  useEffect(() => {
    if (!dropDate) return;
    
    const timer = setInterval(() => {
      const difference = +new Date(dropDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          días: Math.floor(difference / (1000 * 60 * 60 * 24)),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({});
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dropDate]);

  if (loading) return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center text-brand-navy animate-pulse font-sans text-xs uppercase tracking-widest">
      Sincronizando Lanzamiento...
    </div>
  );

  const isDropActive = dropDate && Object.keys(timeLeft).length === 0;

  return (
    // Agregamos pt-32 o pt-40 para respetar el espacio del Navbar global
    <div className="min-h-screen bg-brand-white text-brand-navy flex flex-col pt-32 pb-12">
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        
        {/* Subtítulo y Título */}
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-brand-navy/50 mb-6 animate-in fade-in duration-1000">
          {isDropActive ? "Disponible Ahora" : "Próximo Lanzamiento"}
        </p>
        
        <h1 className="font-serif text-4xl md:text-5xl text-brand-navy uppercase tracking-widest mb-12 animate-in slide-in-from-bottom-4 duration-1000">
          {dropName}
        </h1>

        {/* CONTADOR / BOTÓN */}
        {!dropDate ? (
          <p className="font-sans text-sm text-brand-navy/40 uppercase tracking-widest mb-16">Fecha por anunciar</p>
        ) : isDropActive ? (
          <Link 
            href="/shop" 
            className="inline-block bg-brand-navy text-brand-white font-bold font-sans uppercase text-xs tracking-[0.2em] px-12 py-5 hover:bg-brand-navy/90 transition-colors mb-16"
          >
            Entrar a la tienda
          </Link>
        ) : (
          <div className="flex justify-center gap-6 md:gap-12 text-center animate-in fade-in duration-1000 delay-300 mb-16">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex flex-col items-center">
                <span className="text-5xl md:text-6xl font-light font-mono text-brand-navy mb-2 w-16 md:w-24 border-b border-brand-navy/10 pb-2">
                  {value?.toString().padStart(2, '0')}
                </span>
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-navy/50 pt-2">{unit}</span>
              </div>
            ))}
          </div>
        )}

        {/* LOGO DE LA MARCA */}
        <div className="animate-in fade-in duration-1000 delay-500">
          <img 
            src="/logo.jpg" 
            alt="Style Season Logo" 
            className="w-48 md:w-64 object-contain mix-blend-multiply opacity-90"
          />
        </div>

      </main>
    </div>
  );
}