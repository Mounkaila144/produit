const { Product, Category } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const { createImageVariants } = require('../utils/imageProcessing');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

/**
 * Fonction pour normaliser les images d'un produit
 * Convertit différents formats d'images en array de strings d'URLs
 */
const normalizeProductImages = (product) => {
  if (!product.images) {
    return [];
  }
  
  let images = product.images;
  
  // Si c'est une string JSON, la parser
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (error) {
      console.error('Erreur lors du parsing des images JSON:', error);
      return [];
    }
  }
  
  // Si ce n'est pas un array, retourner un array vide
  if (!Array.isArray(images)) {
    return [];
  }
  
  // Normaliser chaque image
  return images.map(image => {
    // Si l'image est un objet avec une propriété url
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    // Si l'image est déjà une string (URL)
    if (typeof image === 'string') {
      return image;
    }
    // Si l'image est un objet avec plusieurs variantes, prendre la première disponible
    if (typeof image === 'object' && !image.url) {
      const variants = Object.values(image);
      if (variants.length > 0 && typeof variants[0] === 'string') {
        return variants[0];
      }
    }
    return null;
  }).filter(Boolean); // Enlever les valeurs null/undefined
};

/**
 * @desc    Créer un nouveau produit
 * @route   POST /api/tenant/products
 * @access  Admin, Manager
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, images, isActive, isFeatured } = req.body;
    
    console.log("Données reçues pour la création du produit:", JSON.stringify({
      name, description, price, stock, categoryId, 
      images: images ? `${Array.isArray(images) ? images.length : 'non-array'} images` : 'null',
      isActive, isFeatured, tenantId: req.tenant?.id
    }, null, 2));
    
    // Vérifier si la catégorie existe et appartient au tenant
    if (categoryId) {
      const category = await Category.findOne({
        where: { 
          id: categoryId,
          tenantId: req.tenant.id
        }
      });
      
      if (!category) {
        return next(new ErrorResponse(`Catégorie non trouvée avec l'ID ${categoryId}`, 404));
      }
    }
    
    // Vérifier et formater les images
    let validatedImages = [];
    if (images) {
      if (!Array.isArray(images)) {
        console.error("Le champ 'images' n'est pas un tableau:", typeof images);
        // Tenter de convertir en tableau si c'est une chaîne JSON
        if (typeof images === 'string') {
          try {
            const parsedImages = JSON.parse(images);
            if (Array.isArray(parsedImages)) {
              validatedImages = parsedImages.filter(url => typeof url === 'string' && url.trim() !== '');
              console.log("Images converties depuis chaîne JSON:", validatedImages);
            }
          } catch (e) {
            console.error("Impossible de parser la chaîne JSON:", e.message);
          }
        }
      } else {
        // Filtrer les URLs valides
        validatedImages = images.filter(url => typeof url === 'string' && url.trim() !== '');
        console.log('Images validées pour le nouveau produit:', validatedImages);
      }
    }
    
    // Créer le produit
    try {
      const productData = {
        name,
        description,
        price,
        stock: stock || 0,
        categoryId,
        tenantId: req.tenant.id,
        images: validatedImages,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false
      };
      
      console.log("Données envoyées à Sequelize:", JSON.stringify(productData, null, 2));
      
      const product = await Product.create(productData);
      
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (createError) {
      console.error("Erreur Sequelize lors de la création:", createError.name, createError.message);
      if (createError.errors && createError.errors.length) {
        console.error("Détails de validation:", JSON.stringify(createError.errors, null, 2));
      }
      throw createError;
    }
  } catch (error) {
    console.error("Erreur complète:", error);
    next(new ErrorResponse(`Erreur lors de la création du produit: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer tous les produits
 * @route   GET /api/tenant/products
 * @access  Public
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search,
      sort,
      limit = 10,
      page = 1
    } = req.query;
    
    // Construire les conditions de filtre
    const where = { tenantId: req.tenant.id };
    
    // Filtre par catégorie
    if (category) {
      where.categoryId = category;
    }
    
    // Recherche textuelle
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtre par prix
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Options de pagination
    const offset = (page - 1) * limit;
    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    };
    
    // Options de tri
    if (sort) {
      const [field, order] = sort.split(':');
      options.order = [[field, order === 'desc' ? 'DESC' : 'ASC']];
    } else {
      options.order = [['createdAt', 'DESC']];
    }
    
    // Exécuter la requête
    const { count, rows } = await Product.findAndCountAll(options);
    
    // Normaliser les images pour chaque produit
    const normalizedProducts = rows.map(product => {
      const productData = product.toJSON();
      productData.images = normalizeProductImages(productData);
      return productData;
    });
    
    // Calculer la pagination
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      success: true,
      count,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      },
      data: normalizedProducts
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des produits: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer un produit spécifique
 * @route   GET /api/tenant/products/:id
 * @access  Public
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!product) {
      return next(new ErrorResponse(`Produit non trouvé avec l'ID ${req.params.id}`, 404));
    }
    
    // Normaliser les images du produit
    const productData = product.toJSON();
    productData.images = normalizeProductImages(productData);
    
    res.status(200).json({
      success: true,
      data: productData
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération du produit: ${error.message}`, 500));
  }
};

/**
 * @desc    Mettre à jour un produit
 * @route   PUT /api/tenant/products/:id
 * @access  Admin, Manager
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, isActive, isFeatured, images } = req.body;
    
    let product = await Product.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!product) {
      return next(new ErrorResponse(`Produit non trouvé avec l'ID ${req.params.id}`, 404));
    }
    
    // Vérifier si la catégorie existe et appartient au tenant
    if (categoryId) {
      const category = await Category.findOne({
        where: { 
          id: categoryId,
          tenantId: req.tenant.id
        }
      });
      
      if (!category) {
        return next(new ErrorResponse(`Catégorie non trouvée avec l'ID ${categoryId}`, 404));
      }
    }
    
    // Vérifier et formater les images
    let validatedImages = product.images;
    if (images && Array.isArray(images)) {
      // Filtrer les URLs valides
      validatedImages = images.filter(url => typeof url === 'string' && url.trim() !== '');
      console.log('Images validées pour la mise à jour du produit:', validatedImages);
    }
    
    // Mettre à jour le produit
    product = await product.update({
      name,
      description,
      price,
      stock,
      categoryId,
      isActive,
      isFeatured,
      images: validatedImages
    });
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la mise à jour du produit: ${error.message}`, 500));
  }
};

/**
 * @desc    Supprimer un produit
 * @route   DELETE /api/tenant/products/:id
 * @access  Admin
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!product) {
      return next(new ErrorResponse(`Produit non trouvé avec l'ID ${req.params.id}`, 404));
    }
    
    // Supprimer les images associées au produit
    if (product.images && product.images.length > 0) {
      // Pour chaque image et ses variantes
      for (const image of product.images) {
        // Si l'image est un objet avec des variantes
        if (typeof image === 'object') {
          for (const imagePath of Object.values(image)) {
            const fullPath = path.join(process.cwd(), 'public', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } else {
          // Si l'image est une simple chaîne de caractères
          const fullPath = path.join(process.cwd(), 'public', image);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }
    
    await product.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la suppression du produit: ${error.message}`, 500));
  }
};

/**
 * @desc    Ajouter des images à un produit
 * @route   POST /api/tenant/products/:id/images
 * @access  Admin, Manager
 */
exports.uploadProductImages = async (req, res, next) => {
  try {
    // Vérifier si des fichiers ont été téléchargés
    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('Veuillez télécharger au moins une image', 400));
    }
    
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!product) {
      return next(new ErrorResponse(`Produit non trouvé avec l'ID ${req.params.id}`, 404));
    }
    
    // Traiter chaque image téléchargée
    const uploadedImages = [];
    
    for (const file of req.files) {
      // Redimensionner et créer plusieurs variantes de l'image
      const destFolder = `uploads/products/${req.tenant.id}`;
      const imageVariants = await createImageVariants(file, destFolder);
      
      // Ajouter les variantes à la liste des images
      uploadedImages.push(imageVariants);
    }
    
    // Mettre à jour les images du produit
    const images = [...(product.images || []), ...uploadedImages];
    await product.update({ images });
    
    res.status(200).json({
      success: true,
      data: {
        images
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors du téléchargement des images: ${error.message}`, 500));
  }
};

/**
 * @desc    Supprimer une image d'un produit
 * @route   DELETE /api/tenant/products/:id/images/:imageIndex
 * @access  Admin, Manager
 */
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { imageIndex } = req.params;
    
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!product) {
      return next(new ErrorResponse(`Produit non trouvé avec l'ID ${req.params.id}`, 404));
    }
    
    if (!product.images || !product.images[imageIndex]) {
      return next(new ErrorResponse(`Image non trouvée à l'index ${imageIndex}`, 404));
    }
    
    // Récupérer l'image à supprimer
    const imageToDelete = product.images[imageIndex];
    
    // Supprimer les fichiers
    if (typeof imageToDelete === 'object') {
      // Si l'image est un objet avec des variantes
      for (const imagePath of Object.values(imageToDelete)) {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    } else {
      // Si l'image est une simple chaîne de caractères
      const fullPath = path.join(process.cwd(), 'public', imageToDelete);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    // Mettre à jour les images du produit
    const images = [...product.images];
    images.splice(imageIndex, 1);
    await product.update({ images });
    
    res.status(200).json({
      success: true,
      data: {
        images
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la suppression de l'image: ${error.message}`, 500));
  }
}; 