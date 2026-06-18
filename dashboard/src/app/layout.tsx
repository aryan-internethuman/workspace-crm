import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "White Gloves Console — Workspace CRM",
  description: "Founder command center for the White Gloves CRM collaboration layer powered by Internet Human AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full bg-white text-gray-900 antialiased" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
