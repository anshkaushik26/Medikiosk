import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n-context";
import { AuthProvider } from "../lib/auth-context";
import { Navbar } from "../components/common/Navbar";
import { PatientNav } from "../components/common/PatientNav";
import { DevBadge } from "../components/common/DevBadge";

export const metadata: Metadata = {
  title: "MEDIKIOSK — Accessible Digital Healthcare",
  description: "Make healthcare information simple before the consultation begins. Designed for seniors, rural citizens and families in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900 pb-16 md:pb-0">
        <I18nProvider>
          <AuthProvider>
            <Navbar />
            <PatientNav />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
