# Tests du Backend Multi-Tenant

Ce dossier contient tous les tests pour l'API backend multi-tenant.

## Structure des tests

- `unit/` : Tests unitaires des services et utilitaires
- `integration/` : Tests d'intégration des routes et contrôleurs
- `e2e/` : Tests end-to-end des flux complets
- `fixtures/` : Données de test
- `utils/` : Utilitaires pour les tests

## Exécuter les tests

### Tous les tests

```bash
npm test
```

### Tests en mode watch

```bash
npm run test:watch
```

### Couverture de code

```bash
npm run test:coverage
```

## Environnement de test

Les tests utilisent une base de données SQLite en mémoire pour isoler l'environnement de test de la base de données principale.

Les variables d'environnement pour les tests sont définies dans le fichier `.env.test` à la racine du projet.

## Mocking

Les services externes comme WhatsApp sont mockés pour éviter les appels réels pendant les tests.

## Créer de nouveaux tests

### Test unitaire

```javascript
// tests/unit/example.test.js
const { functionToTest } = require('../../src/utils/example');

describe('Example', () => {
  it('should do something', () => {
    const result = functionToTest();
    expect(result).toBe(expectedValue);
  });
});
```

### Test d'intégration

```javascript
// tests/integration/example.test.js
const request = require('supertest');
const app = require('../../src/server');
const { initTestDB, cleanTestDB } = require('../utils/db');

describe('API Example', () => {
  beforeAll(async () => {
    await initTestDB();
  });

  beforeEach(async () => {
    await cleanTestDB();
  });

  it('should return correct data', async () => {
    const response = await request(app).get('/api/example');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```