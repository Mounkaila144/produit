const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../src/server');
const { initTestDB, cleanTestDB, closeTestDB } = require('../utils/db');
const { createTestUser, createTenantAdmin } = require('../utils/auth');
const { createTestTenant } = require('../utils/tenant');
const { Product, Category } = require('../../src/models');

describe('API Products', () => {
  let tenant;
  let adminToken;
  let categoryId;

  beforeAll(async () => {
    await initTestDB();

    // Créer un tenant de test
    tenant = await createTestTenant({ name: 'Tenant Test Products' });

    // Créer un admin pour ce tenant
    const admin = await createTenantAdmin(tenant.id);
    adminToken = admin.token;

    // Créer un dossier pour les uploads de test
    const testUploadsDir = path.join(__dirname, '../../tests/uploads');
    if (!fs.existsSync(testUploadsDir)) {
      fs.mkdirSync(testUploadsDir, { recursive: true });
    }
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await Product.destroy({ where: { tenantId: tenant.id } });
    await Category.destroy({ where: { tenantId: tenant.id } });
    
    // Créer une catégorie de test
    const category = await Category.create({
      name: 'Catégorie Test',
      description: 'Une catégorie pour les tests',
      tenantId: tenant.id
    });
    
    categoryId = category.id;
  });

  describe('POST /api/products', () => {
    it('devrait créer un nouveau produit', async () => {
      const productData = {
        name: 'Produit Test',
        description: 'Description du produit de test',
        price: 19.99,
        stock: 100,
        categoryId
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', tenant.id)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price.toString());
      expect(response.body.data.tenantId).toBe(tenant.id);
    });

    it('devrait retourner une erreur si la catégorie n\'existe pas', async () => {
      const productData = {
        name: 'Produit Invalide',
        description: 'Ce produit a une catégorie invalide',
        price: 29.99,
        stock: 50,
        categoryId: 'invalid-category-id'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', tenant.id)
        .send(productData);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/products', () => {
    it('devrait récupérer une liste de produits', async () => {
      // Créer quelques produits de test
      await Product.create({
        name: 'Produit 1',
        description: 'Description 1',
        price: 10.99,
        stock: 20,
        categoryId,
        tenantId: tenant.id
      });

      await Product.create({
        name: 'Produit 2',
        description: 'Description 2',
        price: 20.99,
        stock: 30,
        categoryId,
        tenantId: tenant.id
      });

      const response = await request(app)
        .get('/api/products')
        .set('x-tenant-id', tenant.id);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('devrait filtrer les produits par catégorie', async () => {
      // Créer une autre catégorie
      const otherCategory = await Category.create({
        name: 'Autre Catégorie',
        description: 'Une autre catégorie',
        tenantId: tenant.id
      });

      // Créer des produits dans différentes catégories
      await Product.create({
        name: 'Produit Catégorie 1',
        price: 10.99,
        stock: 20,
        categoryId,
        tenantId: tenant.id
      });

      await Product.create({
        name: 'Produit Autre Catégorie',
        price: 20.99,
        stock: 30,
        categoryId: otherCategory.id,
        tenantId: tenant.id
      });

      const response = await request(app)
        .get(`/api/products?category=${categoryId}`)
        .set('x-tenant-id', tenant.id);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Produit Catégorie 1');
    });
  });

  describe('GET /api/products/:id', () => {
    it('devrait récupérer un produit spécifique', async () => {
      // Créer un produit
      const product = await Product.create({
        name: 'Produit Spécifique',
        description: 'Description du produit spécifique',
        price: 15.99,
        stock: 25,
        categoryId,
        tenantId: tenant.id
      });

      const response = await request(app)
        .get(`/api/products/${product.id}`)
        .set('x-tenant-id', tenant.id);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(product.id);
      expect(response.body.data.name).toBe(product.name);
    });

    it('devrait retourner 404 pour un produit inexistant', async () => {
      const response = await request(app)
        .get('/api/products/nonexistent-id')
        .set('x-tenant-id', tenant.id);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('devrait mettre à jour un produit', async () => {
      // Créer un produit
      const product = await Product.create({
        name: 'Produit à Modifier',
        description: 'Description avant modification',
        price: 25.99,
        stock: 40,
        categoryId,
        tenantId: tenant.id
      });

      const updateData = {
        name: 'Produit Modifié',
        description: 'Description après modification',
        price: 29.99,
        stock: 50
      };

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', tenant.id)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price.toString());
      expect(response.body.data.stock).toBe(updateData.stock);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('devrait supprimer un produit', async () => {
      // Créer un produit
      const product = await Product.create({
        name: 'Produit à Supprimer',
        price: 15.99,
        stock: 10,
        categoryId,
        tenantId: tenant.id
      });

      const response = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', tenant.id);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Vérifier que le produit a bien été supprimé
      const getProduct = await request(app)
        .get(`/api/products/${product.id}`)
        .set('x-tenant-id', tenant.id);

      expect(getProduct.status).toBe(404);
    });
  });
}); 