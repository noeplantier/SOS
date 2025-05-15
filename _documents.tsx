import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Autres balises head */}
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Désinscrire d'abord les service workers existants
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                }).then(function() {
                  // Enregistrer notre service worker correctif
                  navigator.serviceWorker.register('/fix-sw.js', {scope: '/'})
                    .then(() => console.log('Service Worker correctif enregistré'))
                    .catch(err => console.error('Erreur d\'enregistrement du Service Worker:', err));
                });
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}