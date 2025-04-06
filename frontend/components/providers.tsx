"use client";

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';
import { CartProvider } from '@/context/CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TenantProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 