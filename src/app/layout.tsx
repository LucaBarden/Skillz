import "skillz/styles/globals.css";

import { type Metadata } from "next";
import { Fira_Mono, Geist } from "next/font/google";

import { TRPCReactProvider } from "skillz/trpc/react";

export const metadata: Metadata = {
  title: "SKILLZ",
  description: "The Open Source Skill Registry",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  variable: "--font-fira-mono",
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${firaMono.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
