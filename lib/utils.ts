import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour combiner les classes CSS avec tailwind et clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatage des dates
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatage des coordonnées GPS
 */
export function formatGPSCoordinates(coordinates: string): string {
  if (!coordinates) return 'Position inconnue';
  
  // Format attendu: "latitude,longitude"
  const [lat, lng] = coordinates.split(',').map(c => parseFloat(c.trim()));
  
  if (isNaN(lat) || isNaN(lng)) return coordinates;
  
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Génération d'un ID unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Troncature de texte
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}