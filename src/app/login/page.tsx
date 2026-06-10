"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // INICIO CON CORREO Y CONTRASEÑA
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Lógica de Iniciar Sesión
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
      } else {
        // Lógica de Crear Cuenta
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("¡Cuenta creada! Revisa tu correo para confirmarla.");
        setIsLogin(true); // Lo pasamos a la pestaña de login
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "Correo o contraseña incorrectos" : err.message);
    } finally {
      setLoading(false);
    }
  };

  // INICIO CON GOOGLE
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white flex flex-col justify-center items-center px-6 font-sans">
      
      {/* Botón Volver */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-navy/60 hover:text-brand-navy transition-colors">
        <ChevronLeft size={16} /> Volver a la tienda
      </Link>

      <div className="w-full max-w-md bg-white p-8 md:p-12 border border-brand-navy/10 shadow-sm">
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-brand-navy font-bold tracking-widest uppercase mb-2">Style Season</h1>
          <p className="text-[10px] uppercase tracking-widest text-brand-navy/50">Mi Cuenta</p>
        </div>

        {/* Pestañas Login / Registro */}
        <div className="flex border-b border-brand-navy/10 mb-8">
          <button 
            onClick={() => setIsLogin(true)} 
            className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${isLogin ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-brand-navy/40 hover:text-brand-navy/80'}`}
          >
            Ingresar
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${!isLogin ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-brand-navy/40 hover:text-brand-navy/80'}`}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && <p className="text-xs text-red-500 bg-red-50 p-3 text-center">{error}</p>}
          
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-4 border border-brand-navy/20 text-sm outline-none focus:border-brand-navy transition-colors text-brand-navy"
            required 
          />
          
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-4 border border-brand-navy/20 text-sm outline-none focus:border-brand-navy transition-colors text-brand-navy"
            required 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-brand-navy text-brand-white font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <div className="relative flex py-8 items-center">
          <div className="flex-grow border-t border-brand-navy/10"></div>
          <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest text-brand-navy/40">O continuar con</span>
          <div className="flex-grow border-t border-brand-navy/10"></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full py-4 border border-brand-navy/20 text-brand-navy font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-gray-50 transition-colors flex justify-center items-center gap-3 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

      </div>
    </div>
  );
}