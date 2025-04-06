const { User, Tenant } = require('../models');
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const { sequelize } = require('../models');

/**
 * @desc    Configuration d'un nouveau tenant avec son admin
 * @route   POST /api/auth/setup-tenant
 * @access  Public
 */
exports.setupTenant = async (req, res, next) => {
  const { tenantName, domain, adminUsername, adminEmail, adminPassword } = req.body;

  // Valider l'entrée
  if (!tenantName || !domain || !adminUsername || !adminEmail || !adminPassword) {
    return next(new ErrorResponse('Veuillez fournir tous les champs requis', 400));
  }

  // Utiliser une transaction pour s'assurer que tout est créé ou rien ne l'est
  const transaction = await sequelize.transaction();

  try {
    // Vérifier si le domaine existe déjà
    const existingTenant = await Tenant.findOne({ 
      where: { domain },
      transaction
    });

    if (existingTenant) {
      await transaction.rollback();
      return next(new ErrorResponse(`Le domaine ${domain} est déjà utilisé`, 400));
    }

    // Créer le tenant
    const tenant = await Tenant.create({
      id: uuidv4(),
      name: tenantName,
      domain,
      active: true
    }, { transaction });

    // Créer l'admin
    const admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      tenantId: tenant.id
    }, { transaction });

    // Associer l'admin comme propriétaire du tenant
    await tenant.update({ ownerId: admin.id }, { transaction });

    // Valider la transaction
    await transaction.commit();

    // Générer un token
    const token = admin.generateAuthToken();

    res.status(201).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain
      },
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        token
      }
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await transaction.rollback();
    next(error);
  }
};

/**
 * @desc    Connexion utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  const { email, password, tenantId } = req.body;

  // Valider l'entrée
  if (!email || !password) {
    return next(new ErrorResponse('Veuillez fournir un email et un mot de passe', 400));
  }

  try {
    // Vérifier si l'utilisateur existe
    const whereClause = { email };
    
    // Prioriser le tenantId passé dans le corps de la requête, sinon utiliser celui extrait par le middleware
    const effectiveTenantId = tenantId || req.tenantId;
    
    // Si un tenantId est disponible, l'ajouter à la clause de recherche
    if (effectiveTenantId) {
      whereClause.tenantId = effectiveTenantId;
    }

    // Chercher l'utilisateur
    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return next(new ErrorResponse('Ce compte est désactivé. Contactez l\'administrateur.', 403));
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    // Mettre à jour la date de dernière connexion
    await user.update({ lastLogin: new Date() });

    // Générer un token
    const token = user.generateAuthToken();

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public (limité au contexte du tenant)
 */
exports.register = async (req, res, next) => {
  const { username, email, password, role = 'customer' } = req.body;

  // Valider l'entrée
  if (!username || !email || !password) {
    return next(new ErrorResponse('Veuillez fournir tous les champs requis', 400));
  }

  // Vérifier si un tenantId est présent
  if (!req.tenantId) {
    return next(new ErrorResponse('ID de tenant requis pour l\'inscription', 400));
  }

  try {
    // Vérifier si l'email existe déjà pour ce tenant
    const existingUser = await User.findOne({
      where: {
        email,
        tenantId: req.tenantId
      }
    });

    if (existingUser) {
      return next(new ErrorResponse('Cet email est déjà utilisé', 400));
    }

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password,
      role: ['customer', 'editor'].includes(role) ? role : 'customer', // Limiter les rôles disponibles
      tenantId: req.tenantId
    });

    // Générer un token
    const token = user.generateAuthToken();

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/auth/profile
 * @access  Privé
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Tenant,
          as: 'ownedTenants',
          attributes: ['id', 'name', 'domain', 'active', 'expiresAt']
        }
      ]
    });

    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}; 