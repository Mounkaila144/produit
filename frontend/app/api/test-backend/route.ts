import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'URL de l'API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    // Essayer de se connecter à un endpoint simple qui ne nécessite pas d'authentification
    // ou d'en-tête tenant ID
    const url = `${apiUrl}/api/health`;
    
    console.log(`Test de connexion au backend: ${url}`);
    
    const response = await fetch(url, {
      // Définir un timeout pour ne pas attendre indéfiniment
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors du test du backend:`, errorText);
      return NextResponse.json({
        success: false,
        message: "Échec de la connexion au backend",
        status: response.status,
        statusText: response.statusText,
        error: errorText
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: "Connexion au backend réussie",
      backendResponse: data,
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      }
    });
  } catch (error) {
    console.error("Erreur lors du test du backend:", error);
    return NextResponse.json({
      success: false,
      message: "Erreur serveur lors du test du backend",
      error: String(error)
    }, { status: 500 });
  }
} 