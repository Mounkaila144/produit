require('dotenv').config();
const { Tenant, User } = require('../src/models');

async function resetAdmin() {
  try {
    console.log('🗑️  Suppression des données existantes...');

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

    console.log('🔄 Base de données réinitialisée avec succès !');
    console.log('Vous pouvez maintenant exécuter: npm run create-admin');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
    console.error('Détails:', error);
  } finally {
    process.exit();
  }
}

// Exécuter le script
resetAdmin(); 