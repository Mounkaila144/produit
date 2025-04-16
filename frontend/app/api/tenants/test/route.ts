import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'URL de l'API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    // Tenter de récupérer la liste des tenants depuis l'API backend
    const url = `${apiUrl}/api/tenants`;
    
    console.log(`Test de connexion au backend: ${url}`);
    
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      let errorInfo = "Réponse non-OK";
      try {
        const errorText = await response.text();
        errorInfo = errorText;
      } catch (e) {}
      
      console.error(`Erreur lors du test du backend:`, errorInfo);
      return NextResponse.json({
        success: false,
        message: "Échec de la connexion au backend",
        status: response.status,
        statusText: response.statusText,
        error: errorInfo
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: "Test de connexion au backend réussi",
      count: data.count || (data.data ? data.data.length : 0),
      data: data.data || data,
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      }
    });
  } catch (error) {
    console.error("Erreur lors du test du backend:", error);
    return NextResponse.json({
      success: false,
      message: "Erreur serveur lors du test",
      error: String(error)
    }, { status: 500 });
  }
} 