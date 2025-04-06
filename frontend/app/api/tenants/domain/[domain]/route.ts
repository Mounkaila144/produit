import { NextRequest, NextResponse } from 'next/server';

// Simuler une base de données de tenants
const tenantsDB = [
  {
    id: "13e58189-7a01-4c43-9ff0-9df634754a15",
    name: "Épicerie Bio",
    description: "Produits alimentaires biologiques et écologiques",
    domain: "bio",
    logoUrl: null,
    active: true,
    expiresAt: "2026-04-02T11:33:27.000Z",
    planType: "enterprise",
    contactInfo: "{\"email\":\"contact@bio.example.com\",\"phone\":\"+33654321987\"}",
    customDomain: null,
    ownerId: "affa579e-092c-46e6-8cab-36890e85082d",
    createdAt: "2025-04-02T11:33:27.000Z",
    updatedAt: "2025-04-02T11:33:29.000Z",
    owner: {
      id: "affa579e-092c-46e6-8cab-36890e85082d",
      username: "Admin_Épicerie",
      email: "admin@bio.example.com"
    }
  },
  {
    id: "24f6919a-8b12-5d54-0ee1-10e745865b26",
    name: "Librairie Culturelle",
    description: "Livres et produits culturels",
    domain: "librairie",
    logoUrl: null,
    active: true,
    expiresAt: "2026-05-15T14:22:11.000Z",
    planType: "standard",
    contactInfo: "{\"email\":\"contact@librairie.example.com\",\"phone\":\"+33123456789\"}",
    customDomain: null,
    ownerId: "bceb680f-103d-57f7-9cab-36890e85082e",
    createdAt: "2025-05-15T14:22:11.000Z",
    updatedAt: "2025-05-15T14:22:11.000Z",
    owner: {
      id: "bceb680f-103d-57f7-9cab-36890e85082e",
      username: "Admin_Librairie",
      email: "admin@librairie.example.com"
    }
  },
  {
    id: "35f7929b-9c23-6e65-1ff2-21f856976c37",
    name: "Boutique Norre",
    description: "Articles de décoration scandinave",
    domain: "norre",
    logoUrl: null,
    active: true,
    expiresAt: "2026-06-20T09:45:33.000Z",
    planType: "standard",
    contactInfo: "{\"email\":\"contact@norre.example.com\",\"phone\":\"+33987654321\"}",
    customDomain: null,
    ownerId: "cdef791g-214e-68g8-0dbc-47901f96193f",
    createdAt: "2025-06-20T09:45:33.000Z",
    updatedAt: "2025-06-20T09:45:33.000Z",
    owner: {
      id: "cdef791g-214e-68g8-0dbc-47901f96193f",
      username: "Admin_Norre",
      email: "admin@norre.example.com"
    }
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  const { domain } = params;
  
  // Rechercher le tenant par son domaine
  const tenant = tenantsDB.find(t => t.domain === domain);
  
  if (!tenant) {
    return NextResponse.json(
      { success: false, message: "Tenant non trouvé" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ 
    success: true, 
    data: tenant 
  });
} 