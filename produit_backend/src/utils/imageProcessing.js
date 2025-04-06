const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Redimensionne et optimise une image téléchargée
 * @param {Object} file - Fichier multer
 * @param {String} destFolder - Dossier de destination (chemin relatif)
 * @param {Object} options - Options de redimensionnement
 * @param {Number} options.width - Largeur en pixels
 * @param {Number} options.height - Hauteur en pixels (optionnelle, maintient le ratio si non spécifiée)
 * @param {Number} options.quality - Qualité de compression (1-100)
 * @param {Boolean} options.fit - Mode de redimensionnement (cover, contain, fill, inside, outside)
 * @returns {Promise<String>} - Chemin relatif vers l'image transformée
 */
exports.resizeImage = async (file, destFolder, options = {}) => {
  try {
    // Valeurs par défaut
    const width = options.width || 800;
    const height = options.height || null;
    const quality = options.quality || 80;
    const fit = options.fit || 'cover';
    
    // Créer le dossier de destination s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', destFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const outputPath = path.join(uploadDir, filename);
    
    const resizeOptions = {
      width,
      fit
    };
    
    if (height) {
      resizeOptions.height = height;
    }
    
    // Redimensionner et optimiser l'image
    await sharp(file.path)
      .resize(resizeOptions)
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(file.path);
    
    // Retourner le chemin relatif pour le stockage en base de données
    return `/${destFolder}/${filename}`;
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    throw error;
  }
};

/**
 * Redimensionne et crée plusieurs variantes d'une image
 * @param {Object} file - Fichier multer
 * @param {String} destFolder - Dossier de destination (chemin relatif)
 * @returns {Promise<Object>} - Chemins vers les différentes variantes
 */
exports.createImageVariants = async (file, destFolder) => {
  try {
    // Créer un identifiant unique pour toutes les variantes
    const uniqueId = uuidv4();
    
    // Créer le dossier de destination s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', destFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Définir les variantes à générer
    const variants = {
      thumbnail: { width: 150, height: 150, fit: 'cover', quality: 80 },
      small: { width: 300, height: null, fit: 'inside', quality: 80 },
      medium: { width: 600, height: null, fit: 'inside', quality: 80 },
      large: { width: 1200, height: null, fit: 'inside', quality: 90 }
    };
    
    // Objet pour stocker les URLs des variantes
    const urls = {};
    
    // Traiter chaque variante
    for (const [variant, options] of Object.entries(variants)) {
      const filename = `${uniqueId}-${variant}${path.extname(file.originalname)}`;
      const outputPath = path.join(uploadDir, filename);
      
      const resizeOptions = {
        width: options.width,
        fit: options.fit
      };
      
      if (options.height) {
        resizeOptions.height = options.height;
      }
      
      // Redimensionner et optimiser l'image
      await sharp(file.path)
        .resize(resizeOptions)
        .jpeg({ quality: options.quality, progressive: true })
        .toFile(outputPath);
      
      urls[variant] = `/${destFolder}/${filename}`;
    }
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(file.path);
    
    return urls;
  } catch (error) {
    console.error('Erreur lors de la génération des variantes d\'image:', error);
    throw error;
  }
}; 