"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, User, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation"; 

export default function Navbar() {
  const pathname = usePathname(); 
  const [scrolled, setScrolled] = useState(false);
  const [userRoute, setUserRoute] = useState("/login"); 
  const { openCart, cart } = useCart();
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    const checkUser = async (session: any) => {
      if (session) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        setUserRoute(data?.role === 'admin' ? '/admin' : '/'); 
      } else {
        setUserRoute('/login');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-brand-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO DE LA MARCA (Reemplazó a las letras "SS") */}
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.jpg" 
            alt="Style Season Logo" 
            className={`object-contain mix-blend-multiply transition-all duration-500 ${scrolled ? "h-10 md:h-12" : "h-12 md:h-16"}`} 
          />
        </Link>
        
        <nav className="hidden md:flex gap-8 text-xs tracking-widest uppercase font-medium text-brand-navy">
          <Link href="/" className="hover:opacity-60 transition-opacity">Home</Link>
          <Link href="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
          <Link href="/drops" className="hover:opacity-60 transition-opacity">Drops</Link>
        </nav>

        <div className="flex gap-5 text-brand-navy items-center">
          <button aria-label="Buscar" className="hover:opacity-60 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>
          
          <Link href={userRoute} aria-label="Usuario" className="hover:opacity-60 transition-opacity">
            <User size={20} strokeWidth={1.5} />
          </Link>
          
          <button onClick={openCart} aria-label="Carrito" className="hover:opacity-60 transition-opacity relative">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-navy text-brand-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}