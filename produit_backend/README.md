# API Backend Multi-Tenant

API backend pour une application multi-tenant avec gestion de boutiques e-commerce.

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
NODE_ENV=development
PORT=8000

DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=multitenant_db

JWT_SECRET=votre_secret_jwt

WHATSAPP_API_URL=https://api.whatsapp.com/v1/messages
WHATSAPP_API_KEY=votre_clé_api_whatsapp
```

## Exécution

```bash
# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start
```

## Base de données

### Migrations

```bash
# Exécuter les migrations
npm run migrate
```

### Fixtures (Données de test)

Le projet inclut deux options pour les données de test:

#### 1. Script de seed pour la base de données

Ce script remplit votre base de données avec des données de test complètes.

```bash
npm run seed
```

> **Note**: Nécessite une connexion à une base de données MySQL fonctionnelle.

#### 2. Données statiques pour le frontend

Pour développer votre frontend sans avoir besoin de configurer une base de données, nous fournissons un fichier de données statique :

```javascript
// Dans votre projet frontend
const testData = require('../backend/produit_backend/fixtures/export-data.js');

// Utilisation des données
console.log(testData.tenants);
console.log(testData.users);
console.log(testData.categories);
console.log(testData.products);
```

Ces données contiennent:
- 3 tenants différents (Électronique, Mode, Épicerie Bio)
- Des utilisateurs avec différents rôles
- Des catégories et produits pour chaque tenant

**Informations de connexion** (pour les tests avec ces données):

**Super Admin:**
- Email: superadmin@example.com
- Mot de passe: superadmin123

**Administrateurs de tenant:**
- Email: admin@electronique.example.com (ou autre domaine de tenant)
- Mot de passe: admin123

**Clients:**
- Email: client1@electronique.example.com (ou autre domaine de tenant)
- Mot de passe: customer123

## Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Vérifier la couverture de code
npm run test:coverage
``` 