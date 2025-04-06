'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Pour déboguer, récupérer le tenant ID
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('adminTenantId') || localStorage.getItem('tenantId');
      console.log('Upload avec tenant:', tenantId);
      
      // Appel à l'API d'upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'X-Tenant-ID': tenantId || 'tenant1' // Utiliser un tenant par défaut pour les tests
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }
      
      const data = await response.json();
      onChange(data.url);
      
      toast({
        title: 'Succès',
        description: 'L\'image a été téléchargée avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-[200px] h-[200px]">
          <img
            src={value}
            alt="Image"
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+non+disponible';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-[200px] h-[200px] border-2 border-dashed rounded-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mt-2 text-sm text-muted-foreground">
                Téléchargement...
              </span>
            </div>
          ) : (
            <>
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">
                  Cliquez pour uploader
                </span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={isLoading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
} 