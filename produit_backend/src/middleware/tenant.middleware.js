const { Tenant } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware pour extraire le tenant des requêtes
 * Il cherche l'identifiant du tenant dans les en-têtes
 * et ajoute le tenant au req.tenant s'il est trouvé
 */
exports.extractTenant = async (req, res, next) => {
  // Routes sans tenant (superadmin et setup-tenant)
  const bypassRoutes = [
    '/api/auth/setup-tenant',
    '/api/auth/super-admin/login',
    '/api/auth/login',
    '/api/auth/profile',
    '/api/superadmin'
  ];

  // Vérifier si la route doit bypasser la vérification du tenant
  if (bypassRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Récupérer l'ID du tenant depuis les en-têtes
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return next(new ErrorResponse('ID de tenant manquant dans les en-têtes (x-tenant-id)', 400));
  }

  try {
    // Chercher le tenant dans la base de données
    const tenant = await Tenant.findByPk(tenantId);

    if (!tenant) {
      return next(new ErrorResponse(`Tenant avec l'ID ${tenantId} non trouvé`, 404));
    }

    if (!tenant.active) {
      return next(new ErrorResponse(`Le tenant ${tenant.name} est désactivé`, 403));
    }

    // Vérifier si le tenant a expiré
    if (tenant.expiresAt && new Date(tenant.expiresAt) < new Date()) {
      return next(new ErrorResponse(`L'abonnement du tenant ${tenant.name} a expiré`, 403));
    }

    // Ajouter le tenant à la requête pour l'utiliser dans les contrôleurs
    req.tenant = tenant;
    req.tenantId = tenant.id;

    next();
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération du tenant: ${error.message}`, 500));
  }
};

/**
 * Middleware pour vérifier que l'utilisateur appartient au tenant spécifié
 */
exports.verifyTenantMembership = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Utilisateur non authentifié', 401));
  }

  if (!req.tenant) {
    return next(new ErrorResponse('Tenant non trouvé', 404));
  }

  // Le superadmin peut accéder à tous les tenants
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Vérifier que l'utilisateur appartient au tenant
  if (req.user.tenantId !== req.tenant.id) {
    return next(new ErrorResponse('Vous n\'êtes pas autorisé à accéder à ce tenant', 403));
  }

  next();
}; 