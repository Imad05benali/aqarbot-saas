import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AqarBot | L'IA Immobilière n°1 au Maroc - Automatisation WhatsApp & CRM",
    template: "%s | AqarBot"
  },
  description: "Optimisez votre agence immobilière au Maroc avec AqarBot. IA conversationnelle en Darija, qualification de leads automatique sur WhatsApp et CRM intelligent pour agents immobiliers.",
  keywords: ["immobilier maroc", "real estate morocco", "crm immobilier", "whatsapp automation morocco", "ia darija", "semsar ia", "aqarbot", "gestion immobilière casablanca"],
  authors: [
    { name: "Imad Salim Ben Ali" },
    { name: "Salah Bourray" }
  ],
  creator: "AqarBot Team",
  publisher: "AqarBot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://aqarbot.ma"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-MA": "/fr",
      "ar-MA": "/ar",
    },
  },
  openGraph: {
    title: "AqarBot | L'IA Immobilière n°1 au Maroc",
    description: "Qualifiez vos leads 24/7 en Darija sur WhatsApp avec AqarBot. La solution SaaS ultime pour les professionnels de l'immobilier au Maroc.",
    url: "https://aqarbot.ma",
    siteName: "AqarBot",
    locale: "fr_MA",
    type: "website",
    images: [
      {
        url: "/maroc-core-tech.png",
        width: 1200,
        height: 630,
        alt: "AqarBot Real Estate AI Morocco",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "AqarBot - IA Immobilière au Maroc",
    description: "Révolutionnez votre agence avec l'IA Darija & WhatsApp.",
    images: ["/maroc-core-tech.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/shortcut-icon.png",
    apple: "/apple-touch-icon.png",
  },
};

import GlobalBackground from "@/components/GlobalBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalBackground />
          <Navbar />
          <div className="relative z-10 min-h-screen">
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
