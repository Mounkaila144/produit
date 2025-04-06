const cron = require('node-cron');
const tenantService = require('./tenant.service');
const fs = require('fs');
const path = require('path');

/**
 * Nettoie les fichiers temporaires dans les dossiers d'upload
 */
exports.cleanTempFolders = async () => {
  console.log('Nettoyage des dossiers temporaires d\'upload...');
  try {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    
    // Vérifier si le dossier uploads existe
    if (!fs.existsSync(uploadsDir)) {
      console.log('Le dossier uploads n\'existe pas');
      return;
    }
    
    // Lister tous les dossiers tenant
    const tenantDirs = fs.readdirSync(uploadsDir);
    
    for (const tenantDir of tenantDirs) {
      const tenantPath = path.join(uploadsDir, tenantDir);
      
      // Vérifier que c'est un dossier
      if (fs.statSync(tenantPath).isDirectory()) {
        // Vérifier si un dossier temp existe pour ce tenant
        const tempPath = path.join(tenantPath, 'temp');
        
        if (fs.existsSync(tempPath) && fs.statSync(tempPath).isDirectory()) {
          // Supprimer le contenu du dossier temp
          const tempFiles = fs.readdirSync(tempPath);
          
          console.log(`Nettoyage de ${tempFiles.length} fichiers temporaires dans ${tempPath}`);
          
          for (const file of tempFiles) {
            // Calculer l'âge du fichier en heures
            const filePath = path.join(tempPath, file);
            const stats = fs.statSync(filePath);
            const fileAge = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60); // en heures
            
            // Supprimer les fichiers de plus de 24 heures
            if (fileAge > 24) {
              fs.unlinkSync(filePath);
              console.log(`Fichier temporaire supprimé: ${filePath} (âge: ${fileAge.toFixed(2)} heures)`);
            }
          }
        }
      }
    }
    
    console.log('Nettoyage des dossiers temporaires terminé');
  } catch (error) {
    console.error('Erreur lors du nettoyage des dossiers temporaires:', error);
  }
};

/**
 * Initialise les tâches planifiées
 */
exports.init = () => {
  // Vérification quotidienne des tenants expirés (à minuit)
  cron.schedule('0 0 * * *', async () => {
    console.log('Lancement de la vérification des tenants expirés...');
    try {
      await tenantService.checkExpiredTenants();
      console.log('Vérification des tenants expirés terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la vérification des tenants expirés:', error);
    }
  });

  // Envoi des notifications d'expiration (à 10h du matin)
  cron.schedule('0 10 * * *', async () => {
    console.log('Lancement de l\'envoi des notifications d\'expiration...');
    try {
      await tenantService.sendExpirationNotifications();
      console.log('Envoi des notifications d\'expiration terminé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications d\'expiration:', error);
    }
  });

  // Nettoyage des dossiers temporaires (à 3h du matin)
  cron.schedule('0 3 * * *', async () => {
    console.log('Lancement du nettoyage des dossiers temporaires...');
    try {
      await exports.cleanTempFolders();
    } catch (error) {
      console.error('Erreur lors du nettoyage des dossiers temporaires:', error);
    }
  });

  console.log('Planificateur de tâches initialisé');
}; 