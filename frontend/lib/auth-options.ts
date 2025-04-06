import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Rechercher l'utilisateur par email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  domain: true,
                  status: true
                }
              }
            }
          });

          if (!user) {
            return null;
          }

          // Vérifier si l'utilisateur est actif
          if (!user.isActive) {
            throw new Error("Ce compte a été désactivé");
          }

          // Pour un cas réel, il faudrait comparer avec un hash du mot de passe
          // Ici on compare directement pour simplifier
          const passwordMatches = user.password === credentials.password;

          if (!passwordMatches) {
            return null;
          }

          // Vérifier si le tenant est actif (sauf pour les superadmins)
          if (user.tenantId && user.role !== 'superadmin' && user.tenant?.status !== 'active') {
            throw new Error("Votre organisation n'est pas active");
          }

          // Mettre à jour la date de dernière connexion
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenant: user.tenant
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenant = user.tenant;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenant = token.tenant as any;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 heures
  },
  secret: process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production"
}; 