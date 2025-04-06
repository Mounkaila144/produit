const tenantService = require('../../src/services/tenant.service');
const { Tenant, User } = require('../../src/models');
const { initTestDB, cleanTestDB, closeTestDB } = require('../utils/db');
const { createTestUser } = require('../utils/auth');
const { createTestTenant } = require('../utils/tenant');

// Mock du service WhatsApp
jest.mock('../../src/services/whatsapp.service', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue({ success: true })
}));

describe('Tenant Service', () => {
  beforeAll(async () => {
    await initTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await cleanTestDB();
  });

  describe('checkExpiredTenants', () => {
    it('devrait désactiver les tenants expirés', async () => {
      // Créer un utilisateur propriétaire
      const { user: owner } = await createTestUser(
        { whatsappNumber: '+33612345678' },
        'admin'
      );

      // Créer un tenant expiré
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 5); // 5 jours dans le passé

      await createTestTenant({
        name: 'Tenant Expiré',
        active: true,
        expiresAt: expiredDate,
        ownerId: owner.id
      });

      // Créer un tenant non expiré
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // 1 mois dans le futur

      await createTestTenant({
        name: 'Tenant Actif',
        active: true,
        expiresAt: futureDate
      });

      // Exécuter la vérification
      const result = await tenantService.checkExpiredTenants();

      // Vérifier les résultats
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Tenant Expiré');
      expect(result[0].active).toBe(false);

      // Vérifier que le tenant non expiré est toujours actif
      const activeTenant = await Tenant.findOne({ where: { name: 'Tenant Actif' } });
      expect(activeTenant.active).toBe(true);
    });
  });

  describe('renewTenantSubscription', () => {
    it('devrait renouveler l\'abonnement d\'un tenant', async () => {
      // Créer un propriétaire
      const { user: owner } = await createTestUser(
        { whatsappNumber: '+33612345678' },
        'admin'
      );

      // Créer un tenant
      const tenant = await createTestTenant({
        name: 'Tenant à Renouveler',
        ownerId: owner.id
      });

      // Date initiale d'expiration
      const initialExpiry = new Date(tenant.expiresAt);

      // Renouveler l'abonnement pour 2 mois
      const renewedTenant = await tenantService.renewTenantSubscription(tenant.id, 2);

      // Nouvelle date d'expiration attendue
      const expectedExpiry = new Date(initialExpiry);
      expectedExpiry.setMonth(expectedExpiry.getMonth() + 2);

      // Vérifier que la date d'expiration a été mise à jour
      expect(new Date(renewedTenant.expiresAt).getMonth()).toBe(expectedExpiry.getMonth());
      expect(renewedTenant.active).toBe(true);
    });

    it('devrait gérer un tenant désactivé et expirer', async () => {
      // Créer un tenant désactivé et expiré
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 5); // Date d'il y a 5 jours
      
      const tenant = await createTestTenant({
        active: false,
        expiresAt: expiredDate
      });
      
      // Renouveler le tenant
      const renewedTenant = await tenantService.renewTenantSubscription(tenant.id, 1);
      
      // Vérifier que le tenant est réactivé et a une nouvelle date d'expiration
      expect(renewedTenant.active).toBe(true);
      
      // Calculer la date attendue après renouvellement (1 mois plus tard)
      const expectedDate = new Date();
      expectedDate.setMonth(expectedDate.getMonth() + 1);
      
      // Vérifier que la date d'expiration est dans le futur
      const expirationDate = new Date(renewedTenant.expiresAt);
      expect(expirationDate.getTime()).toBeGreaterThan(new Date().getTime());
    });
  });
}); 