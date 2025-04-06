const { User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Récupérer tous les utilisateurs du tenant
 * @route   GET /api/users
 * @access  Privé (admin, manager)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { tenantId: req.tenantId },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupérer un utilisateur spécifique
 * @route   GET /api/users/:id
 * @access  Privé (admin, manager, ou soi-même)
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
        tenantId: req.tenantId
      },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Vérifier si l'utilisateur a le droit de voir cet utilisateur
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== user.id) {
      return next(new ErrorResponse('Non autorisé à accéder à cette ressource', 403));
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer un nouvel utilisateur (par l'admin)
 * @route   POST /api/users
 * @access  Privé (admin)
 */
exports.createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  // Valider l'entrée
  if (!username || !email || !password) {
    return next(new ErrorResponse('Veuillez fournir tous les champs requis', 400));
  }

  try {
    // Vérifier si l'email existe déjà dans ce tenant
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
      role: role || 'customer',
      tenantId: req.tenantId
    });

    // Ne pas renvoyer le mot de passe
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Privé (admin, ou soi-même avec restrictions)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
        tenantId: req.tenantId
      }
    });

    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Vérifier les autorisations
    const isSelf = req.user.id === user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isSelf) {
      return next(new ErrorResponse('Non autorisé à modifier cet utilisateur', 403));
    }

    // Protéger contre la modification du rôle par des non-admins
    const updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.role; // Seul l'admin peut changer le rôle
    }

    // Protéger contre la désactivation de son propre compte
    if (isSelf && updateData.isActive === false) {
      return next(new ErrorResponse('Vous ne pouvez pas désactiver votre propre compte', 400));
    }

    // Mettre à jour l'utilisateur
    await user.update(updateData);

    // Récupérer l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Privé (admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
        tenantId: req.tenantId
      }
    });

    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Empêcher la suppression de son propre compte
    if (req.user.id === user.id) {
      return next(new ErrorResponse('Vous ne pouvez pas supprimer votre propre compte', 400));
    }

    await user.destroy();

    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
}; 