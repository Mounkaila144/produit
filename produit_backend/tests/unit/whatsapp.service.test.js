const { sendWhatsAppMessage } = require('../../src/services/whatsapp.service');

// Mocker axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}));

describe('WhatsApp Service', () => {
  // Sauvegarder et restaurer l'environnement
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Fixer l'environnement à 'development' pour les tests
    process.env = { ...originalEnv, NODE_ENV: 'development' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendWhatsAppMessage', () => {
    it('devrait valider le format du numéro de téléphone', async () => {
      // Format de numéro invalide
      await expect(sendWhatsAppMessage({ 
        phoneNumber: '123456', 
        message: 'Test message' 
      })).rejects.toThrow('Format de numéro de téléphone invalide');

      // Format de numéro valide
      const result = await sendWhatsAppMessage({
        phoneNumber: '+33612345678',
        message: 'Test message'
      });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('to', '+33612345678');
      expect(result).toHaveProperty('content', 'Test message');
    });

    it('devrait simuler l\'envoi en environnement de développement', async () => {
      const result = await sendWhatsAppMessage({
        phoneNumber: '+33612345678',
        message: 'Test message'
      });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Message simulé en environnement de développement');
    });

    it('devrait utiliser l\'API WhatsApp en production', async () => {
      // Changer l'environnement à 'production'
      process.env.NODE_ENV = 'production';
      process.env.WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id';
      process.env.WHATSAPP_TOKEN = 'test_token';

      // Simuler un succès d'envoi
      const result = await sendWhatsAppMessage({
        phoneNumber: '+33612345678',
        message: 'Test message'
      });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Message envoyé avec succès (simulation)');
    });
  });
}); 