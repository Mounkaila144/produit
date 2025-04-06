const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

/**
 * Gère le téléchargement et le traitement des images pour un produit
 */
exports.handleProductImages = async (tenantId, productId, files) => {
  try {
    // Vérifier si les fichiers sont présents
    if (!files || !files.images) {
      return [];
    }

    // S'assurer que files.images est un tableau
    const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
    
    // Créer le répertoire pour les images du tenant s'il n'existe pas
    const uploadDir = path.join(process.env.FILE_UPLOAD_PATH, tenantId, 'products', productId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Tableau pour stocker les chemins des images
    const imageUrls = [];
    
    // Traiter chaque image
    for (const file of imageFiles) {
      // Générer un nom de fichier unique
      const filename = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}${path.extname(file.name)}`;
      const optimizedFilename = `${path.parse(filename).name}_optimized${path.extname(filename)}`;
      
      // Chemins complets
      const originalPath = path.join(uploadDir, filename);
      const optimizedPath = path.join(uploadDir, optimizedFilename);
      
      // Chemins relatifs pour la base de données
      const originalUrl = `/uploads/${tenantId}/products/${productId}/${filename}`;
      const optimizedUrl = `/uploads/${tenantId}/products/${productId}/${optimizedFilename}`;
      
      // Déplacer le fichier original
      await file.mv(originalPath);
      
      // Créer une version optimisée
      await sharp(originalPath)
        .resize(800) // Redimensionner à 800px de large max
        .jpeg({ quality: 80 }) // Compression avec qualité à 80%
        .toFile(optimizedPath);
      
      // Ajouter les URLs au tableau
      imageUrls.push({
        original: originalUrl,
        optimized: optimizedUrl
      });
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Erreur lors du traitement des images:', error);
    throw error;
  }
};

/**
 * Ajoute des images à un produit existant
 */
exports.addImagesToProduct = async (productId, tenantId, imageFiles) => {
  try {
    // Récupérer le produit
    const product = await Product.findOne({
      where: {
        id: productId,
        tenantId
      }
    });
    
    if (!product) {
      throw new Error(`Produit avec l'ID ${productId} non trouvé`);
    }
    
    // Traiter les nouvelles images
    const newImages = await this.handleProductImages(tenantId, productId, { images: imageFiles });
    
    // Ajouter les nouvelles images à celles existantes
    const updatedImages = [...(product.images || []), ...newImages];
    
    // Mettre à jour le produit
    await product.update({ images: updatedImages });
    
    return product;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'images au produit ${productId}:`, error);
    throw error;
  }
};

/**
 * Supprime une image d'un produit
 */
exports.removeProductImage = async (productId, tenantId, imageIndex) => {
  try {
    // Récupérer le produit
    const product = await Product.findOne({
      where: {
        id: productId,
        tenantId
      }
    });
    
    if (!product) {
      throw new Error(`Produit avec l'ID ${productId} non trouvé`);
    }
    
    if (!product.images || !product.images[imageIndex]) {
      throw new Error(`Image avec l'index ${imageIndex} non trouvée`);
    }
    
    // Récupérer l'image à supprimer
    const imageToRemove = product.images[imageIndex];
    
    // Supprimer les fichiers du système de fichiers
    const originalPath = path.join(process.env.FILE_UPLOAD_PATH, '..', imageToRemove.original);
    const optimizedPath = path.join(process.env.FILE_UPLOAD_PATH, '..', imageToRemove.optimized);
    
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    
    if (fs.existsSync(optimizedPath)) {
      fs.unlinkSync(optimizedPath);
    }
    
    // Mettre à jour les images dans la base de données
    const updatedImages = [...product.images];
    updatedImages.splice(imageIndex, 1);
    
    await product.update({ images: updatedImages });
    
    return product;
  } catch (error) {
    console.error(`Erreur lors de la suppression d'une image du produit ${productId}:`, error);
    throw error;
  }
};

/**
 * Filtre les produits en fonction de critères
 */
exports.filterProducts = async (tenantId, options) => {
  const {
    categoryId,
    minPrice,
    maxPrice,
    search,
    sort = 'createdAt', 
    order = 'DESC',
    page = 1,
    limit = 10
  } = options;
  
  try {
    // Construire la clause WHERE
    const whereClause = {
      tenantId,
      isActive: true
    };
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (minPrice !== undefined) {
      whereClause.price = {
        ...whereClause.price,
        [Op.gte]: minPrice
      };
    }
    
    if (maxPrice !== undefined) {
      whereClause.price = {
        ...whereClause.price,
        [Op.lte]: maxPrice
      };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limit;
    
    // Exécuter la requête
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ],
      order: [[sort, order]],
      limit,
      offset
    });
    
    return {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      items: rows
    };
  } catch (error) {
    console.error('Erreur lors du filtrage des produits:', error);
    throw error;
  }
}; 