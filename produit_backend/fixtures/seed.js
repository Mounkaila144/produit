require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Utilisation de SQLite pour faciliter les tests
const config = {
  dialect: 'sqlite',
  storage: './database.sqlite', // Fichier local pour conserver les données
  logging: false
};

// Initialiser la connexion à la base de données
const sequelize = new Sequelize(config);

// Importer les modèles
const db = require('../src/models');
const { User, Tenant, Category, Product } = db;

// Fonction pour hacher les mots de passe
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Données de test
const tenants = [
  {
    id: uuidv4(),
    name: 'Boutique Électronique',
    description: 'Vente de produits électroniques et gadgets technologiques',
    domain: 'electronique.example.com',
    active: true,
    planType: 'premium',
    contactInfo: JSON.stringify({ email: 'contact@electronique.example.com', phone: '+33123456789' }),
    expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Mode Fashion',
    description: 'Boutique de vêtements et accessoires de mode',
    domain: 'fashion.example.com',
    active: true,
    planType: 'basic',
    contactInfo: JSON.stringify({ email: 'contact@fashion.example.com', phone: '+33987654321' }),
    expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Épicerie Bio',
    description: 'Produits alimentaires biologiques et écologiques',
    domain: 'bio.example.com',
    active: true,
    planType: 'enterprise',
    contactInfo: JSON.stringify({ email: 'contact@bio.example.com', phone: '+33654321987' }),
    expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Utilisateurs
let users = [];

// Categories
let categories = [];

// Produits
let products = [];

// Fonction pour générer des données de test
async function generateData() {
  // Créer le super admin
  const superAdminPassword = await hashPassword('superadmin123');
  const superAdmin = {
    id: uuidv4(),
    username: 'SuperAdmin',
    email: 'superadmin@example.com',
    password: superAdminPassword,
    role: 'superadmin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(superAdmin);

  // Créer les tenants sans référence au propriétaire pour le moment
  tenants.forEach(tenant => {
    tenant.ownerId = null; // Temporairement null
  });

  // Préparer les administrateurs de tenant et associer les IDs
  const tenantAdmins = [];
  for (const tenant of tenants) {
    // Admin du tenant
    const adminId = uuidv4();
    const adminPassword = await hashPassword('admin123');
    const admin = {
      id: adminId,
      username: `Admin_${tenant.name.split(' ')[0]}`,
      email: `admin@${tenant.domain}`,
      password: adminPassword,
      role: 'admin',
      isActive: true,
      tenantId: tenant.id, // Tenant existe déjà
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tenantAdmins.push({ admin, tenantId: tenant.id });
    users.push(admin);

    // Créer des clients pour ce tenant
    for (let i = 1; i <= 5; i++) {
      const customerPassword = await hashPassword('customer123');
      const customer = {
        id: uuidv4(),
        username: `Client${i}_${tenant.name.split(' ')[0]}`,
        email: `client${i}@${tenant.domain}`,
        password: customerPassword,
        role: 'customer',
        isActive: true,
        tenantId: tenant.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(customer);
    }

    // Créer des catégories pour ce tenant
    const tenantCategories = [];
    const categoryNames = getCategoriesForTenant(tenant.name);
    
    for (const categoryName of categoryNames) {
      const category = {
        id: uuidv4(),
        name: categoryName,
        description: `Catégorie ${categoryName} pour ${tenant.name}`,
        tenantId: tenant.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      categories.push(category);
      tenantCategories.push(category);
    }

    // Créer des produits pour chaque catégorie
    for (const category of tenantCategories) {
      const numProducts = Math.floor(Math.random() * 5) + 5; // 5 à 10 produits par catégorie
      
      for (let i = 1; i <= numProducts; i++) {
        const productName = getProductNameForCategory(category.name, i);
        const product = {
          id: uuidv4(),
          name: productName,
          description: `Description détaillée pour ${productName}`,
          price: (Math.random() * 100 + 10).toFixed(2), // Prix entre 10 et 110
          stock: Math.floor(Math.random() * 100) + 1, // Stock entre 1 et 100
          images: JSON.stringify([{ url: `/uploads/products/${category.name.toLowerCase()}-${i}.jpg` }]),
          isActive: true,
          categoryId: category.id,
          tenantId: tenant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        products.push(product);
      }
    }
  }
  
  // Stocker les informations d'administrateur pour mise à jour ultérieure
  return tenantAdmins;
}

// Fonction helper pour obtenir des noms de catégories selon le tenant
function getCategoriesForTenant(tenantName) {
  switch (tenantName) {
    case 'Boutique Électronique':
      return ['Smartphones', 'Ordinateurs', 'Audio', 'Accessoires', 'Tablettes'];
    case 'Mode Fashion':
      return ['Hommes', 'Femmes', 'Enfants', 'Accessoires', 'Chaussures'];
    case 'Épicerie Bio':
      return ['Fruits et Légumes', 'Produits Laitiers', 'Épicerie', 'Boissons', 'Hygiène'];
    default:
      return ['Catégorie 1', 'Catégorie 2', 'Catégorie 3'];
  }
}

// Fonction helper pour obtenir des noms de produits selon la catégorie
function getProductNameForCategory(categoryName, index) {
  const productsByCategory = {
    'Smartphones': ['iPhone 13', 'Samsung Galaxy S21', 'Xiaomi Redmi Note 10', 'Google Pixel 6', 'OnePlus 9', 'Oppo Find X3', 'Huawei P40', 'Sony Xperia 5', 'Motorola Edge', 'Realme GT'],
    'Ordinateurs': ['MacBook Air', 'Dell XPS 13', 'HP Spectre', 'Lenovo ThinkPad', 'Asus ZenBook', 'Acer Swift', 'Microsoft Surface', 'Alienware M15', 'MSI Stealth', 'Razer Blade'],
    'Audio': ['AirPods Pro', 'Sony WH-1000XM4', 'Bose QuietComfort', 'JBL Flip 5', 'Sennheiser HD 450BT', 'Marshall Stanmore', 'Harman Kardon Aura', 'Beats Studio', 'Sonos One', 'Ultimate Ears Boom'],
    'Accessoires': ['Chargeur rapide', 'Coque de protection', 'Support téléphone', 'Batterie externe', 'Câble USB-C', 'Adaptateur HDMI', 'Clavier sans fil', 'Souris ergonomique', 'Tapis de souris', 'Webcam HD'],
    'Tablettes': ['iPad Pro', 'Samsung Galaxy Tab', 'Huawei MatePad', 'Amazon Fire HD', 'Lenovo Tab', 'Microsoft Surface Go', 'Xiaomi Pad 5', 'Asus ZenPad', 'Acer Iconia', 'Google Pixel Slate'],
    
    'Hommes': ['T-shirt coton', 'Jean slim', 'Chemise casual', 'Pull maille', 'Veste légère', 'Pantalon chino', 'Polo classique', 'Blouson cuir', 'Sweat à capuche', 'Bermuda'],
    'Femmes': ['Robe d\'été', 'Blouse fluide', 'Jupe plissée', 'Top à bretelles', 'Pantalon large', 'Pull oversize', 'Veste blazer', 'T-shirt graphique', 'Combinaison', 'Cardigan'],
    'Enfants': ['T-shirt imprimé', 'Jean confort', 'Robe princesse', 'Sweat ludique', 'Pyjama doux', 'Short sport', 'Veste imperméable', 'Chaussettes motifs', 'Bonnet hiver', 'Maillot de bain'],
    'Accessoires': ['Sac à main', 'Ceinture cuir', 'Écharpe laine', 'Lunettes soleil', 'Montre classique', 'Chapeau été', 'Bijoux fantaisie', 'Gants tactiles', 'Portefeuille', 'Foulard soie'],
    'Chaussures': ['Baskets urbaines', 'Bottines cuir', 'Mocassins élégants', 'Sandales été', 'Escarpins soirée', 'Derbies classiques', 'Sneakers tendance', 'Bottes hiver', 'Espadrilles', 'Chaussures bateau'],
    
    'Fruits et Légumes': ['Panier de saison', 'Pommes Bio', 'Carottes fraîches', 'Oranges à jus', 'Bananes équitables', 'Tomates grappe', 'Salade locale', 'Courgettes', 'Avocats mûrs', 'Fraises'],
    'Produits Laitiers': ['Yaourt nature', 'Fromage chèvre', 'Beurre doux', 'Lait d\'amande', 'Crème fraîche', 'Comté 18 mois', 'Mozzarella', 'Yaourt grec', 'Feta', 'Burrata'],
    'Épicerie': ['Pâtes complètes', 'Riz basmati', 'Huile d\'olive', 'Miel de fleurs', 'Confiture maison', 'Café moulu', 'Chocolat noir', 'Thé vert', 'Biscuits sablés', 'Céréales muesli'],
    'Boissons': ['Jus d\'orange', 'Vin rouge bio', 'Eau minérale', 'Thé glacé', 'Smoothie fruits', 'Bière artisanale', 'Cidre fermier', 'Kombucha', 'Limonade', 'Lait végétal'],
    'Hygiène': ['Savon naturel', 'Shampoing solide', 'Dentifrice bio', 'Déodorant sans aluminium', 'Crème hydratante', 'Lessive écologique', 'Brosse à dents bambou', 'Cotons réutilisables', 'Gel douche', 'Huile essentielle']
  };
  
  // Utiliser un index modulo pour éviter de dépasser la taille du tableau
  const productsForCategory = productsByCategory[categoryName] || [`Produit ${index}`];
  return productsForCategory[index % productsForCategory.length];
}

// Fonction pour insérer les données dans la base de données
async function seedDatabase() {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ force: true });
    console.log('Tables créées avec succès.');

    // Générer les données
    const tenantAdmins = await generateData();

    // 1. D'abord créer les tenants (sans propriétaire pour le moment)
    await Tenant.bulkCreate(tenants);
    console.log(`${tenants.length} tenants créés.`);

    // 2. Puis les utilisateurs
    await User.bulkCreate(users);
    console.log(`${users.length} utilisateurs créés.`);

    // 3. Mettre à jour les tenants avec leur propriétaire
    for (const { admin, tenantId } of tenantAdmins) {
      await Tenant.update(
        { ownerId: admin.id },
        { where: { id: tenantId } }
      );
    }
    console.log('Propriétaires de tenant associés.');

    // 4. Puis les catégories
    await Category.bulkCreate(categories);
    console.log(`${categories.length} catégories créées.`);

    // 5. Enfin les produits
    await Product.bulkCreate(products);
    console.log(`${products.length} produits créés.`);

    // Créer un fichier JSON avec les données pour faciliter l'importation dans le frontend
    const exportData = {
      tenants,
      users: users.map(user => ({ ...user, password: undefined })), // Ne pas exporter les mots de passe
      categories,
      products
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'export-data.json'), 
      JSON.stringify(exportData, null, 2)
    );
    console.log('Données exportées dans le fichier export-data.json');

    console.log('Base de données remplie avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du remplissage de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter le script
seedDatabase(); 