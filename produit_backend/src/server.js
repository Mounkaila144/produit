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
const publicRoutes = require('./routes/public.routes');

// Import des modèles
const { Tenant, User, Product, Category } = require('./models');
const { Op } = require('sequelize');

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

// S'assurer que le dossier products existe
const productsDir = path.join(uploadDir, 'products');
fs.mkdirSync(productsDir, { recursive: true });

// Serve uploads statically - avant toute autre route
const uploadsPath = path.join(__dirname, '../public/uploads');
console.log('Chemin des uploads:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Route spéciale pour accéder aux fichiers uploadés sans vérifier le tenant
app.get('/uploads/:tenantId/*', (req, res, next) => {
  // Reconstituer le chemin du fichier demandé
  const tenantId = req.params.tenantId;
  const remainingPath = req.params[0];
  const filePath = path.join(uploadsPath, tenantId, remainingPath);
  
  // Vérifier si le fichier existe
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  return next();
});

// Route de debug pour vérifier l'existence des fichiers
app.get('/check-file', (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: 'Le paramètre filename est requis' });
  }
  
  const filePath = path.join(uploadsPath, filename);
  const exists = fs.existsSync(filePath);
  
  return res.json({
    filename,
    path: filePath,
    exists,
    uploadsPath
  });
});

// Public routes (no tenant header required)
app.use('/api/public', publicRoutes);

// Routes directes (bypass tenant middleware)
app.get('/api/direct/tenants/by-domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Récupérer le tenant par son domaine
    const tenant = await Tenant.findOne({
      where: { 
        domain,
        active: true, // Seulement les tenants actifs
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: `Tenant avec le domaine ${domain} non trouvé ou inactif`
      });
    }

    // Vérifier si le tenant n'a pas expiré
    if (tenant.expiresAt && new Date(tenant.expiresAt) < new Date()) {
      return res.status(403).json({
        success: false,
        message: `L'abonnement du tenant ${tenant.name} a expiré`
      });
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération du tenant`
    });
  }
});

// Route directe pour récupérer les produits d'un tenant
app.get('/api/direct/products/tenant/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice,
      page = 1,
      limit = 10,
      sort = 'name'
    } = req.query;
    
    // Vérifier que le tenant existe et est actif
    const tenant = await Tenant.findOne({
      where: { 
        id: tenantId,
        active: true
      }
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: `Tenant avec l'ID ${tenantId} non trouvé ou inactif`
      });
    }
    
    // Vérifier si le tenant n'a pas expiré
    if (tenant.expiresAt && new Date(tenant.expiresAt) < new Date()) {
      return res.status(403).json({
        success: false,
        message: `L'abonnement du tenant ${tenant.name} a expiré`
      });
    }
    
    // Construire le filtre de recherche
    const where = { 
      tenantId 
    };
    
    // Ajouter le filtre de recherche par nom ou description
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtres de prix
    if (minPrice !== undefined) {
      where.price = { ...(where.price || {}), [Op.gte]: minPrice };
    }
    
    if (maxPrice !== undefined) {
      where.price = { ...(where.price || {}), [Op.lte]: maxPrice };
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    
    // Construire l'ordre de tri
    const order = [];
    if (sort) {
      const [field, direction] = sort.split(':');
      order.push([field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
    }
    
    // Filtrer par catégorie
    const include = [
      {
        model: Category,
        as: 'Category',
        attributes: ['id', 'name']
      }
    ];
    
    if (category) {
      include[0].where = { name: category };
    }
    
    // Récupérer les produits avec pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order
    });
    
    // Calculer les informations de pagination
    const totalPages = Math.ceil(count / limit);
    
    // Parser les images JSON pour chaque produit (comme dans product.controller.js)
    const processedProducts = products.map(product => {
      const productData = product.toJSON();
      
      // Parser les images si c'est une chaîne JSON
      if (typeof productData.images === 'string') {
        try {
          productData.images = JSON.parse(productData.images);
          console.log(`✅ Images parsées pour ${productData.name} (route directe):`, productData.images);
        } catch (e) {
          console.error(`❌ Erreur parsing images pour ${productData.name} (route directe):`, productData.images, e);
          productData.images = [];
        }
      }
      
      // S'assurer que c'est toujours un tableau
      if (!Array.isArray(productData.images)) {
        console.warn(`⚠️ Images non-array pour ${productData.name} (route directe), conversion en tableau:`, productData.images);
        productData.images = productData.images ? [productData.images] : [];
      }
      
      return productData;
    });
    
    res.status(200).json({
      success: true,
      count,
      data: processedProducts,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des produits: ${error.message}`
    });
  }
});

// Middleware pour extraire le tenant des requêtes
app.use(extractTenant);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/tenant-admin', tenantRoutes);
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