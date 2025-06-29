import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale: string = 'fr-FR', currency: string = 'CFA') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!dateString) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('fr-FR', mergedOptions).format(new Date(dateString));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export function buildImageUrl(imagePath: string, tenantId?: string): string {
  if (!imagePath) {
    return 'https://placehold.co/100x100?text=No+Image';
  }
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si c'est un placeholder, le retourner tel quel
  if (imagePath.includes('placehold.co')) {
    return imagePath;
  }
  
  // Construire l'URL complète
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://nigerdev.com' 
    : 'http://localhost:3001';
  
  let finalUrl = '';
  
  // Si le chemin commence par /uploads, l'utiliser directement
  if (imagePath.startsWith('/uploads')) {
    finalUrl = `${baseUrl}${imagePath}`;
  }
  // Sinon, construire le chemin avec le tenantId
  else if (tenantId) {
    finalUrl = `${baseUrl}/uploads/${tenantId}/${imagePath}`;
  }
  // Fallback : essayer de deviner le chemin
  else {
    finalUrl = `${baseUrl}/uploads/${imagePath}`;
  }
  
  return finalUrl;
}
