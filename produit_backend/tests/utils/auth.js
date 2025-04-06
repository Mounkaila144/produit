const jwt = require('jsonwebtoken');
const { User } = require('../../src/models');

/**
 * Crée un utilisateur de test et génère un token JWT
 * @param {Object} userData - Données de l'utilisateur
 * @param {String} role - Rôle de l'utilisateur (superadmin, admin, etc.)
 * @param {String} tenantId - ID du tenant
 * @returns {Object} - Informations de l'utilisateur avec token JWT
 */
const createTestUser = async (userData = {}, role = 'customer', tenantId = null) => {
  // Données par défaut
  const defaultUserData = {
    username: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    role,
    tenantId,
    whatsappNumber: `+3361234${Math.floor(Math.random() * 10000)}`,
    isActive: true
  };

  // Fusionner les données par défaut avec celles fournies
  const mergedUserData = { ...defaultUserData, ...userData };

  // Créer l'utilisateur
  const user = await User.create(mergedUserData);

  // Générer un token JWT
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Crée un superadmin de test
 * @returns {Object} - Informations du superadmin avec token
 */
const createSuperAdmin = async () => {
  return createTestUser(
    { username: 'superadmin', email: 'superadmin@example.com' },
    'superadmin',
    null
  );
};

/**
 * Crée un admin de tenant
 * @param {String} tenantId - ID du tenant
 * @returns {Object} - Informations de l'admin avec token
 */
const createTenantAdmin = async (tenantId) => {
  if (!tenantId) {
    throw new Error('tenantId est requis pour créer un admin de tenant');
  }
  
  return createTestUser(
    { username: 'tenant_admin', email: `admin_${tenantId}@example.com` },
    'admin',
    tenantId
  );
};

module.exports = {
  createTestUser,
  createSuperAdmin,
  createTenantAdmin
}; 