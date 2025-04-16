const express = require('express');
const router = express.Router();
const { Tenant, User, Product, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Récupérer les tenants actifs et non expirés par domaine
 * @route   GET /api/public/tenants/by-domain/:domain
 * @access  Public
 */
router.get('/tenants/by-domain/:domain', async (req, res) => {
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

/**
 * @desc    Récupérer tous les tenants actifs et non expirés
 * @route   GET /api/public/tenants
 * @access  Public
 */
router.get('/tenants', async (req, res) => {
  try {
    const now = new Date();
    
    // Récupérer tous les tenants actifs
    const tenants = await Tenant.findAll({
      where: { 
        active: true // Seulement les tenants actifs
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    // Filtrer les tenants non expirés
    const validTenants = tenants.filter(tenant => {
      return !tenant.expiresAt || new Date(tenant.expiresAt) >= now;
    });

    res.status(200).json({
      success: true,
      count: validTenants.length,
      data: validTenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des tenants`
    });
  }
});

/**
 * @desc    Récupérer les produits d'un tenant par son ID
 * @route   GET /api/public/products/tenant/:tenantId
 * @access  Public
 */
router.get('/products/tenant/:tenantId', async (req, res) => {
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
    
    // Récupérer les produits
    const products = await Product.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset,
      distinct: true
    });
    
    // Calculer la pagination
    const totalPages = Math.ceil(products.count / limit);
    
    res.status(200).json({
      success: true,
      count: products.count,
      data: products.rows,
      pagination: {
        totalItems: products.count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération des produits`
    });
  }
});

/**
 * @desc    Vérifier l'état de santé de l'API
 * @route   GET /api/public/health
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API en ligne',
    timestamp: new Date()
  });
});

module.exports = router; 