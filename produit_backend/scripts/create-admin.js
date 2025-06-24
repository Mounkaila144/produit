require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Tenant, User } = require('../src/models');

async function createAdmin() {
  try {
    console.log('🚀 Création de l\'administrateur...');

    // Vérifier si un tenant existe déjà
    let tenant = await Tenant.findOne({
      where: { domain: 'nigerdev.com' }
    });

    // Si aucun tenant n'existe, en créer un
    if (!tenant) {
      console.log('📝 Création du tenant principal...');
      tenant = await Tenant.create({
        name: 'NigerDev',
        domain: 'nigerdev.com',
        description: 'Boutique principale NigerDev',
        active: true
      });
      console.log('✅ Tenant créé avec l\'ID:', tenant.id);
    } else {
      console.log('✅ Tenant existant trouvé avec l\'ID:', tenant.id);
    }

    // Vérifier si l'utilisateur admin existe déjà
    const existingUser = await User.findOne({
      where: { email: 'mounkaila144@gmail.com' }
    });

    if (existingUser) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà');
      console.log('Voulez-vous le mettre à jour ? Supprimez-le d\'abord si nécessaire.');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('mounkaila144', 10);

    // Créer l'utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...');
    const adminUser = await User.create({
      username: 'mounkaila144',
      email: 'mounkaila144@gmail.com',
      password: hashedPassword,
      role: 'admin', // Utiliser 'admin' au lieu de 'super-admin'
      tenantId: tenant.id
    });

    console.log('✅ Administrateur créé avec succès !');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔑 Role:', adminUser.role);
    console.log('🏢 Tenant ID:', adminUser.tenantId);
    console.log('');
    console.log('🔐 Informations de connexion:');
    console.log('   Email: mounkaila144@gmail.com');
    console.log('   Mot de passe: mounkaila144');
    console.log('');
    console.log('⚠️  N\'oubliez pas de changer le mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    console.error('Détails:', error);
  } finally {
    process.exit();
  }
}

// Exécuter le script
createAdmin(); 