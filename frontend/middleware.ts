import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Liste des chemins qui ne doivent pas être traités comme des tenants
const nonTenantPaths = [
  '/login',
  '/about',
  '/contact',
  '/admin',
  '/super-admin',
  '/tenant-admin',
  '/api'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si le chemin est en majuscule, et si oui, le rediriger vers la version minuscule
  // Par exemple: /Login -> /login
  const lowercasePath = pathname.toLowerCase()
  
  if (pathname !== lowercasePath) {
    return NextResponse.redirect(
      new URL(lowercasePath, request.url)
    )
  }

  // Si le chemin commence par un des chemins non-tenant, le laisser passer
  for (const path of nonTenantPaths) {
    if (pathname.startsWith(path)) {
      return NextResponse.next()
    }
  }

  // Pour tous les autres cas, laisser passer (sera traité par le tenant layout si nécessaire)
  return NextResponse.next()
}

// Définir sur quels chemins le middleware s'applique
export const config = {
  matcher: [
    // Exclure les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 