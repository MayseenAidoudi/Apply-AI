import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      credits?: number;
      provider?: string | null;
      profile?: Record<string, any>; // Add profile field for JSON
    };
  }
}