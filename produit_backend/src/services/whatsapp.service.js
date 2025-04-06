const axios = require('axios');

/**
 * Service pour envoyer des notifications WhatsApp
 */
exports.sendWhatsAppMessage = async (options) => {
  try {
    const { phoneNumber, message } = options;
    
    // Vérifier que le numéro de téléphone est au format correct (avec indicatif pays)
    if (!phoneNumber || !phoneNumber.match(/^\+[0-9]{10,15}$/)) {
      console.error('Numéro de téléphone invalide:', phoneNumber);
      throw new Error('Format de numéro de téléphone invalide. Utilisez le format +XXXXXXXXXXXXX');
    }
    
    console.log(`[WHATSAPP] Envoi de message à ${phoneNumber}: ${message}`);
    
    // En environnement de développement, juste logger le message
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        message: 'Message simulé en environnement de développement',
        to: phoneNumber,
        content: message
      };
    }
    
    // En production, utiliser l'API WhatsApp Business
    // Remplacer cette partie par l'intégration réelle de l'API WhatsApp Business
    // Voici un exemple avec axios pour l'API de WhatsApp Business
    
    /*
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
    */
    
    // Pour le moment, simulons une réponse réussie
    return {
      success: true,
      message: 'Message envoyé avec succès (simulation)',
      to: phoneNumber,
      content: message
    };
  } catch (error) {
    console.error('Erreur d\'envoi de message WhatsApp:', error);
    throw error;
  }
}; 