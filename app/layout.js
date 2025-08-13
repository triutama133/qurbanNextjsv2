

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingFeedback from "../components/FloatingFeedback";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tabungan Qurban Peduli",
  description: "Platform tabungan qurban untuk memudahkan persiapan ibadah qurban",
  generator: "v0.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <FloatingFeedback />
      </body>
    </html>
  );
}
