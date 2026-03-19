import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authConfig = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id ?? token.sub;
                token.email = user.email ?? token.email;
                token.name = user.name ?? token.name;
                token.picture = user.image ?? token.picture;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            // Server-side event: safe place to sync user to Go
            const email = user.email;
            if (!email) return;

            const name = user.name ?? null;
            const image = user.image ?? null;

            const apiBase = process.env.GO_API_BASE_URL;
            const secret = process.env.INTERNAL_API_SECRET;

            if (!apiBase || !secret) {
                console.error("Missing GO_API_BASE_URL or INTERNAL_API_SECRET");
                return;
            }

            try {
                await fetch(`${apiBase}/internal/sync-user`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Internal-Secret": secret,
                    },
                    body: JSON.stringify({ email, name, image }),
                });
                console.log("User synced successfully to Go backend for email:", email);
            } catch (err) {
                console.error("Failed to sync user to Go backend", err);
            }
        },
    },
} satisfies NextAuthConfig;
