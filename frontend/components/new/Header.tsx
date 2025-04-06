"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100" 
        : "bg-transparent"
    }`}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative bg-white/90 rounded-full p-1.5 shadow-md">
                <Image 
                  src="/images/logo.png" 
                  alt="NigerDev Logo" 
                  width={100} 
                  height={30} 
                  className="h-auto"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative text-sm font-medium transition-colors group ${
                pathname === '/' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Accueil
              <span className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300 ${
                pathname === '/' ? 'w-full' : ''
              }`}></span>
            </Link>
            <Link 
              href="/about" 
              className={`relative text-sm font-medium transition-colors group ${
                pathname === '/about' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'
              }`}
            >
              À Propos
              <span className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300 ${
                pathname === '/about' ? 'w-full' : ''
              }`}></span>
            </Link>
            <Link 
              href="/contact" 
              className={`relative text-sm font-medium transition-colors group ${
                pathname === '/contact' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Contact
              <span className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300 ${
                pathname === '/contact' ? 'w-full' : ''
              }`}></span>
            </Link>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full px-6 shadow-md shadow-red-900/20 border border-red-500/20"
              onClick={() => window.location.href = '/contact'}
            >
              Démarrer un projet <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-red-600 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 border-b border-gray-100 py-6 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col space-y-5 px-6">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'
                } flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-3 ${pathname === '/' ? 'bg-red-500' : 'bg-transparent'}`}></span>
                Accueil
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/about' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'
                } flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-3 ${pathname === '/about' ? 'bg-red-500' : 'bg-transparent'}`}></span>
                À Propos
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/contact' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'
                } flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-3 ${pathname === '/contact' ? 'bg-red-500' : 'bg-transparent'}`}></span>
                Contact
              </Link>
              <Button
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full px-6 shadow-md shadow-red-900/20 border border-red-500/20 py-2.5 mt-2 flex items-center justify-center"
                onClick={() => {
                  window.location.href = '/contact';
                  setIsMenuOpen(false);
                }}
              >
                Démarrer un projet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}