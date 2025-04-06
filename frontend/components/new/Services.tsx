"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

export default function Services() {
  const services = [
    {
      title: "Développement Web",
      description:
        "Des sites web modernes, rapides et sécurisés adaptés à tous vos besoins.",
      image: "/images/services/web.svg",
      features: [
        "Sites vitrines professionnels",
        "Plateformes e-commerce",
        "Applications web sur mesure",
        "Intégration de systèmes de paiement locaux"
      ]
    },
    {
      title: "Applications Mobiles",
      description:
        "Des applications natives et hybrides optimisées pour le marché africain.",
      image: "/images/services/mobile.svg",
      features: [
        "Applications iOS et Android",
        "Solutions adaptées aux réseaux locaux",
        "Intégration avec Mobile Money",
        "Expérience utilisateur optimisée"
      ]
    },
    {
      title: "Commerce Électronique",
      description:
        "Lancez votre boutique en ligne avec des solutions adaptées au marché nigérien.",
      image: "/images/services/ecommerce.svg",
      features: [
        "Boutiques en ligne personnalisées",
        "Systèmes de paiement sécurisés",
        "Gestion d'inventaire simplifiée",
        "Intégration avec les fournisseurs locaux"
      ]
    },
    {
      title: "Design UI/UX",
      description:
        "Des interfaces utilisateur intuitives et esthétiques qui offrent une expérience exceptionnelle.",
      image: "/images/services/design.svg",
      features: [
        "Design responsive moderne",
        "Expérience utilisateur optimisée",
        "Identité visuelle cohérente",
        "Prototypage et tests utilisateurs"
      ]
    }
  ];

  return (
    <section className="py-16 bg-white text-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nos <span className="text-red-600">Services</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Des solutions digitales sur mesure pour répondre aux besoins spécifiques des entreprises nigériennes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-white border-gray-100 shadow-md overflow-hidden h-full flex flex-col">
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={50}
                    height={50}
                    className="h-8 w-8"
                  />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center mb-5">
                  {service.description}
                </p>
                <div className="mt-auto">
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center">
                        <Check className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => window.location.href = '/contact'}
                  >
                    En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}