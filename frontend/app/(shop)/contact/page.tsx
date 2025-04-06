"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Globe, MessageSquare, Clock, Smartphone, Send, Star, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé !",
      description: "Nous vous contacterons dans les plus brefs délais.",
    });
    setFormData({ name: "", email: "", subject: "", message: "", phone: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/22797977199?text=Bonjour, je vous contacte depuis votre site web. J\'aimerais discuter d\'un projet.', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12 pt-20">
          <div className="flex justify-center mb-6">
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80" 
              alt="Digital Innovation"
              className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500 hover:shadow-red-500/20 w-80 h-auto"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gray-800">
            Contactez-<span className="text-red-600">Nous</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une question ou un projet à discuter ? Notre équipe est à votre écoute et prête à vous accompagner dans vos défis numériques.
          </p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl border border-gray-100 shadow-md">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-800">Expertise Locale</h3>
            <p className="text-sm text-gray-600">
              Des solutions adaptées au contexte nigérien, développées par une équipe qui comprend vos besoins spécifiques.
            </p>
          </div>
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl border border-gray-100 shadow-md">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-800">Qualité Garantie</h3>
            <p className="text-sm text-gray-600">
              Nous nous engageons à offrir des solutions de haute qualité qui répondent aux standards internationaux.
            </p>
          </div>
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl border border-gray-100 shadow-md">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-800">Support Rapide</h3>
            <p className="text-sm text-gray-600">
              Une équipe réactive disponible pour vous accompagner et répondre à toutes vos questions.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Informations de Contact */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-100 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-800">Nous Contacter</CardTitle>
                <CardDescription className="text-gray-600">
                  Plusieurs moyens pour nous joindre
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-gray-700">
                    Quartier Plateau, Avenue du Commerce
                    <br />
                    Niamey, Niger
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-gray-700">+227 9797 7199</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-gray-700">contact@nigerdev.com</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-gray-700">www.nigerdev.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-800">Horaires de Travail</CardTitle>
                <CardDescription className="text-gray-600">
                  Nous sommes là pour vous servir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-gray-700">Lundi - Vendredi</span>
                    </div>
                    <span className="text-sm text-gray-700">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-gray-700">Samedi</span>
                    </div>
                    <span className="text-sm text-gray-700">9:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-gray-700">Dimanche</span>
                    </div>
                    <span className="text-sm text-gray-700">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 bg-red-50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-gray-800">
                  <Smartphone className="h-5 w-5 mr-2 text-red-600" /> 
                  Contact Rapide
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Discutons directement via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 text-gray-700">
                  Pour une réponse immédiate, contactez-nous sur WhatsApp. Notre équipe est disponible pour répondre à vos questions.
                </p>
                <Button onClick={openWhatsApp} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md">
                  <Smartphone className="mr-2 h-4 w-4" /> Discuter sur WhatsApp
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-md">
              <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Besoin d'une assistance urgente ?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pour les demandes urgentes, appelez-nous directement ou envoyez un message WhatsApp.
              </p>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => window.open('tel:+22797977199', '_blank')} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                  <Phone className="mr-2 h-4 w-4" /> Appeler
                </Button>
                <Button variant="outline" size="sm" onClick={openWhatsApp} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                  <Smartphone className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Formulaire de Contact */}
          <Card className="lg:col-span-2 border-gray-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-800">Envoyez-nous un Message</CardTitle>
              <CardDescription className="text-gray-600">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom complet"
                      className="border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="votre@email.com"
                      className="border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+227 XX XX XX XX"
                      className="border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Sujet
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Sujet de votre message"
                      className="border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Décrivez votre projet ou votre demande..."
                    className="min-h-[150px] border-gray-200 focus:border-red-300 focus:ring-red-200"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md">
                  <Send className="mr-2 h-4 w-4" /> Envoyer votre Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Google Maps */}
        <div className="mt-16 rounded-xl overflow-hidden border border-primary/20 h-80">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62388.915041832906!2d2.0737073!3d13.513241799999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11d0754a8999ea61%3A0xf31f2ecb30404359!2sNiamey%2C%20Niger!5e0!3m2!1sfr!2s!4v1710141512039!5m2!1sfr!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

      </div>
    </div>
  );
}