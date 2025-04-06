# Frontend - Interface Client et Gestionnaire de Boutique

Ce frontend est une application Next.js qui fournit deux interfaces distinctes :
1. Une interface client pour les visiteurs de la boutique
2. Une interface d'administration pour les propriétaires de boutique

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
```

L'application sera accessible à l'adresse : http://localhost:3000

## 🏗️ Architecture

### Structure des Dossiers

```
frontend/
├── app/                    # Pages et routes de l'application
│   ├── [tenant]/          # Routes spécifiques aux boutiques
│   │   ├── layout.tsx     # Layout commun pour toutes les pages de boutique
│   │   ├── page.tsx       # Page d'accueil de la boutique
│   │   ├── products/      # Pages liées aux produits
│   │   ├── categories/    # Pages liées aux catégories
│   │   └── cart/          # Pages liées au panier
│   └── tenant/            # Routes d'administration
│       ├── layout.tsx     # Layout commun pour l'administration
│       ├── dashboard/     # Tableau de bord
│       ├── products/      # Gestion des produits
│       ├── categories/    # Gestion des catégories
│       ├── orders/        # Gestion des commandes
│       ├── users/         # Gestion des utilisateurs
│       └── profile/       # Profil de la boutique
├── components/            # Composants réutilisables
├── hooks/                 # Hooks personnalisés
├── lib/                   # Utilitaires et configurations
└── services/             # Services API
```

## 🛍️ Interface Client

### Page d'Accueil (`/[tenant]`)

- **Bannière principale** : Affiche l'image de couverture, le nom et la description de la boutique
- **Catégories populaires** : Grille de catégories principales avec images
- **Produits vedettes** : Sélection de produits mis en avant
- **Nouveaux produits** : Liste des derniers produits ajoutés

### Catalogue de Produits (`/[tenant]/products`)

- **Filtres** :
  - Recherche par texte
  - Filtre par catégorie
  - Filtre par prix (min/max)
  - Tri par date, prix ou nom
- **Vues** :
  - Mode grille (par défaut)
  - Mode liste
- **Pagination** : Navigation entre les pages de résultats

### Page de Catégorie (`/[tenant]/categories/[id]`)

- **En-tête** : Image et informations de la catégorie
- **Sous-catégories** : Si la catégorie en contient
- **Produits** : Mêmes filtres que le catalogue principal
- **Pagination** : Navigation entre les pages

### Page de Produit (`/[tenant]/products/[id]`)

- **Galerie d'images** : Images du produit avec navigation
- **Informations** :
  - Nom et description
  - Prix
  - Stock disponible
  - Bouton d'ajout au panier
- **Produits similaires** : Suggestions basées sur la catégorie

### Panier (`/[tenant]/cart`)

- **Liste des articles** :
  - Image du produit
  - Nom et description
  - Prix unitaire
  - Quantité (modifiable)
  - Bouton de suppression
- **Résumé de la commande** :
  - Sous-total
  - TVA
  - Total
- **Actions** :
  - Continuer les achats
  - Procéder au paiement

## 👨‍💼 Interface d'Administration

### Tableau de Bord (`/tenant/dashboard`)

- **Statistiques** :
  - Chiffre d'affaires
  - Nombre de commandes
  - Produits en stock
  - Produits populaires
- **Graphiques** :
  - Ventes par période
  - Produits les plus vendus
  - Commandes par statut

### Gestion des Produits (`/tenant/products`)

- **Liste des produits** :
  - Image
  - Nom et description
  - Prix
  - Stock
  - Statut
- **Actions** :
  - Ajouter un produit
  - Modifier un produit
  - Supprimer un produit
  - Gérer le stock
- **Filtres et tri** :
  - Par catégorie
  - Par statut
  - Par stock

### Gestion des Catégories (`/tenant/categories`)

- **Arborescence des catégories** :
  - Drag & drop pour réorganiser
  - Création de sous-catégories
- **Actions** :
  - Ajouter une catégorie
  - Modifier une catégorie
  - Supprimer une catégorie
  - Gérer les images

### Gestion des Commandes (`/tenant/orders`)

- **Liste des commandes** :
  - Numéro de commande
  - Date
  - Client
  - Montant
  - Statut
- **Actions** :
  - Voir les détails
  - Mettre à jour le statut
  - Générer une facture

### Gestion des Utilisateurs (`/tenant/users`)

- **Liste des utilisateurs** :
  - Nom et email
  - Rôle
  - Date d'inscription
- **Actions** :
  - Ajouter un utilisateur
  - Modifier un utilisateur
  - Supprimer un utilisateur
  - Gérer les rôles

### Profil de la Boutique (`/tenant/profile`)

- **Informations de base** :
  - Nom de la boutique
  - Description
  - Logo
  - Domaine personnalisé
- **Coordonnées** :
  - Email de contact
  - Téléphone
  - Adresse
- **Réseaux sociaux** :
  - Facebook
  - Twitter
  - Instagram
  - LinkedIn

## 🛠️ Technologies Utilisées

- **Framework** : Next.js 13 (App Router)
- **UI** : Tailwind CSS + shadcn/ui
- **État** : React Query + Zustand
- **Validation** : Zod
- **Formulaires** : React Hook Form
- **Images** : Next.js Image Optimization
- **Icons** : Lucide Icons

## 🔒 Sécurité

- Authentification via JWT
- Protection des routes d'administration
- Validation des données côté client
- Gestion des rôles et permissions

## 🌐 Internationalisation

- Support multilingue
- Formatage des dates et nombres
- Devises et unités de mesure

## 📱 Responsive Design

- Mobile-first
- Breakpoints :
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🧪 Tests

```bash
# Lancer les tests unitaires
npm run test

# Lancer les tests E2E
npm run test:e2e
```

## 📦 Build et Déploiement

```bash
# Build de production
npm run build

# Démarrage en production
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request 