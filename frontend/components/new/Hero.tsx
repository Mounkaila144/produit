"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Développement Web & Mobile pour le{" "}
              <span className="text-red-600">Niger</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-xl">
              Nous créons des solutions digitales innovantes et adaptées aux
              réalités nigériennes. Du site web à l'application mobile, nous
              donnons vie à vos projets numériques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                onClick={() => window.location.href = '/contact'}
              >
                Démarrer votre projet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-100"
                onClick={() => window.location.href = '/about'}
              >
                En savoir plus
              </Button>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-600">
              <div className="w-12 h-1 bg-red-600 mr-4"></div>
              Votre partenaire digital de confiance au Niger depuis 2021
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-red-100 rounded-full blur-3xl"></div>
              <Image
                src="/images/hero-image.svg"
                alt="NigerDev - Développement Web & Mobile"
                width={600}
                height={400}
                className="relative z-10"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}