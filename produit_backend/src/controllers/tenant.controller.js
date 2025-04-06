const { Tenant, User, Category, Product } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const { resizeImage } = require('../utils/imageProcessing');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Obtenir le profil du tenant
 * @route   GET /api/tenant/profile
 * @access  Propriétaire
 */
exports.getTenantProfile = async (req, res, next) => {
  try {
    // Le tenant est déjà chargé dans req.tenant par le middleware
    const tenant = req.tenant;

    // Ajouter des statistiques du tenant
    const categoriesCount = await Category.count({ where: { tenantId: tenant.id } });
    const productsCount = await Product.count({ where: { tenantId: tenant.id } });
    const usersCount = await User.count({ where: { tenantId: tenant.id } });

    res.status(200).json({
      success: true,
      data: {
        ...tenant.toJSON(),
        stats: {
          categories: categoriesCount,
          products: productsCount,
          users: usersCount
        }
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération du profil: ${error.message}`, 500));
  }
};

/**
 * @desc    Mettre à jour le profil du tenant
 * @route   PUT /api/tenant/profile
 * @access  Propriétaire
 */
exports.updateTenantProfile = async (req, res, next) => {
  try {
    const { name, description, contactInfo, customDomain } = req.body;
    const tenant = req.tenant;

    // Vérifier que l'utilisateur est propriétaire
    if (tenant.ownerId !== req.user.id && req.user.role !== 'superadmin') {
      return next(new ErrorResponse('Seul le propriétaire peut modifier le profil du tenant', 403));
    }

    // Mettre à jour le tenant
    const updatedTenant = await tenant.update({
      name,
      description,
      contactInfo,
      customDomain
    });

    res.status(200).json({
      success: true,
      data: updatedTenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la mise à jour du profil: ${error.message}`, 500));
  }
};

/**
 * @desc    Télécharger/mettre à jour le logo du tenant
 * @route   POST /api/tenant/logo
 * @access  Propriétaire
 */
exports.uploadTenantLogo = async (req, res, next) => {
  try {
    // Vérifier si un fichier a été téléchargé
    if (!req.file) {
      return next(new ErrorResponse('Veuillez télécharger un fichier', 400));
    }

    const tenant = req.tenant;

    // Vérifier que l'utilisateur est propriétaire
    if (tenant.ownerId !== req.user.id && req.user.role !== 'superadmin') {
      return next(new ErrorResponse('Seul le propriétaire peut modifier le logo du tenant', 403));
    }

    // Supprimer l'ancien logo si existant
    if (tenant.logoUrl) {
      const oldLogoPath = path.join(process.cwd(), 'public', tenant.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Redimensionner et optimiser le logo
    const destFolder = `uploads/logos/${tenant.id}`;
    const logoUrl = await resizeImage(req.file, destFolder, {
      width: 300,
      height: 300,
      fit: 'contain',
      quality: 90
    });

    // Mettre à jour l'URL du logo
    await tenant.update({ logoUrl });

    res.status(200).json({
      success: true,
      data: {
        logoUrl
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors du téléchargement du logo: ${error.message}`, 500));
  }
};

/**
 * @desc    Mettre à jour les informations de contact du tenant
 * @route   PUT /api/tenant/contact
 * @access  Propriétaire
 */
exports.updateTenantContact = async (req, res, next) => {
  try {
    const { email, phone, address, website, socialMedia } = req.body;
    const tenant = req.tenant;

    // Vérifier que l'utilisateur est propriétaire
    if (tenant.ownerId !== req.user.id && req.user.role !== 'superadmin') {
      return next(new ErrorResponse('Seul le propriétaire peut modifier les informations de contact', 403));
    }

    // Mettre à jour les informations de contact
    const contactInfo = {
      email,
      phone,
      address,
      website,
      socialMedia
    };

    const updatedTenant = await tenant.update({ contactInfo });

    res.status(200).json({
      success: true,
      data: updatedTenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la mise à jour des informations de contact: ${error.message}`, 500));
  }
};

/**
 * @desc    Obtenir les informations d'abonnement du tenant
 * @route   GET /api/tenant/subscription
 * @access  Propriétaire
 */
exports.getSubscriptionInfo = async (req, res, next) => {
  try {
    const tenant = req.tenant;

    // Calculer le nombre de jours restants
    const today = new Date();
    const expiresAt = new Date(tenant.expiresAt);
    const diffTime = expiresAt - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      data: {
        planType: tenant.planType,
        active: tenant.active,
        expiresAt: tenant.expiresAt,
        daysRemaining: diffDays > 0 ? diffDays : 0,
        isExpired: diffDays <= 0
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des informations d'abonnement: ${error.message}`, 500));
  }
};

/**
 * @desc    Tableau de bord du tenant
 * @route   GET /api/tenant/dashboard
 * @access  Propriétaire
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const tenant = req.tenant;

    // Statistiques de base
    const categoriesCount = await Category.count({ where: { tenantId: tenant.id } });
    const productsCount = await Product.count({ where: { tenantId: tenant.id } });
    const usersCount = await User.count({ where: { tenantId: tenant.id } });

    // Informations sur l'abonnement
    const today = new Date();
    const expiresAt = new Date(tenant.expiresAt);
    const diffTime = expiresAt - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Produits récents
    const recentProducts = await Product.findAll({
      where: { tenantId: tenant.id },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // Retourner les données du tableau de bord
    res.status(200).json({
      success: true,
      data: {
        tenant: {
          name: tenant.name,
          planType: tenant.planType,
          active: tenant.active,
          expiresAt: tenant.expiresAt,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          logoUrl: tenant.logoUrl
        },
        stats: {
          categories: categoriesCount,
          products: productsCount,
          users: usersCount
        },
        recentProducts
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération du tableau de bord: ${error.message}`, 500));
  }
};

/**
 * @desc    Gérer les utilisateurs du tenant
 * @route   GET /api/tenant/users
 * @access  Propriétaire
 */
exports.getTenantUsers = async (req, res, next) => {
  try {
    const tenant = req.tenant;
    
    // Récupérer tous les utilisateurs du tenant
    const users = await User.findAll({
      where: { tenantId: tenant.id },
      attributes: ['id', 'username', 'email', 'whatsappNumber', 'role', 'isActive', 'createdAt', 'lastLogin']
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des utilisateurs: ${error.message}`, 500));
  }
}; 