import Link from 'next/link';
import Image from 'next/image';

export default function DropsPage() {
  // Simulamos datos de drops (esto en el futuro vendrá de Payload)
  const drops = [
    { id: 1, title: 'Summer Essentials', status: 'active', date: 'Disponible ahora', image: '/placeholder.jpg' },
    { id: 2, title: 'Winter Archive', status: 'coming-soon', date: 'Lanzamiento: 15/07/2026', image: '/placeholder.jpg' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-widest mb-16">Drops</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {drops.map((drop) => (
          <div key={drop.id} className="relative group">
            <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden rounded-lg">
              {/* Imagen placeholder - asegúrate de tener una imagen en public o cambia el path */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                Imagen del Drop
              </div>
            </div>
            
            <div className="mt-6">
              <span className={`text-xs font-bold uppercase tracking-widest ${drop.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                {drop.date}
              </span>
              <h2 className="text-2xl font-medium text-gray-900 mt-2">{drop.title}</h2>
              
              {drop.status === 'active' ? (
                <Link href="/shop" className="inline-block mt-4 text-sm underline underline-offset-4 hover:text-gray-600">
                  Comprar ahora &rarr;
                </Link>
              ) : (
                <button className="mt-4 text-sm text-gray-400 cursor-not-allowed">
                  Próximamente
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}