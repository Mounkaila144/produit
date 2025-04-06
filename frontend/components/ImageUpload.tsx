import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import uploadService from '@/services/upload';

interface ImageUploadProps {
  onChange: (urls: string[], files?: File[]) => void;
  value: string[];
  maxImages?: number;
  className?: string;
  tenantId?: string;
  tempFiles?: File[];
  instantUpload?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  value = [],
  maxImages = 5,
  className,
  tenantId: propTenantId,
  tempFiles = [],
  instantUpload = false // Par défaut, ne pas uploader instantanément
}) => {
  const { toast } = useToast();
  const session = useSession().data;
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempLocalFiles, setTempLocalFiles] = useState<File[]>(tempFiles);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    if (value.length + files.length > maxImages) {
      toast({
        title: "Limite d'images atteinte",
        description: `Vous ne pouvez pas uploader plus de ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }
    
    // Si upload instantané est activé, télécharger maintenant
    if (instantUpload) {
      setIsUploading(true);
      
      try {
        // Utiliser plusieurs sources pour le tenant ID
        const sessionTenantId = session?.user?.tenantId;
        const localStorageTenantId = typeof window !== 'undefined' ? 
          localStorage.getItem('tenantId') || localStorage.getItem('adminTenantId') : null;
        
        // Ordre de priorité: prop > session > localStorage
        const effectiveTenantId = propTenantId || sessionTenantId || localStorageTenantId;
        
        console.log("Upload avec tenant ID:", {
          propTenantId,
          sessionTenantId,
          localStorageTenantId,
          effectiveTenantId
        });
        
        if (!effectiveTenantId) {
          throw new Error("Tenant ID non trouvé. Veuillez vous connecter à nouveau ou recharger la page.");
        }
        
        const uploadPromises = Array.from(files).map(async (file) => {
          const result = await uploadService.uploadSingleFile(file, effectiveTenantId);
          return result.file.url;
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        
        onChange([...value, ...uploadedUrls]);
        
        toast({
          title: "Upload réussi",
          description: `${uploadedUrls.length} image(s) uploadée(s) avec succès`,
        });
      } catch (error: any) {
        console.error("Erreur d'upload:", error);
        toast({
          title: "Erreur d'upload",
          description: error.message || "Une erreur est survenue lors de l'upload des images",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      // Mode stockage temporaire : ne pas uploader tout de suite
      // Créer des URLs temporaires pour la prévisualisation
      const newTempFiles = Array.from(files);
      const tempUrls = newTempFiles.map(file => URL.createObjectURL(file));
      
      // Mettre à jour l'état local
      setTempLocalFiles(prev => [...prev, ...newTempFiles]);
      
      // Notifier le parent avec les URLs temporaires et les fichiers
      onChange([...value, ...tempUrls], [...tempLocalFiles, ...newTempFiles]);
      
      toast({
        title: "Images ajoutées",
        description: `${newTempFiles.length} image(s) prête(s) à être uploadée(s) lors de l'enregistrement`,
      });
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    // Supprimer l'URL et le fichier temporaire correspondant s'il existe
    const newUrls = value.filter((_, index) => index !== indexToRemove);
    
    // Supprimer le fichier temporaire correspondant si on est en mode stockage local
    let newTempFiles = [...tempLocalFiles];
    if (!instantUpload && indexToRemove < tempLocalFiles.length) {
      newTempFiles = tempLocalFiles.filter((_, index) => index !== indexToRemove);
      setTempLocalFiles(newTempFiles);
    }
    
    // Notifier le parent
    onChange(newUrls, newTempFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
            <Image
              src={url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
            {!instantUpload && index >= value.length - tempLocalFiles.length && (
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-white text-xs py-1 px-2 text-center">
                Non uploadé
              </div>
            )}
          </div>
        ))}
        
        {value.length < maxImages && (
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center aspect-square text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
                <span className="mt-2 text-xs">Chargement...</span>
              </div>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-xs text-center">Ajouter une image</p>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={value.length + 1 < maxImages}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload; 