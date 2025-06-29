const { Product } = require('./produit_backend/src/models');
const fs = require('fs');
const path = require('path');

async function fixImagesInDatabase() {
  try {
    console.log('=== CORRECTION DES IMAGES DANS LA BASE DE DONNÉES ===');
    
    // Récupérer tous les produits
    const products = await Product.findAll();
    
    console.log(`Trouvé ${products.length} produits à vérifier...`);
    
    for (const product of products) {
      console.log(`\n--- Traitement du produit: ${product.name} ---`);
      console.log('Images actuelles:', product.images);
      
      let currentImages = product.images;
      
      // Si les images sont une string JSON, les parser
      if (typeof currentImages === 'string') {
        try {
          currentImages = JSON.parse(currentImages);
        } catch (error) {
          console.log('Erreur parsing JSON:', error.message);
          currentImages = [];
        }
      }
      
      // Si ce n'est pas un array, créer un array vide
      if (!Array.isArray(currentImages)) {
        currentImages = [];
      }
      
      // Chercher des images existantes dans le dossier uploads
      const uploadsPath = path.join(__dirname, 'produit_backend', 'public', 'uploads');
      console.log('Recherche dans:', uploadsPath);
      
      let foundImages = [];
      
      if (fs.existsSync(uploadsPath)) {
        // Parcourir tous les dossiers UUID dans uploads
        const uploadFolders = fs.readdirSync(uploadsPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        for (const folder of uploadFolders) {
          const folderPath = path.join(uploadsPath, folder);
          
          try {
            const files = fs.readdirSync(folderPath);
            
            // Chercher des fichiers image compressés
            const imageFiles = files.filter(file => 
              file.startsWith('compressed_') && 
              (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.webp'))
            );
            
            if (imageFiles.length > 0) {
              console.log(`Trouvé ${imageFiles.length} images dans ${folder}`);
              
              // Ajouter les images trouvées (prendre seulement la première pour l'instant)
              const firstImage = imageFiles[0];
              const imageUrl = `/uploads/${folder}/${firstImage}`;
              foundImages.push(imageUrl);
              
              console.log('Image ajoutée:', imageUrl);
              break; // Prendre seulement le premier dossier avec des images
            }
          } catch (error) {
            console.log(`Erreur lors de la lecture du dossier ${folder}:`, error.message);
          }
        }
      }
      
      // Si on a trouvé des images, mettre à jour le produit
      if (foundImages.length > 0) {
        console.log(`Mise à jour du produit ${product.name} avec ${foundImages.length} images`);
        
        await product.update({
          images: foundImages
        });
        
        console.log('✅ Produit mis à jour avec succès');
      } else {
        console.log(`⚠️ Aucune image trouvée pour ${product.name}`);
        
        // Si aucune image trouvée, s'assurer que le champ images est un array vide
        if (currentImages.length === 0 || (currentImages.length > 0 && currentImages[0].includes('/uploads/products/'))) {
          await product.update({
            images: []
          });
          console.log('✅ Images vidées pour ce produit');
        }
      }
    }
    
    console.log('\n=== CORRECTION TERMINÉE ===');
    
  } catch (error) {
    console.error('Erreur lors de la correction:', error);
  }
}

// Alternative: si on connaît des produits spécifiques, on peut les corriger manuellement
async function fixSpecificProduct(productId, imagePaths) {
  try {
    const product = await Product.findByPk(productId);
    if (product) {
      await product.update({ images: imagePaths });
      console.log(`Produit ${product.name} mis à jour avec:`, imagePaths);
    } else {
      console.log('Produit non trouvé');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter le script
if (process.argv[2] === '--specific') {
  // Exemple d'utilisation: node fix-images-db.js --specific
  // Vous pouvez modifier cette partie pour des produits spécifiques
  fixSpecificProduct('product-id-here', ['/uploads/5d58f416-8beb-4db4-9dbb-d4596e901c11/compressed_feb0395b-1671-46a2-bc41-89a4a29935e4.jpeg']);
} else {
  fixImagesInDatabase().then(() => {
    console.log('Script terminé');
    process.exit(0);
  });
} 