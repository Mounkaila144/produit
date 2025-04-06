const { Tenant, User } = require('../models');
const { sendWhatsAppMessage } = require('./whatsapp.service');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Vérifier et désactiver les tenants expirés
 */
exports.checkExpiredTenants = async () => {
  try {
    // Trouver tous les tenants actifs dont l'abonnement a expiré
    const expiredTenants = await Tenant.findAll({
      where: {
        active: true,
        expiresAt: { [Op.lt]: new Date() }
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'whatsappNumber']
        }
      ]
    });

    console.log(`${expiredTenants.length} tenants expirés trouvés.`);

    // Désactiver chaque tenant expiré
    for (const tenant of expiredTenants) {
      await tenant.update({ active: false });
      console.log(`Tenant ${tenant.name} désactivé (expiré le ${tenant.expiresAt}).`);

      // Notifier le propriétaire par WhatsApp
      if (tenant.owner && tenant.owner.whatsappNumber) {
        await sendWhatsAppMessage({
          phoneNumber: tenant.owner.whatsappNumber,
          message: `Votre tenant ${tenant.name} a été désactivé car votre abonnement a expiré le ${tenant.expiresAt}. Veuillez contacter l'administrateur pour renouveler votre abonnement.`
        });
      }
    }

    return expiredTenants;
  } catch (error) {
    console.error('Erreur lors de la vérification des tenants expirés:', error);
    throw error;
  }
};

/**
 * Envoyer des notifications avant expiration
 */
exports.sendExpirationNotifications = async () => {
  try {
    const now = new Date();
    
    // Délais de notification (en jours)
    const notificationDays = [7, 3, 1];
    
    for (const days of notificationDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      // Fixer l'heure à 23:59:59 pour capturer tous les tenants qui expirent ce jour-là
      targetDate.setHours(23, 59, 59, 999);
      
      // Date de début pour éviter les notifications en double
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Trouver les tenants qui expirent dans [days] jours
      const expiringTenants = await Tenant.findAll({
        where: {
          active: true,
          expiresAt: {
            [Op.gte]: startDate,
            [Op.lte]: targetDate
          }
        },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'whatsappNumber']
          }
        ]
      });
      
      console.log(`${expiringTenants.length} tenants expirant dans ${days} jour(s) trouvés.`);
      
      // Envoyer les notifications par WhatsApp
      for (const tenant of expiringTenants) {
        if (tenant.owner && tenant.owner.whatsappNumber) {
          await sendWhatsAppMessage({
            phoneNumber: tenant.owner.whatsappNumber,
            message: `Votre abonnement pour ${tenant.name} expire dans ${days} jour(s), le ${tenant.expiresAt}. Veuillez contacter l'administrateur pour renouveler votre abonnement.`
          });
          console.log(`Notification WhatsApp envoyée à ${tenant.owner.whatsappNumber} pour le tenant ${tenant.name} (expiration dans ${days} jour(s)).`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications d\'expiration:', error);
    throw error;
  }
};

/**
 * Renouvelle l'abonnement d'un tenant
 */
exports.renewTenantSubscription = async (tenantId, durationMonths = 1) => {
  try {
    const tenant = await Tenant.findByPk(tenantId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'whatsappNumber']
        }
      ]
    });
    
    if (!tenant) {
      throw new Error(`Tenant avec l'ID ${tenantId} non trouvé`);
    }
    
    // Calculer la nouvelle date d'expiration
    const currentExpiry = tenant.expiresAt ? new Date(tenant.expiresAt) : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + durationMonths);
    
    // Mettre à jour le tenant
    await tenant.update({
      expiresAt: newExpiry,
      active: true // Réactiver si désactivé
    });
    
    // Notifier le propriétaire par WhatsApp
    if (tenant.owner && tenant.owner.whatsappNumber) {
      await sendWhatsAppMessage({
        phoneNumber: tenant.owner.whatsappNumber,
        message: `Votre abonnement pour ${tenant.name} a été renouvelé jusqu'au ${tenant.expiresAt}.`
      });
    }
    
    return tenant;
  } catch (error) {
    console.error(`Erreur lors du renouvellement de l'abonnement du tenant ${tenantId}:`, error);
    throw error;
  }
};

/**
 * Gère le téléchargement et la sauvegarde du logo d'un tenant
 */
exports.uploadTenantLogo = async (tenant, logoFile) => {
  try {
    // Créer le répertoire s'il n'existe pas
    const uploadDir = path.join(process.env.FILE_UPLOAD_PATH || './public/uploads', tenant.id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique
    const uniqueFilename = `logo-${Date.now()}${path.extname(logoFile.originalname)}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Déplacer le fichier
    await logoFile.mv(filePath);
    
    // Mettre à jour le chemin du logo dans la base de données
    const logoUrl = `/uploads/${tenant.id}/${uniqueFilename}`;
    await tenant.update({ logoUrl });
    
    return logoUrl;
  } catch (error) {
    console.error(`Erreur lors du téléchargement du logo pour le tenant ${tenant.id}:`, error);
    throw error;
  }
}; 