require('dotenv').config();
const { User, Tenant } = require('../src/models');

async function diagnoseDB() {
  try {
    console.log('🔍 Diagnostic de la base de données...');

    // Obtenir les informations sur les colonnes Users
    const userColumns = await User.sequelize.query(
      "DESCRIBE Users",
      { type: User.sequelize.QueryTypes.SELECT }
    );

    console.log('\n📋 Structure de la table Users:');
    console.table(userColumns);

    // Obtenir les informations sur les colonnes Tenants
    const tenantColumns = await User.sequelize.query(
      "DESCRIBE Tenants",
      { type: User.sequelize.QueryTypes.SELECT }
    );

    console.log('\n📋 Structure de la table Tenants:');
    console.table(tenantColumns);

    // Vérifier les données existantes
    const usersCount = await User.count();
    const tenantsCount = await Tenant.count();

    console.log('\n📊 Données existantes:');
    console.log(`- Utilisateurs: ${usersCount}`);
    console.log(`- Tenants: ${tenantsCount}`);

    if (usersCount > 0) {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'role'],
        limit: 5
      });
      console.log('\n👥 Premiers utilisateurs:');
      console.table(users.map(u => u.toJSON()));
    }

    if (tenantsCount > 0) {
      const tenants = await Tenant.findAll({
        attributes: ['id', 'name', 'domain', 'active'],
        limit: 5
      });
      console.log('\n🏢 Premiers tenants:');
      console.table(tenants.map(t => t.toJSON()));
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    console.error('Détails:', error);
  } finally {
    process.exit();
  }
}

// Exécuter le script
diagnoseDB(); 