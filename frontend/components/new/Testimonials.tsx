"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Marie Bangoura",
      role: "Directrice Marketing, Entreprise XYZ",
      content:
        "NigerDev a transformé notre présence en ligne. Leur approche professionnelle et leur expertise technique ont fait toute la différence dans notre stratégie digitale.",
      rating: 5,
      image: "/images/testimonials/user1.svg",
    },
    {
      name: "Abdou Kader",
      role: "Fondateur, Startup ABC",
      content:
        "Je recommande vivement NigerDev pour leur travail exceptionnel sur notre application mobile. Ils ont su comprendre nos besoins et livrer un produit qui dépasse nos attentes.",
      rating: 5,
      image: "/images/testimonials/user2.svg",
    },
    {
      name: "Fatima Ibrahim",
      role: "Responsable IT, Organisation Internationale",
      content:
        "Nous avons fait appel à NigerDev pour développer notre plateforme de gestion interne. Leur expertise technique et leur réactivité ont été cruciales pour le succès du projet.",
      rating: 4,
      image: "/images/testimonials/user3.svg",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ce que <span className="text-red-600">disent</span> nos clients
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez pourquoi nos clients nous font confiance pour leurs projets digitaux.
          </p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="border-gray-100 bg-white shadow-md h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-red-100">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {testimonial.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "text-red-600 fill-red-600"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8 gap-2">
            <CarouselPrevious className="relative inset-0 translate-x-0 bg-red-600 hover:bg-red-700 text-white" />
            <CarouselNext className="relative inset-0 translate-x-0 bg-red-600 hover:bg-red-700 text-white" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}