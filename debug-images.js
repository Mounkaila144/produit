const { Product } = require('./produit_backend/src/models');
const path = require('path');

async function debugImages() {
  try {
    console.log('=== DEBUG: Examen des images dans la base de données ===');
    
    // Récupérer tous les produits avec leurs images
    const products = await Product.findAll({
      attributes: ['id', 'name', 'images'],
      limit: 5
    });
    
    products.forEach((product, index) => {
      console.log(`\n--- Produit ${index + 1}: ${product.name} ---`);
      console.log('ID:', product.id);
      console.log('Images raw:', product.images);
      console.log('Images type:', typeof product.images);
      console.log('Images stringified:', JSON.stringify(product.images, null, 2));
      
      if (Array.isArray(product.images)) {
        console.log('Images array length:', product.images.length);
        product.images.forEach((img, imgIndex) => {
          console.log(`  Image ${imgIndex}:`, img);
          console.log(`  Image ${imgIndex} type:`, typeof img);
        });
      }
    });
    
    console.log('\n=== DEBUG: Examen terminé ===');
    
    // Examiner la structure d'un produit spécifique
    const specificProduct = await Product.findOne({
      where: { name: { [require('sequelize').Op.like]: '%' } }
    });
    
    if (specificProduct) {
      console.log('\n=== Produit spécifique complet ===');
      console.log(JSON.stringify(specificProduct.toJSON(), null, 2));
    }
    
  } catch (error) {
    console.error('Erreur lors du débogage:', error);
  }
}

debugImages().then(() => {
  console.log('Script terminé');
  process.exit(0);
}); 