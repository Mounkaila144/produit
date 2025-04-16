import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;
    
    // Récupérer l'URL de l'API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    // Utiliser la route directe
    const url = `${apiUrl}/api/direct/tenants/by-domain/${domain}`;
    
    // Appel à l'API backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Tenant non trouvé` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la recherche du tenant" },
      { status: 500 }
    );
  }
} 