require('dotenv').config();
const { Tenant, User } = require('../src/models');

async function resetAdmin() {
  try {
    console.log('🗑️  Suppression des données existantes...');

    // Désactiver les vérifications de clés étrangères temporairement
    await User.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Supprimer tous les utilisateurs
    await User.destroy({
      where: {},
      truncate: true
    });
    console.log('✅ Utilisateurs supprimés');

    // Supprimer tous les tenants
    await Tenant.destroy({
      where: {},
      truncate: true
    });
    console.log('✅ Tenants supprimés');

    // Réactiver les vérifications de clés étrangères
    await User.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🔄 Base de données réinitialisée avec succès !');
    console.log('Vous pouvez maintenant exécuter: npm run create-admin');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
    console.error('Détails:', error);
    
    // S'assurer que les clés étrangères sont réactivées même en cas d'erreur
    try {
      await User.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error('Erreur lors de la réactivation des FK:', e.message);
    }
  } finally {
    process.exit();
  }
}

// Exécuter le script
resetAdmin(); 