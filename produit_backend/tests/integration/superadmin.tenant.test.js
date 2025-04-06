const request = require('supertest');
const path = require('path');
const app = require('../../src/server');
const { initTestDB, cleanTestDB, closeTestDB } = require('../utils/db');
const { createSuperAdmin, createTestUser } = require('../utils/auth');
const { createTestTenant } = require('../utils/tenant');

describe('API SuperAdmin Tenants', () => {
  let superadminToken;
  let testTenantId;

  // Mock du service WhatsApp
  jest.mock('../../src/services/whatsapp.service', () => ({
    sendWhatsAppMessage: jest.fn().mockResolvedValue({ success: true })
  }));

  beforeAll(async () => {
    await initTestDB();
    // Créer un superadmin et récupérer son token
    const superAdmin = await createSuperAdmin();
    superadminToken = superAdmin.token;
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await cleanTestDB();
  });

  describe('POST /api/superadmin/tenants', () => {
    it('devrait créer un nouveau tenant', async () => {
      const tenantData = {
        name: 'Nouveau Tenant',
        description: 'Description du tenant de test',
        domain: 'nouveau-tenant.example.com',
        planType: 'premium'
      };

      const response = await request(app)
        .post('/api/superadmin/tenants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(tenantData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(tenantData.name);
      expect(response.body.data.planType).toBe(tenantData.planType);

      // Sauvegarder l'ID pour les tests suivants
      testTenantId = response.body.data.id;
    });

    it('devrait créer un tenant et assigner un propriétaire', async () => {
      // Créer un utilisateur régulier
      const { user } = await createTestUser(
        { username: 'futureowner', email: 'futureowner@example.com' },
        'customer'
      );

      const tenantData = {
        name: 'Tenant avec propriétaire',
        description: 'Description du tenant avec propriétaire',
        domain: 'tenant-proprietaire.example.com',
        planType: 'basic',
        ownerId: user.id
      };

      const response = await request(app)
        .post('/api/superadmin/tenants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(tenantData);

      expect(response.status).toBe(201);
      expect(response.body.data.ownerId).toBe(user.id);

      // Vérifier que l'utilisateur a été mis à jour
      const updatedUser = await request(app)
        .get(`/api/superadmin/users/${user.id}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(updatedUser.body.data.role).toBe('admin');
      expect(updatedUser.body.data.tenantId).toBe(response.body.data.id);
    });
  });

  describe('GET /api/superadmin/tenants', () => {
    it('devrait récupérer tous les tenants', async () => {
      // Créer quelques tenants de test
      await createTestTenant({ name: 'Tenant Test 1' });
      await createTestTenant({ name: 'Tenant Test 2' });

      const response = await request(app)
        .get('/api/superadmin/tenants')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/superadmin/tenants/:id', () => {
    it('devrait récupérer un tenant spécifique', async () => {
      // Créer un tenant de test
      const tenant = await createTestTenant({ name: 'Tenant Spécifique' });

      const response = await request(app)
        .get(`/api/superadmin/tenants/${tenant.id}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tenant.id);
      expect(response.body.data.name).toBe(tenant.name);
    });

    it('devrait retourner 404 pour un tenant inexistant', async () => {
      const response = await request(app)
        .get('/api/superadmin/tenants/nonexistent-id')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/superadmin/tenants/:id', () => {
    it('devrait mettre à jour un tenant', async () => {
      // Créer un tenant de test
      const tenant = await createTestTenant({ name: 'Tenant à Modifier' });

      const updateData = {
        name: 'Tenant Modifié',
        description: 'Nouvelle description',
        planType: 'enterprise'
      };

      const response = await request(app)
        .put(`/api/superadmin/tenants/${tenant.id}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.planType).toBe(updateData.planType);
    });
  });

  describe('PUT /api/superadmin/tenants/:id/disable', () => {
    it('devrait désactiver un tenant', async () => {
      // Créer un tenant actif
      const tenant = await createTestTenant({ 
        name: 'Tenant à Désactiver',
        active: true
      });

      const response = await request(app)
        .put(`/api/superadmin/tenants/${tenant.id}/disable`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.active).toBe(false);
    });
  });

  describe('PUT /api/superadmin/tenants/:id/enable', () => {
    it('devrait activer un tenant désactivé', async () => {
      // Créer un tenant désactivé
      const tenant = await createTestTenant({ 
        name: 'Tenant à Activer',
        active: false
      });

      const response = await request(app)
        .put(`/api/superadmin/tenants/${tenant.id}/enable`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.active).toBe(true);
    });
  });

  describe('PUT /api/superadmin/tenants/:id/renew', () => {
    it('devrait renouveler l\'abonnement d\'un tenant', async () => {
      // Créer un tenant
      const tenant = await createTestTenant({ name: 'Tenant à Renouveler' });
      
      // Date initiale d'expiration
      const initialExpiry = new Date(tenant.expiresAt);

      const response = await request(app)
        .put(`/api/superadmin/tenants/${tenant.id}/renew`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ months: 3 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Vérifier que la date d'expiration a été mise à jour
      const newExpiryDate = new Date(response.body.data.expiresAt);
      expect(newExpiryDate > initialExpiry).toBe(true);
    });
  });

  describe('DELETE /api/superadmin/tenants/:id', () => {
    it('devrait supprimer un tenant', async () => {
      // Créer un tenant à supprimer
      const tenant = await createTestTenant({ name: 'Tenant à Supprimer' });

      const response = await request(app)
        .delete(`/api/superadmin/tenants/${tenant.id}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Vérifier que le tenant a bien été supprimé
      const getTenant = await request(app)
        .get(`/api/superadmin/tenants/${tenant.id}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(getTenant.status).toBe(404);
    });
  });
}); 