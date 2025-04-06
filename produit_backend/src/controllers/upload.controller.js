const path = require('path');
const { processImage } = require('../middleware/upload.middleware');

/**
 * Gestionnaire pour l'upload d'un fichier unique
 */
exports.uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    // Ajouter l'objet req dans le fichier pour récupérer le tenantId plus tard
    req.file.req = req;
    
    // Traiter et compresser l'image
    const finalFilename = await processImage(req.file);
    
    // Générer l'URL complète du fichier
    const tenantId = req.tenantId || 'common';
    const fileUrl = `/uploads/${tenantId}/${finalFilename}`;

    return res.status(200).json({
      message: 'Fichier uploadé avec succès',
      file: {
        filename: finalFilename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier', error: error.message });
  }
};

/**
 * Gestionnaire pour l'upload de plusieurs fichiers
 */
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const tenantId = req.tenantId || 'common';
    const uploadedFiles = [];
    
    // Traiter chaque image
    for (const file of req.files) {
      // Ajouter l'objet req dans le fichier pour récupérer le tenantId plus tard
      file.req = req;
      
      const finalFilename = await processImage(file);
      uploadedFiles.push({
        filename: finalFilename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${tenantId}/${finalFilename}`
      });
    }

    return res.status(200).json({
      message: `${req.files.length} fichiers uploadés avec succès`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload des fichiers', error: error.message });
  }
}; 