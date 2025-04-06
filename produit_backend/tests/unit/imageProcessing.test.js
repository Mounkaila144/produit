const path = require('path');
const fs = require('fs');
const { resizeImage, createImageVariants } = require('../../src/utils/imageProcessing');

// Mocker les fonctions de sharp
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(true)
  }));
});

// Mocker fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn()
}));

describe('Image Processing Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resizeImage', () => {
    it('devrait redimensionner une image et retourner le chemin', async () => {
      // Créer un faux fichier multer
      const mockFile = {
        path: '/tmp/upload/temp-12345.jpg',
        originalname: 'test-image.jpg'
      };

      // Appeler la fonction
      const result = await resizeImage(mockFile, 'uploads/test', {
        width: 300,
        height: 200,
        quality: 90
      });

      // Vérifier que les fonctions ont été appelées
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFile.path);
      
      // Vérifier que le résultat est une chaîne de caractères commençant par le bon chemin
      expect(result).toMatch(/^\/uploads\/test\//);
      // Vérifier que le nom de fichier a l'extension correcte
      expect(result).toMatch(/\.jpg$/);
    });

    it('devrait utiliser les valeurs par défaut si non spécifiées', async () => {
      // Créer un faux fichier multer
      const mockFile = {
        path: '/tmp/upload/temp-67890.jpg',
        originalname: 'another-image.jpg'
      };

      // Appeler la fonction sans options
      const result = await resizeImage(mockFile, 'uploads/test');

      // Vérifier le résultat
      expect(result).toMatch(/^\/uploads\/test\//);
    });
  });

  describe('createImageVariants', () => {
    it('devrait créer plusieurs variantes d\'une image', async () => {
      // Créer un faux fichier multer
      const mockFile = {
        path: '/tmp/upload/temp-54321.jpg',
        originalname: 'product-image.jpg'
      };

      // Appeler la fonction
      const variants = await createImageVariants(mockFile, 'uploads/products');

      // Vérifier que les variantes ont été créées
      expect(variants).toHaveProperty('thumbnail');
      expect(variants).toHaveProperty('small');
      expect(variants).toHaveProperty('medium');
      expect(variants).toHaveProperty('large');

      // Vérifier que les chemins sont corrects
      expect(variants.thumbnail).toMatch(/^\/uploads\/products\//);
      expect(variants.small).toMatch(/^\/uploads\/products\//);
      expect(variants.medium).toMatch(/^\/uploads\/products\//);
      expect(variants.large).toMatch(/^\/uploads\/products\//);

      // Vérifier que le fichier temporaire a été supprimé
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFile.path);
    });
  });
}); 