# Plateforme E-commerce Multi-Tenant

Une plateforme e-commerce multi-tenant robuste, permettant de gérer plusieurs boutiques à partir d'une seule instance.

## Fonctionnalités

- Gestion multi-boutiques (multi-tenant)
- Interface d'administration pour les propriétaires de boutiques
- Interface super-administrateur pour gérer toutes les boutiques
- Gestion des produits et catégories
- Gestion des utilisateurs et des rôles
- Système d'authentification sécurisé
- API RESTful
- Interface utilisateur moderne et responsive

## Technologies

### Backend
- Node.js
- Express
- Sequelize (ORM)
- MySQL
- JWT pour l'authentification

### Frontend
- Next.js
- React
- Tailwind CSS
- Shadcn UI
- TypeScript

## Installation

### Prérequis
- Node.js v16+
- MySQL

### Installation du backend
```bash
cd produit_backend
npm install
# Configurez votre fichier .env (voir .env.example)
npm run dev
```

### Installation du frontend
```bash
cd frontend
npm install
# Configurez votre fichier .env.local (voir .env.example)
npm run dev
```

## Structure du projet

- `produit_backend/` : Code source du backend
  - `src/` : Code source
    - `controllers/` : Contrôleurs REST
    - `models/` : Modèles Sequelize
    - `routes/` : Routes API
    - `middleware/` : Middlewares Express
    - `utils/` : Utilitaires
    - `config/` : Configuration

- `frontend/` : Code source du frontend
  - `app/` : Pages de l'application
  - `components/` : Composants React
  - `services/` : Services pour les appels API
  - `styles/` : Styles CSS
  - `public/` : Fichiers statiques

## Contributeur
- Mounkaila Boubacar - @Mounkaila144

## Licence
Ce projet est sous licence MIT. 