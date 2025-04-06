const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Définir le répertoire d'upload
const uploadsDir = path.join(__dirname, '../../public/uploads');

// Configurer le stockage multer avec des fichiers temporaires
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Créer le dossier de destination s'il n'existe pas
    const tenantId = req.tenantId || 'common';
    const uploadPath = path.join(uploadsDir, tenantId, 'temp');
    
    // Créer les dossiers récursivement s'ils n'existent pas
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique avec l'extension d'origine et préfixe temp_
    const uniqueFilename = `temp_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Traiter et compresser l'image
const processImage = async (file) => {
    const tenantId = file.req && file.req.tenantId ? file.req.tenantId : 'common';
    const finalFilename = file.filename.replace('temp_', 'compressed_');
    const outputPath = path.join(uploadsDir, tenantId, finalFilename);

    try {
        let image = sharp(file.path);
        const metadata = await image.metadata();

        // Redimensionner si l'image est très grande (par exemple max 1280px de large)
        if (metadata.width > 1280) {
            image = image.resize(1280, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }

        // On compresse selon le format
        switch (metadata.format) {
            case 'jpeg':
                image = image.jpeg({
                    quality: 50,
                    mozjpeg: true,
                    chromaSubsampling: '4:2:0'
                });
                break;
            case 'png':
                image = image.webp({   // Conversion en WebP
                    quality: 50
                });
                break;
            case 'webp':
                image = image.webp({
                    quality: 50
                });
                break;
            default:
                // Pour tous les autres formats, on peut tenter le WebP
                image = image.webp({
                    quality: 50
                });
                break;
        }

        await image.toFile(outputPath);

        // Supprimer le fichier temporaire
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        return finalFilename;
    } catch (error) {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        throw error;
    }
};

// Filtrer les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non pris en charge. Seules les images (JPEG, PNG, GIF, WEBP) sont autorisées.'), false);
  }
};

// Configurer multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter
});

module.exports = {
    upload,
    processImage
}; 