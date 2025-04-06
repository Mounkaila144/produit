"use client";

import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, ArrowRight, Monitor, Code, Smartphone, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 via-white to-white text-gray-800 pt-20 pb-10 overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-100/40 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center mb-6">
              <div className="relative bg-white rounded-xl p-3 backdrop-blur-sm border border-gray-100 shadow-md">
                <Image 
                  src="/images/logo.png" 
                  alt="NigerDev Logo" 
                  width={140} 
                  height={45} 
                  className="h-auto"
                />
              </div>
            </Link>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Solutions digitales innovantes adaptées aux réalités nigériennes. Du site web à l'application mobile, nous donnons vie à vos projets numériques avec excellence et créativité.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-300 shadow-sm border border-gray-100 hover:border-red-200 group">
                <Facebook className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-300 shadow-sm border border-gray-100 hover:border-red-200 group">
                <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-300 shadow-sm border border-gray-100 hover:border-red-200 group">
                <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 md:mt-0 mt-6">
            <h4 className="text-base font-bold mb-6 relative inline-block text-gray-800">
              <span className="relative z-10">Services</span>
              <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-center group">
                  <Monitor className="h-4 w-4 text-red-500 mr-3 group-hover:translate-x-1 transition-transform" />
                  <span className="text-gray-600 group-hover:text-red-600 transition-colors">Développement Web</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center group">
                  <Smartphone className="h-4 w-4 text-red-500 mr-3 group-hover:translate-x-1 transition-transform" />
                  <span className="text-gray-600 group-hover:text-red-600 transition-colors">Applications Mobiles</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center group">
                  <Code className="h-4 w-4 text-red-500 mr-3 group-hover:translate-x-1 transition-transform" />
                  <span className="text-gray-600 group-hover:text-red-600 transition-colors">Intégration API</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-base font-bold mb-6 relative inline-block text-gray-800">
              <span className="relative z-10">Liens Utiles</span>
              <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                  <span>Accueil</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                  <span>À Propos</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-base font-bold mb-6 relative inline-block text-gray-800">
              <span className="relative z-10">Contact</span>
              <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></span>
            </h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-center group p-3 rounded-lg hover:bg-red-50/50 transition-colors backdrop-blur-sm border border-transparent hover:border-red-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                  <Phone className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">+227 9797 7199</span>
              </li>
              <li className="flex items-center group p-3 rounded-lg hover:bg-red-50/50 transition-colors backdrop-blur-sm border border-transparent hover:border-red-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                  <Mail className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">contact@nigerdev.com</span>
              </li>
              <li className="flex items-center group p-3 rounded-lg hover:bg-red-50/50 transition-colors backdrop-blur-sm border border-transparent hover:border-red-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                  <MapPin className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Niamey, Niger</span>
              </li>
            </ul>
            <Button 
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full w-full py-6 shadow-md shadow-red-900/20 border border-red-500/20 transition-all hover:shadow-lg hover:shadow-red-900/30"
              onClick={() => window.location.href = '/contact'}
            >
              Discutons de votre projet <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} NigerDev. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}