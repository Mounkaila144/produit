require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const tenantRoutes = require('./routes/tenant.routes');
const uploadRoutes = require('./routes/upload.routes');

// Import des services
const scheduler = require('./services/scheduler.service');

// Middleware d'extraction de tenant
const { extractTenant } = require('./middleware/tenant.middleware');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer le dossier d'uploads s'il n'existe pas
const fs = require('fs');
const uploadDir = path.join(__dirname, '../public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Middleware pour extraire le tenant des requêtes
app.use(extractTenant);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/upload', uploadRoutes);

// Route de base pour tester l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API E-commerce Multi-Tenant!' });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur';
  res.status(statusCode).json({ message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
});

// Initialiser les tâches planifiées
scheduler.init();

// Ne démarrer le serveur que si ce fichier est exécuté directement (pas importé)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  }); 
}

// Exporter l'app pour les tests
module.exports = app; 