# Documentation API Backend Multi-Tenant

## Table des matières

1. [Introduction](#introduction)
2. [Configuration](#configuration)
3. [Authentification](#authentification)
4. [Tenants](#tenants)
5. [Produits](#produits)
6. [Catégories](#catégories)
7. [Utilisateurs](#utilisateurs)
8. [Commandes](#commandes)

## Introduction

Cette documentation détaille l'utilisation de l'API backend multi-tenant. L'API permet de gérer plusieurs boutiques e-commerce (tenants) sur une même plateforme, avec des données isolées pour chaque tenant.

## Configuration

**URL de base**: `http://localhost:8000/api`

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Pour accéder aux endpoints protégés, vous devez inclure le token dans l'en-tête de la requête.

### Connexion

**Endpoint**: `POST /auth/login`

**Requête**:
```json
{
  "email": "utilisateur@example.com",
  "password": "motdepasse"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "username": "nomutilisateur",
      "email": "utilisateur@example.com",
      "role": "admin",
      "tenantId": "tenant-id"
    },
    "token": "jwt-token"
  }
}
```

### Inscription

**Endpoint**: `POST /auth/register`

**Requête**:
```json
{
  "username": "nomutilisateur",
  "email": "utilisateur@example.com",
  "password": "motdepasse",
  "whatsappNumber": "+33612345678"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "username": "nomutilisateur",
      "email": "utilisateur@example.com",
      "role": "customer"
    },
    "token": "jwt-token"
  }
}
```

## Tenants

### Routes SuperAdmin

Ces routes sont accessibles uniquement par les utilisateurs ayant le rôle "superadmin".

#### Créer un tenant

**Endpoint**: `POST /superadmin/tenants`

**Headers**:
```
Authorization: Bearer <token>
```

**Requête**:
```json
{
  "name": "Nom du Tenant",
  "description": "Description du tenant",
  "domain": "nom-tenant.example.com",
  "planType": "basic",
  "ownerId": "user-id" // Optionnel
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Nom du Tenant",
    "description": "Description du tenant",
    "domain": "nom-tenant.example.com",
    "active": true,
    "planType": "basic",
    "expiresAt": "2023-12-31T23:59:59.999Z",
    "ownerId": "user-id",
    "contactInfo": {
      "email": "contact@example.com",
      "phone": "+33612345678"
    },
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

#### Lister tous les tenants

**Endpoint**: `GET /superadmin/tenants`

**Headers**:
```
Authorization: Bearer <token>
```

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "tenant-id-1",
      "name": "Tenant 1",
      "description": "Description du tenant 1",
      "domain": "tenant1.example.com",
      "active": true,
      "planType": "basic",
      "expiresAt": "2023-12-31T23:59:59.999Z"
    },
    {
      "id": "tenant-id-2",
      "name": "Tenant 2",
      "description": "Description du tenant 2",
      "domain": "tenant2.example.com",
      "active": true,
      "planType": "premium",
      "expiresAt": "2024-06-30T23:59:59.999Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

#### Obtenir un tenant spécifique

**Endpoint**: `GET /superadmin/tenants/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Nom du Tenant",
    "description": "Description du tenant",
    "domain": "nom-tenant.example.com",
    "active": true,
    "planType": "basic",
    "expiresAt": "2023-12-31T23:59:59.999Z",
    "ownerId": "user-id",
    "contactInfo": {
      "email": "contact@example.com",
      "phone": "+33612345678"
    },
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

#### Mettre à jour un tenant

**Endpoint**: `PUT /superadmin/tenants/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Requête**:
```json
{
  "name": "Nouveau Nom du Tenant",
  "description": "Nouvelle description",
  "planType": "premium"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Nouveau Nom du Tenant",
    "description": "Nouvelle description",
    "domain": "nom-tenant.example.com",
    "active": true,
    "planType": "premium",
    "expiresAt": "2023-12-31T23:59:59.999Z",
    "ownerId": "user-id",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Désactiver un tenant

**Endpoint**: `PUT /superadmin/tenants/:id/disable`

**Headers**:
```
Authorization: Bearer <token>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Nom du Tenant",
    "active": false,
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Activer un tenant

**Endpoint**: `PUT /superadmin/tenants/:id/enable`

**Headers**:
```
Authorization: Bearer <token>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Nom du Tenant",
    "active": true,
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Renouveler l'abonnement d'un tenant

**Endpoint**: `PUT /superadmin/tenants/:id/renew`

**Headers**:
```
Authorization: Bearer <token>
```

**Requête**:
```json
{
  "months": 3
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "tenant-id",
    "name": "Nom du Tenant",
    "active": true,
    "expiresAt": "2024-03-31T23:59:59.999Z",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Supprimer un tenant

**Endpoint**: `DELETE /superadmin/tenants/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Réponse**:
```json
{
  "success": true,
  "message": "Tenant supprimé avec succès"
}
```

## Produits

Pour toutes les routes de produits, vous devez spécifier l'ID du tenant dans l'en-tête `x-tenant-id`.

### Créer un produit

**Endpoint**: `POST /products`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "name": "Nom du Produit",
  "description": "Description du produit",
  "price": 19.99,
  "stock": 100,
  "categoryId": "category-id"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Nom du Produit",
    "description": "Description du produit",
    "price": "19.99",
    "stock": 100,
    "categoryId": "category-id",
    "tenantId": "tenant-id",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Lister les produits

**Endpoint**: `GET /products`

**Headers**:
```
x-tenant-id: <tenant-id>
```

**Paramètres de requête**:
- `page`: Numéro de page (défaut: 1)
- `pageSize`: Nombre d'éléments par page (défaut: 10)
- `category`: Filtrer par ID de catégorie

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id-1",
      "name": "Produit 1",
      "description": "Description du produit 1",
      "price": "19.99",
      "stock": 100,
      "categoryId": "category-id",
      "tenantId": "tenant-id"
    },
    {
      "id": "product-id-2",
      "name": "Produit 2",
      "description": "Description du produit 2",
      "price": "29.99",
      "stock": 50,
      "categoryId": "category-id",
      "tenantId": "tenant-id"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

### Obtenir un produit spécifique

**Endpoint**: `GET /products/:id`

**Headers**:
```
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Nom du Produit",
    "description": "Description du produit",
    "price": "19.99",
    "stock": 100,
    "categoryId": "category-id",
    "tenantId": "tenant-id",
    "category": {
      "id": "category-id",
      "name": "Nom de la Catégorie"
    },
    "images": [
      {
        "id": "image-id",
        "url": "/uploads/products/image.jpg",
        "variants": {
          "thumbnail": "/uploads/products/image-thumbnail.jpg",
          "small": "/uploads/products/image-small.jpg",
          "medium": "/uploads/products/image-medium.jpg",
          "large": "/uploads/products/image-large.jpg"
        }
      }
    ],
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Mettre à jour un produit

**Endpoint**: `PUT /products/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "name": "Nouveau Nom du Produit",
  "description": "Nouvelle description",
  "price": 24.99,
  "stock": 75
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Nouveau Nom du Produit",
    "description": "Nouvelle description",
    "price": "24.99",
    "stock": 75,
    "categoryId": "category-id",
    "tenantId": "tenant-id",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

### Supprimer un produit

**Endpoint**: `DELETE /products/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "message": "Produit supprimé avec succès"
}
```

## Catégories

Pour toutes les routes de catégories, vous devez spécifier l'ID du tenant dans l'en-tête `x-tenant-id`.

### Créer une catégorie

**Endpoint**: `POST /categories`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "name": "Nom de la Catégorie",
  "description": "Description de la catégorie"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "category-id",
    "name": "Nom de la Catégorie",
    "description": "Description de la catégorie",
    "tenantId": "tenant-id",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Lister les catégories

**Endpoint**: `GET /categories`

**Headers**:
```
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "category-id-1",
      "name": "Catégorie 1",
      "description": "Description de la catégorie 1",
      "tenantId": "tenant-id"
    },
    {
      "id": "category-id-2",
      "name": "Catégorie 2",
      "description": "Description de la catégorie 2",
      "tenantId": "tenant-id"
    }
  ]
}
```

### Obtenir une catégorie spécifique

**Endpoint**: `GET /categories/:id`

**Headers**:
```
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "category-id",
    "name": "Nom de la Catégorie",
    "description": "Description de la catégorie",
    "tenantId": "tenant-id",
    "products": [
      {
        "id": "product-id-1",
        "name": "Produit 1",
        "price": "19.99"
      },
      {
        "id": "product-id-2",
        "name": "Produit 2",
        "price": "29.99"
      }
    ],
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Mettre à jour une catégorie

**Endpoint**: `PUT /categories/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "name": "Nouveau Nom de la Catégorie",
  "description": "Nouvelle description"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "category-id",
    "name": "Nouveau Nom de la Catégorie",
    "description": "Nouvelle description",
    "tenantId": "tenant-id",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

### Supprimer une catégorie

**Endpoint**: `DELETE /categories/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "message": "Catégorie supprimée avec succès"
}
```

## Utilisateurs

### Routes Admin

Ces routes sont accessibles uniquement par les utilisateurs ayant le rôle "admin" ou "superadmin".

#### Lister les utilisateurs d'un tenant

**Endpoint**: `GET /admin/users`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id-1",
      "username": "utilisateur1",
      "email": "utilisateur1@example.com",
      "role": "admin",
      "tenantId": "tenant-id"
    },
    {
      "id": "user-id-2",
      "username": "utilisateur2",
      "email": "utilisateur2@example.com",
      "role": "customer",
      "tenantId": "tenant-id"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

#### Obtenir un utilisateur spécifique

**Endpoint**: `GET /admin/users/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "nomutilisateur",
    "email": "utilisateur@example.com",
    "role": "customer",
    "tenantId": "tenant-id",
    "whatsappNumber": "+33612345678",
    "isActive": true,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

#### Mettre à jour un utilisateur

**Endpoint**: `PUT /admin/users/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "username": "nouveaunom",
  "email": "nouveauemail@example.com",
  "role": "admin",
  "isActive": true
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "nouveaunom",
    "email": "nouveauemail@example.com",
    "role": "admin",
    "tenantId": "tenant-id",
    "isActive": true,
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Désactiver un utilisateur

**Endpoint**: `PUT /admin/users/:id/disable`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "nomutilisateur",
    "isActive": false,
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Activer un utilisateur

**Endpoint**: `PUT /admin/users/:id/enable`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "nomutilisateur",
    "isActive": true,
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

### Routes Utilisateur

#### Obtenir le profil

**Endpoint**: `GET /users/profile`

**Headers**:
```
Authorization: Bearer <token>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "nomutilisateur",
    "email": "utilisateur@example.com",
    "role": "customer",
    "tenantId": "tenant-id",
    "whatsappNumber": "+33612345678",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

#### Mettre à jour le profil

**Endpoint**: `PUT /users/profile`

**Headers**:
```
Authorization: Bearer <token>
```

**Requête**:
```json
{
  "username": "nouveaunom",
  "email": "nouveauemail@example.com",
  "whatsappNumber": "+33687654321"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "nouveaunom",
    "email": "nouveauemail@example.com",
    "whatsappNumber": "+33687654321",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Changer le mot de passe

**Endpoint**: `PUT /users/change-password`

**Headers**:
```
Authorization: Bearer <token>
```

**Requête**:
```json
{
  "currentPassword": "ancienMotDePasse",
  "newPassword": "nouveauMotDePasse"
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

## Commandes

Pour toutes les routes de commandes, vous devez spécifier l'ID du tenant dans l'en-tête `x-tenant-id`.

### Créer une commande

**Endpoint**: `POST /orders`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "items": [
    {
      "productId": "product-id-1",
      "quantity": 2
    },
    {
      "productId": "product-id-2",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Rue Exemple",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  },
  "paymentMethod": "card"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "userId": "user-id",
    "status": "pending",
    "totalAmount": "69.97",
    "items": [
      {
        "productId": "product-id-1",
        "quantity": 2,
        "price": "19.99",
        "total": "39.98"
      },
      {
        "productId": "product-id-2",
        "quantity": 1,
        "price": "29.99",
        "total": "29.99"
      }
    ],
    "shippingAddress": {
      "street": "123 Rue Exemple",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    },
    "paymentMethod": "card",
    "tenantId": "tenant-id",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Lister les commandes (admin)

**Endpoint**: `GET /admin/orders`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Paramètres de requête**:
- `page`: Numéro de page (défaut: 1)
- `pageSize`: Nombre d'éléments par page (défaut: 10)
- `status`: Filtrer par statut (pending, processing, completed, cancelled)

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id-1",
      "userId": "user-id-1",
      "status": "completed",
      "totalAmount": "69.97",
      "createdAt": "2023-01-01T12:00:00.000Z"
    },
    {
      "id": "order-id-2",
      "userId": "user-id-2",
      "status": "pending",
      "totalAmount": "39.98",
      "createdAt": "2023-01-02T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

### Obtenir une commande spécifique (admin)

**Endpoint**: `GET /admin/orders/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "userId": "user-id",
    "status": "pending",
    "totalAmount": "69.97",
    "items": [
      {
        "productId": "product-id-1",
        "productName": "Nom du Produit 1",
        "quantity": 2,
        "price": "19.99",
        "total": "39.98"
      },
      {
        "productId": "product-id-2",
        "productName": "Nom du Produit 2",
        "quantity": 1,
        "price": "29.99",
        "total": "29.99"
      }
    ],
    "shippingAddress": {
      "street": "123 Rue Exemple",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    },
    "user": {
      "id": "user-id",
      "username": "nomutilisateur",
      "email": "utilisateur@example.com"
    },
    "paymentMethod": "card",
    "tenantId": "tenant-id",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Mettre à jour le statut d'une commande (admin)

**Endpoint**: `PUT /admin/orders/:id/status`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Requête**:
```json
{
  "status": "processing"
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "status": "processing",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

### Lister mes commandes (utilisateur)

**Endpoint**: `GET /users/orders`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Paramètres de requête**:
- `page`: Numéro de page (défaut: 1)
- `pageSize`: Nombre d'éléments par page (défaut: 10)
- `status`: Filtrer par statut

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id-1",
      "status": "completed",
      "totalAmount": "69.97",
      "createdAt": "2023-01-01T12:00:00.000Z"
    },
    {
      "id": "order-id-2",
      "status": "pending",
      "totalAmount": "39.98",
      "createdAt": "2023-01-02T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

### Obtenir une commande spécifique (utilisateur)

**Endpoint**: `GET /users/orders/:id`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "status": "pending",
    "totalAmount": "69.97",
    "items": [
      {
        "productId": "product-id-1",
        "productName": "Nom du Produit 1",
        "quantity": 2,
        "price": "19.99",
        "total": "39.98"
      },
      {
        "productId": "product-id-2",
        "productName": "Nom du Produit 2",
        "quantity": 1,
        "price": "29.99",
        "total": "29.99"
      }
    ],
    "shippingAddress": {
      "street": "123 Rue Exemple",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    },
    "paymentMethod": "card",
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Annuler une commande (utilisateur)

**Endpoint**: `PUT /users/orders/:id/cancel`

**Headers**:
```
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "status": "cancelled",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
``` 