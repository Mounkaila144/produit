require('dotenv').config();
const { User } = require('../src/models');

async function createSuperAdmin() {
  try {
    console.log('🚀 Création du super administrateur...');

    // Vérifier si l'utilisateur superadmin existe déjà
    const existingUser = await User.findOne({
      where: { email: 'superadmin@gmail.com' }
    });
    
    if (existingUser) {
      console.log('⚠️  Un super administrateur avec cet email existe déjà');
      console.log('Détails:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        tenantId: existingUser.tenantId || 'AUCUN'
      });
      console.log('Voulez-vous le mettre à jour ? Supprimez-le d\'abord si nécessaire.');
      return;
    }

    // Créer l'utilisateur super admin (le mot de passe sera hashé automatiquement par le hook beforeCreate)
    console.log('👤 Création du super administrateur...');
    const superAdminUser = await User.create({
      username: 'superadmin',
      email: 'superadmin@gmail.com',
      password: 'mounkaila144', // Le mot de passe sera hashé automatiquement
      role: 'superadmin',
      tenantId: null // Le superadmin n'appartient à aucun tenant spécifique
    });

    console.log('✅ Super administrateur créé avec succès !');
    console.log('📧 Email:', superAdminUser.email);
    console.log('👤 Username:', superAdminUser.username);
    console.log('🔑 Role:', superAdminUser.role);
    console.log('🏢 Tenant ID:', superAdminUser.tenantId || 'AUCUN (accès à tous les tenants)');
    console.log('');
    console.log('🔐 Informations de connexion:');
    console.log('   Email: superadmin@gmail.com');
    console.log('   Mot de passe: mounkaila144');
    console.log('');
    console.log('⚠️  N\'oubliez pas de changer le mot de passe après la première connexion !');
    console.log('💡 Le superadmin peut accéder à tous les tenants du système.');

  } catch (error) {
    console.error('❌ Erreur lors de la création du super admin:', error.message);
    console.error('Détails:', error);
  } finally {
    process.exit();
  }
}

// Exécuter le script
createSuperAdmin(); 