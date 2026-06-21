import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Toast } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Porrita.io Amigos",
  description: "Porra del Mundial entre amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white antialiased">
        <NavBar />
        {children}
        <Suspense fallback={null}>
          <Toast />
        </Suspense>
      </body>
    </html>
  );
}
