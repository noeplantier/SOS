import { useEffect } from 'react';

declare global {
  interface Window {
    workbox?: unknown;
  }
}

function MyApp({ Component, pageProps }) {
  // Enregistrement du Service Worker
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined &&
      process.env.NODE_ENV === 'production'
    ) {
      // Enregistrer le Service Worker
      navigator.serviceWorker
        .register('/bfcache-sw.js')
        .then(registration => {
          console.log('Service Worker enregistré avec succès:', registration);
        })
        .catch(error => {
          console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;