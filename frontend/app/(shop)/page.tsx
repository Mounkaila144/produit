"use client";

import { useState } from "react";
import { products, categories } from "@/lib/data";
import { FeaturedProducts } from "@/components/featured-products";
import { SearchFilter } from "@/components/search-filter";
import { CategoryFilter } from "@/components/category-filter";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CheckIcon, Code, PenTool, GlobeIcon, PhoneIcon, MessageSquare } from "lucide-react";
import { Category } from "@/lib/types";
import Image from "next/image";
import Hero from "@/components/new/Hero";
import WhyChooseUs from "@/components/new/WhyChooseUs";
import Testimonials from "@/components/new/Testimonials";
import Services from "@/components/new/Services";

// Composant pour un plan d'abonnement
const PricingCard = ({ 
  title, 
  price, 
  features, 
  description, 
  popular = false,
  cta = "Nous contacter"
}: { 
  title: string; 
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta?: string;
}) => {
  const handleContactClick = () => {
    window.open(`https://wa.me/22797977199?text=Je suis intéressé par le forfait ${title} à ${price} proposé par NigerDev. Pouvez-vous me donner plus d'informations ?`, '_blank');
  };

  return (
    <div className={`relative rounded-2xl border ${popular ? "border-primary bg-primary/5 shadow-lg" : "border-border"} p-6 flex flex-col justify-between h-full`}>
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <div className="bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">
            Recommandé
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-baseline">
          <span className={`text-3xl font-bold ${popular ? "text-primary" : ""}`}>{price}</span>
          {price !== "Gratuit" && <span className="ml-1 text-muted-foreground">/mois</span>}
        </div>
        <ul className="mt-6 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex">
              <CheckIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="ml-3 text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button className="mt-8 w-full" variant={popular ? "default" : "outline"} onClick={handleContactClick}>
        {cta}
      </Button>
    </div>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Données pour les plans d'abonnement
  const pricingPlans = [
    {
      title: "Découverte",
      price: "Gratuit",
      description: "Première consultation sans engagement pour découvrir vos besoins",
      features: [
        "Évaluation de votre projet",
        "Conseils stratégiques",
        "Estimation de budget",
        "Support par WhatsApp"
      ],
      cta: "Discuter de mon projet"
    },
    {
      title: "Site Vitrine",
      price: "150 000 FCFA",
      description: "Site web professionnel pour présenter votre activité",
      features: [
        "Design personnalisé",
        "Site responsive",
        "Formulaire de contact",
        "Hébergement inclus (1 an)"
      ],
      popular: false
    },
    {
      title: "E-Commerce",
      price: "450 000 FCFA",
      description: "Boutique en ligne complète pour vendre vos produits",
      features: [
        "Catalogue de produits",
        "Système de paiement",
        "Gestion des commandes",
        "Support prioritaire"
      ],
      popular: true
    },
    {
      title: "Sur Mesure",
      price: "Sur devis",
      description: "Solutions personnalisées pour vos besoins spécifiques",
      features: [
        "Développement sur mesure",
        "Application web ou mobile",
        "Intégration API complexe",
        "Accompagnement complet"
      ],
      popular: false
    }
  ];

  return (
    <>
      <Hero />
      <Services />
      
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">        
 
          <WhyChooseUs />
          <Testimonials />

        </div>
      </div>
    </>
  );
}