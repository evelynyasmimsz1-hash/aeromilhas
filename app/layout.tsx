import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeSync } from "@/components/shared/ThemeSync";
import { AuthProvider } from "@/components/shared/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aeromilhas — Suas milhas organizadas",
  description:
    "Centralize seus saldos, acompanhe vencimentos e encontre oportunidades para viajar usando milhas.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aeromilhas",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `
try {
  var raw = localStorage.getItem('aeromilhas-settings');
  var theme = raw ? JSON.parse(raw).state.theme : 'system';
  if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-bg font-sans text-ink">
        <ThemeSync />
        <AuthProvider />
        {children}
      </body>
    </html>
  );
}
