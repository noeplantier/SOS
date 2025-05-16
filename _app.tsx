import type { AppProps } from 'next/app';
import { Toaster } from './components/Toaster';
import '../styles/globals.css'; // Importez votre CSS global ici

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}