import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ads Manager Dashboard",
  description: "Scalable Ads Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 dynamic-layout`}
      >
        <Providers>
          {children}
          <ToastContainer position="top-right" />{" "}
        </Providers>
      </body>
    </html>
  );
}
