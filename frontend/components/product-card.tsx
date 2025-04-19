"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTenantPath } from "@/hooks/useTenantPath";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { tenant } = useTenantPath();

  const handleAddToCart = () => {
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  // Construire l'URL du produit en fonction du contexte
  // Si nous sommes dans un contexte de tenant, utiliser le tenant
  const productUrl = tenant 
    ? `/${tenant}/products/${product.id}`
    : `/products/${product.id}`;

  // Déterminer l'URL de l'image de façon sécurisée
  const imageUrl = product.image || 
    (product.images && product.images.length > 0 ? product.images[0] : null) || 
    "https://placehold.co/600x600?text=Pas+d%27image";

  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
      <div className="aspect-square relative overflow-hidden rounded-t-xl">
        <Link href={productUrl}>
          <div className="h-full w-full transform transition-transform duration-500 hover:scale-105">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
      </div>
      <CardHeader className="pt-5 pb-0">
        <CardTitle className="text-lg font-semibold text-gray-800">
          <Link href={productUrl} className="hover:text-purple-600 transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm mt-1 text-gray-500">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3 pb-2">
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          {product.price.toFixed(2)} CFA
        </p>
      </CardContent>
      <CardFooter className="pt-0 pb-5">
        <Button 
          onClick={handleAddToCart} 
          className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 py-5 shadow-md hover:shadow-xl"
        >
          Acheter
        </Button>
      </CardFooter>
    </Card>
  );
}