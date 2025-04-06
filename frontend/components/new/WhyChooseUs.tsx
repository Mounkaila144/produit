"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhyChooseUs() {
  const features = [
    {
      title: "Expertise Locale",
      description:
        "Notre équipe comprend les spécificités du marché nigérien et vous propose des solutions adaptées à votre contexte.",
      image: "/images/why-choose-us/expertise.svg",
    },
    {
      title: "Support Continu",
      description:
        "Au-delà du développement, nous vous accompagnons avec un support technique réactif et des conseils personnalisés.",
      image: "/images/why-choose-us/support.svg",
    },
    {
      title: "Technologies Modernes",
      description:
        "Nous utilisons les dernières technologies pour vous garantir des solutions performantes, évolutives et sécurisées.",
      image: "/images/why-choose-us/technology.svg",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Pourquoi <span className="text-red-600">Nous Choisir</span> ?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Des solutions digitales sur mesure développées par des experts du web, pour répondre aux besoins spécifiques des entreprises nigériennes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white border-gray-100 shadow-md overflow-hidden transform transition-transform hover:scale-105">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 p-4 bg-red-50 rounded-full mb-6 flex items-center justify-center">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={60}
                    height={60}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Prêt à transformer votre présence digitale ?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Contactez-nous dès aujourd'hui pour discuter de votre projet et découvrir comment nous pouvons vous aider à atteindre vos objectifs.
          </p>
          <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700 text-white shadow-md"
            onClick={() => window.location.href = '/contact'}
          >
            Démarrer votre projet <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}