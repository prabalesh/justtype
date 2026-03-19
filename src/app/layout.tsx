import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { HeaderAuth } from "@/components/HeaderAuth";

export const metadata: Metadata = {
  title: "JustType",
  description: "Multiplayer typing racer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <HeaderAuth />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
