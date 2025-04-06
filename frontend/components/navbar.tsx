"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, PhoneIcon, Sun, Moon, ChevronDown, ChevronRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState("/");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    setActivePath(window.location.pathname);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/22797977199?text=Bonjour, je vous contacte depuis votre site web. J\'aimerais discuter d\'un projet.', '_blank');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-background"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/logo.png" 
                alt="NigerDev Logo" 
                width={110} 
                height={30} 
                className="h-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md ${
                    activePath === item.href 
                      ? "text-primary" 
                      : "text-foreground/80 hover:bg-secondary/50"
                  }`}
                >
                  {item.name}
                  {activePath === item.href && (
                    <span className="absolute -bottom-0 left-0 h-0.5 w-full bg-primary rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-secondary/50"
              aria-label="Changer de thème"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button 
              variant="default" 
              className="rounded-full hidden sm:flex" 
              onClick={handleWhatsAppClick}
              size="sm"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              <span>Nous contacter</span>
            </Button>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="border-l border-primary/20">
                  <div className="flex justify-center py-6">
                    <Image 
                      src="/images/logo.png" 
                      alt="NigerDev Logo" 
                      width={140} 
                      height={40} 
                      className="h-auto"
                    />
                  </div>
                  <nav className="flex flex-col space-y-4 mt-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`px-3 py-2 text-base font-medium rounded-lg flex items-center 
                          ${activePath === item.href 
                            ? "text-primary bg-primary/10" 
                            : "hover:bg-secondary hover:text-primary"
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <ChevronRight className={`mr-2 h-4 w-4 ${activePath === item.href ? "text-primary" : ""}`} />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="absolute bottom-8 left-0 right-0 px-6">
                    <Button 
                      variant="default" 
                      className="w-full rounded-lg py-6 text-base" 
                      onClick={handleWhatsAppClick}
                    >
                      <PhoneIcon className="mr-2 h-5 w-5" />
                      <span>Contactez-nous</span>
                    </Button>
                    <p className="text-xs text-center mt-4 text-muted-foreground">
                      © 2023 NigerDev. Tous droits réservés.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}