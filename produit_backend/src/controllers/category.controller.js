const { Category, Product } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Créer une nouvelle catégorie
 * @route   POST /api/tenant/categories
 * @access  Admin, Manager
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId } = req.body;
    
    // Vérifier si le parent existe et appartient au même tenant
    if (parentId) {
      const parentCategory = await Category.findOne({
        where: { 
          id: parentId,
          tenantId: req.tenant.id
        }
      });
      
      if (!parentCategory) {
        return next(new ErrorResponse(`Catégorie parente non trouvée avec l'ID ${parentId}`, 404));
      }
    }
    
    // Créer la catégorie
    const category = await Category.create({
      name,
      description,
      parentId,
      tenantId: req.tenant.id
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la création de la catégorie: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer toutes les catégories
 * @route   GET /api/tenant/categories
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
  try {
    const { hierarchical } = req.query;
    
    // Récupérer toutes les catégories du tenant
    const categories = await Category.findAll({
      where: { tenantId: req.tenant.id },
      include: hierarchical === 'true' ? [
        {
          model: Category,
          as: 'children',
          include: {
            model: Category,
            as: 'children'
          }
        }
      ] : []
    });
    
    // Si mode hiérarchique, ne retourner que les catégories racines
    let result = categories;
    if (hierarchical === 'true') {
      result = categories.filter(category => !category.parentId);
    }
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des catégories: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer une catégorie spécifique
 * @route   GET /api/tenant/categories/:id
 * @access  Public
 */
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      },
      include: [
        {
          model: Category,
          as: 'children'
        },
        {
          model: Category,
          as: 'parent'
        }
      ]
    });
    
    if (!category) {
      return next(new ErrorResponse(`Catégorie non trouvée avec l'ID ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération de la catégorie: ${error.message}`, 500));
  }
};

/**
 * @desc    Mettre à jour une catégorie
 * @route   PUT /api/tenant/categories/:id
 * @access  Admin, Manager
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, parentId } = req.body;
    
    let category = await Category.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!category) {
      return next(new ErrorResponse(`Catégorie non trouvée avec l'ID ${req.params.id}`, 404));
    }
    
    // Vérifier si le parent existe et appartient au même tenant
    if (parentId && parentId !== category.parentId) {
      // Vérifier qu'on n'essaie pas de définir la catégorie comme son propre parent ou descendant
      if (parentId === category.id) {
        return next(new ErrorResponse('Une catégorie ne peut pas être son propre parent', 400));
      }
      
      const parentCategory = await Category.findOne({
        where: { 
          id: parentId,
          tenantId: req.tenant.id
        }
      });
      
      if (!parentCategory) {
        return next(new ErrorResponse(`Catégorie parente non trouvée avec l'ID ${parentId}`, 404));
      }
      
      // Vérifier que ce n'est pas un descendant
      const isDescendant = await isChildCategory(parentId, category.id);
      if (isDescendant) {
        return next(new ErrorResponse('Une catégorie ne peut pas avoir un descendant comme parent', 400));
      }
    }
    
    // Mettre à jour la catégorie
    category = await category.update({
      name,
      description,
      parentId
    });
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la mise à jour de la catégorie: ${error.message}`, 500));
  }
};

/**
 * @desc    Supprimer une catégorie
 * @route   DELETE /api/tenant/categories/:id
 * @access  Admin
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!category) {
      return next(new ErrorResponse(`Catégorie non trouvée avec l'ID ${req.params.id}`, 404));
    }
    
    // Vérifier s'il y a des produits dans cette catégorie
    const productsCount = await Product.count({
      where: { 
        categoryId: category.id,
        tenantId: req.tenant.id
      }
    });
    
    if (productsCount > 0) {
      return next(new ErrorResponse(`Impossible de supprimer la catégorie car elle contient ${productsCount} produit(s)`, 400));
    }
    
    // Vérifier s'il y a des sous-catégories
    const childrenCount = await Category.count({
      where: { 
        parentId: category.id,
        tenantId: req.tenant.id
      }
    });
    
    if (childrenCount > 0) {
      return next(new ErrorResponse(`Impossible de supprimer la catégorie car elle contient ${childrenCount} sous-catégorie(s)`, 400));
    }
    
    await category.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la suppression de la catégorie: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer tous les produits d'une catégorie
 * @route   GET /api/tenant/categories/:id/products
 * @access  Public
 */
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        tenantId: req.tenant.id
      }
    });
    
    if (!category) {
      return next(new ErrorResponse(`Catégorie non trouvée avec l'ID ${req.params.id}`, 404));
    }
    
    const products = await Product.findAll({
      where: { 
        categoryId: category.id,
        tenantId: req.tenant.id,
        isActive: true
      }
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des produits: ${error.message}`, 500));
  }
};

/**
 * Fonction utilitaire pour vérifier si une catégorie est descendante d'une autre
 */
async function isChildCategory(parentId, childId) {
  // Cas de base
  if (parentId === childId) {
    return true;
  }
  
  // Récupérer toutes les sous-catégories du parent potentiel
  const children = await Category.findAll({
    where: { parentId }
  });
  
  // Vérifier récursivement chaque enfant
  for (const child of children) {
    if (await isChildCategory(child.id, childId)) {
      return true;
    }
  }
  
  return false;
} 