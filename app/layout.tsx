import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./component/navbar";
import { ToastProvider } from "./component/toast-provider";

export const metadata: Metadata = {
  title: "PEA Vehicle Management System",
  description: "A comprehensive system for managing vehicles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
