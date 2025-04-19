import { apiService } from "@/services/api";

const uploadService = {
  /**
   * Upload un fichier unique
   * @param file - Le fichier à uploader
   * @param tenantId - ID du tenant
   * @returns - Réponse avec les informations du fichier uploadé
   */
  uploadSingleFile: async (file: File, tenantId: string) => {
    try {
      console.log(`Upload avec tenant: ${tenantId}`);
      
      // Enregistrer temporairement le tenantId dans localStorage pour les futurs appels
      if (typeof window !== 'undefined' && tenantId) {
        // Si nous sommes sur une page admin, sauvegarder comme adminTenantId
        if (window.location.pathname.startsWith('/admin/')) {
          localStorage.setItem('adminTenantId', tenantId);
        } else {
          localStorage.setItem('tenantId', tenantId);
        }
      }
      
      const formData = new FormData();
      formData.append('file', file);

      // Récupérer le token depuis localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await apiService.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Tenant-ID': tenantId,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      return response;
    } catch (error: any) {
      console.error('Erreur backend:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de l\'upload du fichier' };
    }
  },

  /**
   * Upload plusieurs fichiers
   * @param files - Les fichiers à uploader
   * @param tenantId - ID du tenant
   * @returns - Réponse avec les informations des fichiers uploadés
   */
  uploadMultipleFiles: async (files: File[], tenantId: string) => {
    try {
      // Enregistrer temporairement le tenantId dans localStorage pour les futurs appels
      if (typeof window !== 'undefined' && tenantId) {
        // Si nous sommes sur une page admin, sauvegarder comme adminTenantId
        if (window.location.pathname.startsWith('/admin/')) {
          localStorage.setItem('adminTenantId', tenantId);
        } else {
          localStorage.setItem('tenantId', tenantId);
        }
      }
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Récupérer le token depuis localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await apiService.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Tenant-ID': tenantId,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      return response;
    } catch (error: any) {
      console.error('Erreur backend:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erreur lors de l\'upload des fichiers' };
    }
  }
};

export default uploadService; 