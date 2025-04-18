import { NextRequest, NextResponse } from 'next/server';

// Simuler une base de données de produits
const productsDB = {
  // Produits pour le tenant bio
  'dev-bio': [
    {
      id: 'bio-1',
      name: 'Pommes Bio',
      description: 'Pommes biologiques cultivées localement sans pesticides.',
      price: 3.99,
      category: 'Fruits',
      image: 'https://picsum.photos/seed/bio-pommes/400/400'
    },
    {
      id: 'bio-2',
      name: 'Pain Complet',
      description: 'Pain complet bio préparé avec des farines locales et biologiques.',
      price: 4.50,
      category: 'Boulangerie',
      image: 'https://picsum.photos/seed/bio-pain/400/400'
    },
    {
      id: 'bio-3',
      name: 'Miel de Montagne',
      description: 'Miel artisanal récolté dans les montagnes préservées.',
      price: 8.99,
      category: 'Produits locaux',
      image: 'https://picsum.photos/seed/bio-miel/400/400'
    }
  ],
  // Produits pour le tenant librairie
  'dev-librairie': [
    {
      id: 'livre-1',
      name: 'Roman Contemporain',
      description: 'Un roman captivant qui vous transportera dans un univers fascinant.',
      price: 19.90,
      category: 'Romans',
      image: 'https://picsum.photos/seed/livre-roman/400/400'
    },
    {
      id: 'livre-2',
      name: 'Guide de Voyage',
      description: 'Découvrez les plus beaux endroits du monde avec ce guide complet.',
      price: 24.50,
      category: 'Voyage',
      image: 'https://picsum.photos/seed/livre-voyage/400/400'
    },
    {
      id: 'livre-3',
      name: 'Livre de Cuisine',
      description: 'Apprenez à cuisiner comme un chef avec ces recettes faciles.',
      price: 29.99,
      category: 'Cuisine',
      image: 'https://picsum.photos/seed/livre-cuisine/400/400'
    }
  ],
  // Produits pour le tenant norre
  'dev-norre': [
    {
      id: 'norre-1',
      name: 'Lampe Scandinave',
      description: 'Lampe design inspirée du style scandinave minimaliste.',
      price: 89.90,
      category: 'Luminaires',
      image: 'https://picsum.photos/seed/norre-lampe/400/400'
    },
    {
      id: 'norre-2',
      name: 'Table Basse en Bois',
      description: 'Table basse en bois de chêne massif au design épuré.',
      price: 149.99,
      category: 'Mobilier',
      image: 'https://picsum.photos/seed/norre-table/400/400'
    },
    {
      id: 'norre-3',
      name: 'Vase Nordique',
      description: 'Vase en céramique fabriqué à la main selon les traditions nordiques.',
      price: 49.90,
      category: 'Décoration',
      image: 'https://picsum.photos/seed/norre-vase/400/400'
    }
  ],
  // Produits pour le tenant mounkaila
  'dev-mounkaila': [
    {
      id: 'mounkaila-1',
      name: 'Smartphone Haute Performance',
      description: 'Le dernier smartphone avec des caractéristiques exceptionnelles.',
      price: 899.99,
      category: 'Électronique',
      image: 'https://picsum.photos/seed/mounkaila-phone/400/400'
    },
    {
      id: 'mounkaila-2',
      name: 'Ordinateur Portable Professionnel',
      description: 'Ordinateur portable puissant pour tous vos besoins professionnels.',
      price: 1299.99,
      category: 'Informatique',
      image: 'https://picsum.photos/seed/mounkaila-laptop/400/400'
    },
    {
      id: 'mounkaila-3',
      name: 'Casque Audio Sans Fil',
      description: 'Casque avec suppression de bruit et qualité audio exceptionnelle.',
      price: 249.90,
      category: 'Audio',
      image: 'https://picsum.photos/seed/mounkaila-casque/400/400'
    },
    {
      id: 'mounkaila-4',
      name: 'Montre Connectée',
      description: 'Suivez votre activité et restez connecté avec cette montre intelligente.',
      price: 199.90,
      category: 'Accessoires',
      image: 'https://picsum.photos/seed/mounkaila-montre/400/400'
    }
  ]
};

// Pour les IDs de tenant réels, non simulés
const realTenantProducts = [
  {
    id: 'real-1',
    name: 'Produit Réel 1',
    description: 'Ce produit provient de votre base de données réelle.',
    price: 19.99,
    category: 'Catégorie Réelle',
    image: 'https://picsum.photos/seed/real-product1/400/400'
  },
  {
    id: 'real-2',
    name: 'Produit Réel 2',
    description: 'Un autre produit de votre base de données réelle.',
    price: 29.99,
    category: 'Catégorie Réelle',
    image: 'https://picsum.photos/seed/real-product2/400/400'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const { searchParams } = request.nextUrl;
    
    // Récupérer l'URL de l'API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    // Construire l'URL avec les paramètres de requête originaux pour l'endpoint direct
    let url = `${apiUrl}/api/direct/products/tenant/${tenantId}`;
    
    // Ajouter tous les paramètres de recherche originaux
    const queryParams = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      queryParams.append(key, value);
    }
    
    // Ajouter les paramètres à l'URL s'il y en a
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
    
    // Appel à l'API backend sans header tenant
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Erreur lors de la récupération des produits" },
        { status: response.status }
      );
    }
    
    // Récupérer le résultat et le transmettre
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
} 