/**
 * Données de test pour le frontend
 * Ce fichier contient des données prêtes à l'emploi pour développer l'interface frontend
 */

const data = {
  tenants: [
    {
      id: "8166738a-a927-4e16-876f-5a2061cfb773",
      name: "Boutique Électronique",
      description: "Vente de produits électroniques et gadgets technologiques",
      domain: "electronique.example.com",
      active: true,
      planType: "premium",
      expiresAt: "2025-10-02T10:59:24.000Z",
      contactInfo: { 
        email: "contact@electronique.example.com", 
        phone: "+33123456789" 
      }
    },
    {
      id: "73d24f60-cf42-4477-8084-ef3f5c54e197",
      name: "Mode Fashion",
      description: "Boutique de vêtements et accessoires de mode",
      domain: "fashion.example.com",
      active: true,
      planType: "basic",
      expiresAt: "2025-07-02T10:59:24.000Z",
      contactInfo: { 
        email: "contact@fashion.example.com", 
        phone: "+33987654321" 
      }
    },
    {
      id: "315021a2-eedd-4441-8f1c-852f2ccabe95",
      name: "Épicerie Bio",
      description: "Produits alimentaires biologiques et écologiques",
      domain: "bio.example.com",
      active: true,
      planType: "enterprise",
      expiresAt: "2026-04-02T10:59:24.000Z",
      contactInfo: { 
        email: "contact@bio.example.com", 
        phone: "+33654321987" 
      }
    }
  ],
  
  users: [
    {
      id: "824134af-6506-46d3-bee8-5825f65ff4b8",
      username: "SuperAdmin",
      email: "superadmin@example.com",
      role: "superadmin",
      whatsappNumber: "+33611223344",
      isActive: true
    },
    {
      id: "e20cff2b-cda2-4cac-bf4f-6ad2ca5a1431",
      username: "Admin_Boutique",
      email: "admin@electronique.example.com",
      role: "admin",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773",
      whatsappNumber: "+33622334455",
      isActive: true
    },
    {
      id: "035de418-f0dd-4708-9085-05cae581b255",
      username: "Admin_Mode",
      email: "admin@fashion.example.com",
      role: "admin",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197",
      whatsappNumber: "+33622334455",
      isActive: true
    },
    {
      id: "7fa85f64-5717-4562-b3fc-2c963f66afa6",
      username: "Admin_Épicerie",
      email: "admin@bio.example.com",
      role: "admin",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95",
      whatsappNumber: "+33622334455",
      isActive: true
    },
    {
      id: "3b7c0405-7f14-42b9-91e8-3c8d13c4316d",
      username: "Client1_Boutique",
      email: "client1@electronique.example.com",
      role: "customer",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773",
      whatsappNumber: "+33633445561",
      isActive: true
    },
    {
      id: "4c8d13c4-7f14-42b9-91e8-3c8d13c4316d",
      username: "Client1_Mode",
      email: "client1@fashion.example.com",
      role: "customer",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197",
      whatsappNumber: "+33633445562",
      isActive: true
    },
    {
      id: "5e9f24d5-8025-53ca-a2b7-4d1c6e8f7a9b",
      username: "Client1_Épicerie",
      email: "client1@bio.example.com",
      role: "customer",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95",
      whatsappNumber: "+33633445563",
      isActive: true
    }
  ],
  
  categories: [
    // Boutique Électronique
    {
      id: "c1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c",
      name: "Smartphones",
      description: "Catégorie Smartphones pour Boutique Électronique",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "d2e3f4a5-b6c7-8d9e-1f2a-3b4c5d6e7f8a",
      name: "Ordinateurs",
      description: "Catégorie Ordinateurs pour Boutique Électronique",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "e3f4a5b6-c7d8-9e0f-2a3b-4c5d6e7f8a9b",
      name: "Audio",
      description: "Catégorie Audio pour Boutique Électronique",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "f4a5b6c7-d8e9-0f1a-3b4c-5d6e7f8a9b0c",
      name: "Accessoires",
      description: "Catégorie Accessoires pour Boutique Électronique",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "a5b6c7d8-e9f0-1a2b-4c5d-6e7f8a9b0c1d",
      name: "Tablettes",
      description: "Catégorie Tablettes pour Boutique Électronique",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    
    // Mode Fashion
    {
      id: "b6c7d8e9-f0a1-2b3c-5d6e-7f8a9b0c1d2e",
      name: "Hommes",
      description: "Catégorie Hommes pour Mode Fashion",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    {
      id: "c7d8e9f0-a1b2-3c4d-6e7f-8a9b0c1d2e3f",
      name: "Femmes",
      description: "Catégorie Femmes pour Mode Fashion",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    {
      id: "d8e9f0a1-b2c3-4d5e-7f8a-9b0c1d2e3f4a",
      name: "Enfants",
      description: "Catégorie Enfants pour Mode Fashion",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    {
      id: "e9f0a1b2-c3d4-5e6f-8a9b-0c1d2e3f4a5b",
      name: "Accessoires",
      description: "Catégorie Accessoires pour Mode Fashion",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    {
      id: "f0a1b2c3-d4e5-6f7a-9b0c-1d2e3f4a5b6c",
      name: "Chaussures",
      description: "Catégorie Chaussures pour Mode Fashion",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    
    // Épicerie Bio
    {
      id: "a1b2c3d4-e5f6-7a8b-0c1d-2e3f4a5b6c7d",
      name: "Fruits et Légumes",
      description: "Catégorie Fruits et Légumes pour Épicerie Bio",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    },
    {
      id: "b2c3d4e5-f6a7-8b9c-1d2e-3f4a5b6c7d8e",
      name: "Produits Laitiers",
      description: "Catégorie Produits Laitiers pour Épicerie Bio",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    },
    {
      id: "c3d4e5f6-a7b8-9c0d-2e3f-4a5b6c7d8e9f",
      name: "Épicerie",
      description: "Catégorie Épicerie pour Épicerie Bio",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    },
    {
      id: "d4e5f6a7-b8c9-0d1e-3f4a-5b6c7d8e9f0a",
      name: "Boissons",
      description: "Catégorie Boissons pour Épicerie Bio",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    },
    {
      id: "e5f6a7b8-c9d0-1e2f-4a5b-6c7d8e9f0a1b",
      name: "Hygiène",
      description: "Catégorie Hygiène pour Épicerie Bio",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    }
  ],
  
  products: [
    // Smartphones - Boutique Électronique
    {
      id: "p1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c",
      name: "iPhone 13",
      description: "Description détaillée pour iPhone 13",
      price: "899.99",
      stock: 42,
      images: [{ url: "/uploads/products/smartphones-1.jpg" }],
      isActive: true,
      categoryId: "c1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "p2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
      name: "Samsung Galaxy S21",
      description: "Description détaillée pour Samsung Galaxy S21",
      price: "799.99",
      stock: 35,
      images: [{ url: "/uploads/products/smartphones-2.jpg" }],
      isActive: true,
      categoryId: "c1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "p3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8",
      name: "Xiaomi Redmi Note 10",
      description: "Description détaillée pour Xiaomi Redmi Note 10",
      price: "299.99",
      stock: 68,
      images: [{ url: "/uploads/products/smartphones-3.jpg" }],
      isActive: true,
      categoryId: "c1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    
    // Ordinateurs - Boutique Électronique
    {
      id: "p4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9",
      name: "MacBook Air",
      description: "Description détaillée pour MacBook Air",
      price: "1099.00",
      stock: 21,
      images: [{ url: "/uploads/products/ordinateurs-1.jpg" }],
      isActive: true,
      categoryId: "d2e3f4a5-b6c7-8d9e-1f2a-3b4c5d6e7f8a",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    {
      id: "p5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0",
      name: "Dell XPS 13",
      description: "Description détaillée pour Dell XPS 13",
      price: "1299.00",
      stock: 15,
      images: [{ url: "/uploads/products/ordinateurs-2.jpg" }],
      isActive: true,
      categoryId: "d2e3f4a5-b6c7-8d9e-1f2a-3b4c5d6e7f8a",
      tenantId: "8166738a-a927-4e16-876f-5a2061cfb773"
    },
    
    // Femmes - Mode Fashion
    {
      id: "p6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1",
      name: "Robe d'été",
      description: "Description détaillée pour Robe d'été",
      price: "49.99",
      stock: 85,
      images: [{ url: "/uploads/products/femmes-1.jpg" }],
      isActive: true,
      categoryId: "c7d8e9f0-a1b2-3c4d-6e7f-8a9b0c1d2e3f",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    {
      id: "p7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2",
      name: "Blouse fluide",
      description: "Description détaillée pour Blouse fluide",
      price: "39.99",
      stock: 62,
      images: [{ url: "/uploads/products/femmes-2.jpg" }],
      isActive: true,
      categoryId: "c7d8e9f0-a1b2-3c4d-6e7f-8a9b0c1d2e3f",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    {
      id: "p8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3",
      name: "Jupe plissée",
      description: "Description détaillée pour Jupe plissée",
      price: "45.50",
      stock: 40,
      images: [{ url: "/uploads/products/femmes-3.jpg" }],
      isActive: true,
      categoryId: "c7d8e9f0-a1b2-3c4d-6e7f-8a9b0c1d2e3f",
      tenantId: "73d24f60-cf42-4477-8084-ef3f5c54e197"
    },
    
    // Fruits et Légumes - Épicerie Bio
    {
      id: "p9c0d1e2-f3a4-b5c6-d7e8-f9a0b1c2d3e4",
      name: "Panier de saison",
      description: "Description détaillée pour Panier de saison",
      price: "24.90",
      stock: 20,
      images: [{ url: "/uploads/products/fruits-et-légumes-1.jpg" }],
      isActive: true,
      categoryId: "a1b2c3d4-e5f6-7a8b-0c1d-2e3f4a5b6c7d",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    },
    {
      id: "p10d1e2f3-a4b5-c6d7-e8f9-a0b1c2d3e4f5",
      name: "Pommes Bio",
      description: "Description détaillée pour Pommes Bio",
      price: "4.50",
      stock: 75,
      images: [{ url: "/uploads/products/fruits-et-légumes-2.jpg" }],
      isActive: true,
      categoryId: "a1b2c3d4-e5f6-7a8b-0c1d-2e3f4a5b6c7d",
      tenantId: "315021a2-eedd-4441-8f1c-852f2ccabe95"
    }
  ]
};

module.exports = data; 