import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies, headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été téléchargé' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Créer un nouveau FormData à envoyer au backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    // Récupérer les informations d'authentification et tenant des cookies et headers
    const headersList = headers();
    const cookieStore = cookies();
    
    const token = headersList.get('authorization')?.replace('Bearer ', '') || 
                 cookieStore.get('token')?.value || '';
    
    const tenantId = headersList.get('x-tenant-id') || 
                    cookieStore.get('tenantId')?.value || 
                    cookieStore.get('adminTenantId')?.value || '';
    
    console.log('Upload avec tenant:', tenantId);
    
    // Appeler l'API backend pour l'upload
    const backendResponse = await fetch('http://localhost:8000/api/upload', {
      method: 'POST',
      body: backendFormData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId
      }
    });
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Erreur backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erreur lors de l\'upload côté serveur' },
        { status: backendResponse.status }
      );
    }
    
    // Récupérer l'URL de l'image depuis la réponse du backend
    const responseData = await backendResponse.json();
    
    return NextResponse.json({ url: responseData.url });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de l\'image' },
      { status: 500 }
    );
  }
} 