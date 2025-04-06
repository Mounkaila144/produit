"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Users, Award, Globe, CheckCircle, Zap, Shield, Coffee } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Section Hero */}
          <div className="text-center pt-20">
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/logo.png" 
                alt="NigerDev Logo" 
                width={150} 
                height={60} 
                className="h-auto"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gray-800">À Propos de NigerDev</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pionniers du développement web et mobile au Niger, nous créons des solutions digitales innovantes adaptées aux réalités africaines depuis 2021.
            </p>
          </div>

          {/* Section Notre Histoire */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square bg-gradient-to-br from-red-100 to-white rounded-lg flex items-center justify-center shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80" 
                alt="Digital Innovation"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500 hover:shadow-red-500/20 w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Notre Histoire</h2>
              <p className="text-gray-600">
                Fondée en 2021, NigerDev est née de la passion de jeunes développeurs nigériens déterminés à contribuer au développement numérique de leur pays. Face au manque de solutions adaptées au contexte local, nous avons décidé de mettre notre expertise au service des entreprises et organisations nigériennes.
              </p>
              <p className="text-gray-600">
                Notre équipe combine des compétences techniques de pointe et une connaissance approfondie du marché local. Nous travaillons en étroite collaboration avec nos clients pour comprendre leurs besoins spécifiques et leur proposer des solutions sur mesure qui répondent aux défis du marché nigérien.
              </p>
              <div className="pt-4">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-md mr-4"
                  onClick={() => window.open('https://wa.me/22797977199?text=Bonjour, je voudrais en savoir plus sur NigerDev après avoir lu votre histoire.', '_blank')}
                >
                  Contactez-nous
                </Button>
                <Button 
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  onClick={() => window.location.href = '/contact'}
                >
                  En savoir plus
                </Button>
              </div>
            </div>
          </div>

          {/* Section Nos Valeurs */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Nos Valeurs <span className="text-red-600">Fondamentales</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-gray-100 bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Qualité</h3>
                  <p className="text-gray-600">
                    Nous nous engageons à fournir des solutions de haute qualité, robustes et durables qui répondent aux standards internationaux.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-100 bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Innovation Locale</h3>
                  <p className="text-gray-600">
                    Nous créons des solutions adaptées aux réalités nigériennes tout en intégrant les technologies les plus récentes.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-100 bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Satisfaction Client</h3>
                  <p className="text-gray-600">
                    La réussite de nos clients est notre priorité absolue. Nous offrons un accompagnement personnalisé à chaque étape.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-100 bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Confiance</h3>
                  <p className="text-gray-600">
                    Nous bâtissons des relations durables basées sur la transparence, l'intégrité et un engagement sans faille envers nos clients.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section Notre Expertise */}
          <div className="bg-gray-50 rounded-3xl p-8 shadow-inner">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Notre <span className="text-red-600">Expertise</span></h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Développement Web</h3>
                  <p className="text-gray-600">
                    Sites vitrines, e-commerce, applications web complexes, intranets et plateformes sur mesure adaptés aux besoins spécifiques des entreprises nigériennes.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Applications Mobiles</h3>
                  <p className="text-gray-600">
                    Applications iOS et Android innovantes, optimisées pour les conditions réseau locales et conçues pour répondre aux défis spécifiques du marché nigérien.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Code className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Intégration API</h3>
                  <p className="text-gray-600">
                    Solutions d'intégration avec les systèmes de paiement mobiles, les services gouvernementaux et d'autres plateformes essentielles dans le contexte nigérien.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Conseil Digital</h3>
                  <p className="text-gray-600">
                    Accompagnement stratégique pour votre transformation numérique, optimisation de vos processus et formation de vos équipes aux nouvelles technologies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Notre Processus */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Notre <span className="text-red-600">Processus</span></h2>
            <div className="grid sm:grid-cols-3 gap-8 mt-10">
              <div className="relative">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative shadow-md">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-red-200 -z-10 hidden sm:block"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Consultation</h3>
                <p className="text-gray-600">
                  Nous analysons vos besoins et définissons ensemble les objectifs et le périmètre de votre projet digital.
                </p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative shadow-md">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-red-200 -z-10 hidden sm:block"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Développement</h3>
                <p className="text-gray-600">
                  Notre équipe d'experts conçoit et développe votre solution en utilisant les technologies les plus adaptées.
                </p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Lancement & Support</h3>
                <p className="text-gray-600">
                  Nous vous accompagnons dans le déploiement de votre solution et restons à vos côtés pour la faire évoluer.
                </p>
              </div>
            </div>
          </div>

          {/* Section Notre Équipe */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12 text-gray-800">Notre <span className="text-red-600">Équipe</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Amadou Ibrahim",
                  role: "Fondateur & Développeur en Chef",
                  image: "/images/logo.png"
                },
                {
                  name: "Mariama Sow",
                  role: "Designer UI/UX",
                  image: "/images/logo.png"
                },
                {
                  name: "Moussa Issoufou",
                  role: "Développeur Full Stack",
                  image: "/images/logo.png"
                }
              ].map((member) => (
                <div key={member.name} className="text-center bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                  <div className="relative w-24 h-24 mx-auto mb-4 bg-red-50 rounded-full p-1">
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section CTA */}
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Prêt à Digitaliser <span className="text-red-600">Votre Entreprise</span> ?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Contactez-nous dès aujourd'hui pour discuter de votre projet et découvrir comment NigerDev peut vous aider à atteindre vos objectifs dans l'ère numérique.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => window.open('https://wa.me/22797977199?text=Bonjour, je souhaite discuter d\'un projet après avoir consulté votre page À propos.', '_blank')}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md px-8"
              >
                Démarrer Votre Projet
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/contact'}
                className="text-gray-700 border-gray-300 hover:bg-gray-100 px-8"
              >
                Nous Contacter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}