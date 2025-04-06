const { Tenant } = require('../../src/models');
const { v4: uuidv4 } = require('uuid');

/**
 * Crée un tenant de test
 * @param {Object} tenantData - Données du tenant
 * @param {String} ownerId - ID du propriétaire (optionnel)
 * @returns {Object} - Informations du tenant créé
 */
const createTestTenant = async (tenantData = {}, ownerId = null) => {
  // Générer une date d'expiration (1 mois à partir de maintenant)
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // Données par défaut
  const defaultTenantData = {
    name: `Test Tenant ${Date.now()}`,
    description: 'Un tenant de test',
    domain: `test-tenant-${Date.now()}.example.com`,
    active: true,
    planType: 'basic',
    expiresAt,
    ownerId,
    contactInfo: {
      email: 'contact@example.com',
      phone: '+33612345678'
    }
  };

  // Fusionner les données par défaut avec celles fournies
  const mergedTenantData = { ...defaultTenantData, ...tenantData };

  // Créer le tenant
  const tenant = await Tenant.create(mergedTenantData);

  return tenant.toJSON();
};

module.exports = {
  createTestTenant
}; 