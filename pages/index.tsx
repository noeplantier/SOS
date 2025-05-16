import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  
  // Vérifiez que la redirection fonctionne correctement
  useEffect(() => {
    // Décommentez pour tester une redirection automatique
    // router.push('/n8n');
  }, [router]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Système d'Alerte SOS</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/n8n">
          <div className="p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Gestion des workflows</h2>
            <p>Accéder à la gestion des workflows n8n</p>
          </div>
        </Link>
        
        <Link href="/alerts">
          <div className="p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Alertes</h2>
            <p>Voir et gérer les alertes en cours</p>
          </div>
        </Link>
        
        <Link href="/config">
          <div className="p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Configuration</h2>
            <p>Configurer l'application SOS</p>
          </div>
        </Link>
      </div>
      
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800 mb-2">Bouton SOS d'urgence</h3>
        <Link href="/emergency">
          <button className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
            SOS
          </button>
        </Link>
      </div>
    </div>
  );
}