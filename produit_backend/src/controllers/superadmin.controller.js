const { Tenant, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const { sendWhatsAppMessage } = require('../services/whatsapp.service');

/**
 * @desc    Créer un nouveau tenant
 * @route   POST /api/superadmin/tenants
 * @access  Superadmin
 */
exports.createTenant = async (req, res, next) => {
  try {
    const { name, description, domain, planType, contactInfo, ownerId } = req.body;

    // Créer le tenant
    const tenant = await Tenant.create({
      name,
      description,
      domain,
      planType: planType || 'basic',
      contactInfo,
      ownerId
    });

    // Si un propriétaire est spécifié, mettre à jour son rôle et l'associer au tenant
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (owner) {
        await owner.update({ 
          role: 'admin',
          tenantId: tenant.id
        });

        // Envoyer une notification WhatsApp au propriétaire
        /* Commenté car whatsappNumber n'existe pas dans la base de données
        if (owner.whatsappNumber) {
          await sendWhatsAppMessage({
            phoneNumber: owner.whatsappNumber,
            message: `Félicitations! Vous êtes maintenant propriétaire du tenant ${tenant.name}. Votre abonnement expire le ${tenant.expiresAt}.`
          });
        }
        */
      }
    }

    res.status(201).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la création du tenant: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer tous les tenants
 * @route   GET /api/superadmin/tenants
 * @access  Superadmin
 */
exports.getAllTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des tenants: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer un tenant spécifique
 * @route   GET /api/superadmin/tenants/:id
 * @access  Superadmin
 */
exports.getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération du tenant: ${error.message}`, 500));
  }
};

/**
 * @desc    Mettre à jour un tenant
 * @route   PUT /api/superadmin/tenants/:id
 * @access  Superadmin
 */
exports.updateTenant = async (req, res, next) => {
  try {
    // Logs pour débugger
    console.log("Body reçu dans updateTenant:", req.body);
    
    const { name, description, domain, planType, contactInfo, active, customDomain, expiresAt } = req.body;
    
    // Debug des valeurs extraites
    console.log("expiresAt extrait:", expiresAt);

    let tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    // Préparer les données de mise à jour
    const updateData = {
      name,
      description,
      domain,
      planType,
      contactInfo,
      active,
      customDomain
    };
    
    // Ajouter expiresAt seulement s'il est défini
    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt);
      console.log("Date d'expiration après conversion:", updateData.expiresAt);
    }
    
    console.log("Données complètes pour mise à jour:", updateData);
    
    tenant = await tenant.update(updateData);
    console.log("Tenant après mise à jour:", tenant.dataValues);

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    next(new ErrorResponse(`Erreur lors de la mise à jour du tenant: ${error.message}`, 500));
  }
};

/**
 * @desc    Désactiver un tenant
 * @route   PUT /api/superadmin/tenants/:id/disable
 * @access  Superadmin
 */
exports.disableTenant = async (req, res, next) => {
  try {
    let tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    tenant = await tenant.update({ active: false });

    // Notifier le propriétaire par WhatsApp
    if (tenant.ownerId) {
      const owner = await User.findByPk(tenant.ownerId);
      /* Commenté car whatsappNumber n'existe pas dans la base de données
      if (owner && owner.whatsappNumber) {
        await sendWhatsAppMessage({
          phoneNumber: owner.whatsappNumber,
          message: `Votre tenant ${tenant.name} a été désactivé. Veuillez contacter l'administrateur pour plus d'informations.`
        });
      }
      */
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la désactivation du tenant: ${error.message}`, 500));
  }
};

/**
 * @desc    Activer un tenant
 * @route   PUT /api/superadmin/tenants/:id/enable
 * @access  Superadmin
 */
exports.enableTenant = async (req, res, next) => {
  try {
    let tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    tenant = await tenant.update({ active: true });

    // Notifier le propriétaire par WhatsApp
    if (tenant.ownerId) {
      const owner = await User.findByPk(tenant.ownerId);
      /* Commenté car whatsappNumber n'existe pas dans la base de données
      if (owner && owner.whatsappNumber) {
        await sendWhatsAppMessage({
          phoneNumber: owner.whatsappNumber,
          message: `Votre tenant ${tenant.name} a été réactivé.`
        });
      }
      */
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de l'activation du tenant: ${error.message}`, 500));
  }
};

/**
 * @desc    Supprimer un tenant
 * @route   DELETE /api/superadmin/tenants/:id
 * @access  Superadmin
 */
exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    // Notifier le propriétaire par WhatsApp avant la suppression
    if (tenant.ownerId) {
      const owner = await User.findByPk(tenant.ownerId);
      /* Commenté car whatsappNumber n'existe pas dans la base de données
      if (owner && owner.whatsappNumber) {
        await sendWhatsAppMessage({
          phoneNumber: owner.whatsappNumber,
          message: `Votre tenant ${tenant.name} a été supprimé définitivement.`
        });
      }
      */
    }

    await tenant.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la suppression du tenant: ${error.message}`, 500));
  }
};

/**
 * @desc    Renouveler l'abonnement d'un tenant
 * @route   PUT /api/superadmin/tenants/:id/renew
 * @access  Superadmin
 */
exports.renewTenant = async (req, res, next) => {
  try {
    // Logs pour débugger
    console.log("Body reçu dans renewTenant:", req.body);
    console.log("Headers:", req.headers);
    console.log("Params:", req.params);
    
    const { planType, expiresAt } = req.body;
    
    // Plus de logs détaillés
    console.log("planType extrait:", planType);
    console.log("expiresAt extrait:", expiresAt);
    
    let tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    // Vérifier si une date d'expiration est fournie
    let newExpiresAt;
    if (expiresAt) {
      // Utiliser la date fournie
      newExpiresAt = new Date(expiresAt);
      console.log("Date après conversion:", newExpiresAt);
    } else {
      // Par défaut, prolonger d'un an
      newExpiresAt = new Date();
      newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);
      console.log("Date par défaut utilisée:", newExpiresAt);
    }
    
    // Préparer les données de mise à jour
    const updateData = {
      expiresAt: newExpiresAt,
      active: true
    };
    
    // Mettre à jour le plan si spécifié
    if (planType) {
      updateData.planType = planType;
    }
    
    console.log("Données finales pour mise à jour:", updateData);
    
    tenant = await tenant.update(updateData);
    console.log("Tenant après mise à jour:", tenant.dataValues);

    // Notifier le propriétaire par WhatsApp
    if (tenant.ownerId) {
      const owner = await User.findByPk(tenant.ownerId);
      /* Commenté car whatsappNumber n'existe pas dans la base de données
      if (owner && owner.whatsappNumber) {
        await sendWhatsAppMessage({
          phoneNumber: owner.whatsappNumber,
          message: `Votre abonnement pour ${tenant.name} a été renouvelé jusqu'au ${tenant.expiresAt}.`
        });
      }
      */
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    next(new ErrorResponse(`Erreur lors du renouvellement de l'abonnement: ${error.message}`, 500));
  }
};

/**
 * @desc    Assigner un propriétaire à un tenant
 * @route   POST /api/superadmin/tenants/:id/owner
 * @access  Superadmin
 */
exports.assignOwner = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return next(new ErrorResponse('Veuillez fournir un ID utilisateur', 400));
    }

    let tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) {
      return next(new ErrorResponse(`Tenant non trouvé avec l'ID ${req.params.id}`, 404));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${userId}`, 404));
    }

    // Mettre à jour le role de l'utilisateur et l'associer au tenant
    await user.update({
      role: 'admin',
      tenantId: tenant.id
    });

    // Mettre à jour le propriétaire du tenant
    tenant = await tenant.update({ ownerId: userId });

    // Envoyer une notification WhatsApp au nouveau propriétaire
    /* Commenté car whatsappNumber n'existe pas dans la base de données
    if (user.whatsappNumber) {
      await sendWhatsAppMessage({
        phoneNumber: user.whatsappNumber,
        message: `Félicitations! Vous êtes maintenant propriétaire du tenant ${tenant.name}. Votre abonnement expire le ${tenant.expiresAt}.`
      });
    }
    */

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de l'assignation du propriétaire: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer tous les utilisateurs (pour superadmin)
 * @route   GET /api/superadmin/users
 * @access  Superadmin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Récupérer le modèle User
    // La classe User a une association avec Tenant sans alias spécifique pour tenantId
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'tenantId', 'lastLogin', 'createdAt', 'updatedAt'],
      include: {
        model: Tenant,
        attributes: ['id', 'name'],
        required: false
      }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      items: users
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération des utilisateurs: ${error.message}`, 500));
  }
};

/**
 * @desc    Récupérer un utilisateur spécifique (pour superadmin)
 * @route   GET /api/superadmin/users/:id
 * @access  Superadmin
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: {
        model: Tenant,
        attributes: ['id', 'name', 'domain'],
        required: false
      }
    });

    if (!user) {
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la récupération de l'utilisateur: ${error.message}`, 500));
  }
};

/**
 * @desc    Créer un nouvel utilisateur (pour superadmin)
 * @route   POST /api/superadmin/users
 * @access  Superadmin
 */
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, tenantId } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('Un utilisateur avec cet email existe déjà', 400));
    }

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password,
      role,
      tenantId,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la création de l'utilisateur: ${error.message}`, 500));
  }
};

/**
 * @desc    Mettre à jour un utilisateur (pour superadmin)
 * @route   PUT /api/superadmin/users/:id
 * @access  Superadmin
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, role, tenantId } = req.body;

    let user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${req.params.id}`, 404));
    }

    // Mettre à jour l'utilisateur
    user = await user.update({
      username,
      email,
      role,
      tenantId
    });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`, 500));
  }
};

/**
 * @desc    Supprimer un utilisateur (pour superadmin)
 * @route   DELETE /api/superadmin/users/:id
 * @access  Superadmin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${req.params.id}`, 404));
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la suppression de l'utilisateur: ${error.message}`, 500));
  }
};

/**
 * @desc    Activer un utilisateur (pour superadmin)
 * @route   PUT /api/superadmin/users/:id/enable
 * @access  Superadmin
 */
exports.enableUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${req.params.id}`, 404));
    }

    await user.update({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de l'activation de l'utilisateur: ${error.message}`, 500));
  }
};

/**
 * @desc    Désactiver un utilisateur (pour superadmin)
 * @route   PUT /api/superadmin/users/:id/disable
 * @access  Superadmin
 */
exports.disableUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'ID ${req.params.id}`, 404));
    }

    await user.update({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(new ErrorResponse(`Erreur lors de la désactivation de l'utilisateur: ${error.message}`, 500));
  }
}; 