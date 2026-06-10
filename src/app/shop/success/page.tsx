"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-brand-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full border border-brand-navy/20 p-10 md:p-14"
      >
        <div className="w-16 h-16 bg-brand-navy text-brand-white rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="font-serif text-3xl md:text-4xl text-brand-navy uppercase mb-4">
          ¡Orden Confirmada!
        </h1>
        
        <p className="font-sans text-xs leading-relaxed text-brand-navy/70 mb-8 tracking-wide">
          Tu pago ha sido procesado con éxito. En los próximos minutos recibirás un correo electrónico con el recibo y las instrucciones para el seguimiento de tu envío.
        </p>

        <div className="flex justify-center">
          <Link 
            href="/shop"
            className="inline-block border-b border-brand-navy text-brand-navy font-sans text-[10px] uppercase tracking-widest hover:text-brand-navy/50 transition-colors pb-1"
          >
            Volver al Catálogo
          </Link>
        </div>
      </motion.div>
    </div>
  );
}