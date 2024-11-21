import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
}));

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Fetch user from DynamoDB
        const user = await dynamoDb.get({
          TableName: "Users",
          Key: { email: credentials.email },
        });

        // Check if user exists
        if (user.Item) {
          // If user exists and the provider is Google
          if (user.Item.provider === "google") {
            throw new Error("This account was created with Google. Please log in using Google.");
          }

          // Check password if provider is not Google
          if (await bcrypt.compare(credentials.password, user.Item.password)) {
            return {
              id: user.Item.email,
              email: user.Item.email,
              name: user.Item.name,
              profile: user.Item.profile || {}, // Ensure profile is included
            };
          }
        }

        return null; // If user does not exist or password is incorrect
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { email, name } = user;
        try {
          const result = await dynamoDb.get({
            TableName: "Users",
            Key: { email },
          });

          // Create new user entry if not exists
          if (!result.Item) {
            await dynamoDb.put({
              TableName: "Users",
              Item: {
                email,
                name,
                credits: 100,
                provider: "google",
                profile: {}, // Initialize with an empty JSON object
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error checking/creating user:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user) {
        const result = await dynamoDb.get({
          TableName: "Users",
          Key: { email: session.user.email },
        });
        if (result.Item) {
          session.user.credits = result.Item.credits;
          session.user.profile = result.Item.profile  || {}; // Include profile in session
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };