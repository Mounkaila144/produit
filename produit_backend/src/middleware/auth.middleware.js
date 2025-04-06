const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware pour protéger les routes
 * Vérifie que l'utilisateur est authentifié
 */
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les en-têtes
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Non autorisé. Veuillez vous connecter.', 401));
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur correspondant
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    if (!user.isActive) {
      return next(new ErrorResponse('Compte désactivé. Contactez l\'administrateur.', 403));
    }

    // Si tenantId dans le token, vérifier que ça correspond au tenant de la requête
    if (decoded.tenantId && req.tenantId && decoded.tenantId !== req.tenantId) {
      return next(new ErrorResponse('Non autorisé. Token invalide pour ce tenant.', 403));
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Non autorisé. Token invalide.', 401));
  }
};

/**
 * Middleware pour autoriser les rôles spécifiques
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Utilisateur non authentifié', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`, 403));
    }

    next();
  };
};

/**
 * Middleware spécifique pour les superadmins
 */
exports.superadminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Utilisateur non authentifié', 401));
  }

  if (req.user.role !== 'superadmin') {
    return next(new ErrorResponse('Accès réservé aux super-administrateurs', 403));
  }

  next();
}; 