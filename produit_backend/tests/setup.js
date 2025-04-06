// Configuration globale pour les tests
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement de test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

// Supprimer les console.log pendant les tests sauf si DEBUG=true
if (!process.env.DEBUG) {
  global.console.log = jest.fn();
  global.console.info = jest.fn();
}

// Rétablir les fonctions originales après tous les tests
afterAll(() => {
  if (!process.env.DEBUG) {
    global.console.log.mockRestore();
    global.console.info.mockRestore();
  }
}); 