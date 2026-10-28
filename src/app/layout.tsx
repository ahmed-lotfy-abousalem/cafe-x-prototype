import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces, Cairo } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "Café X · Order from your table",
  description: "QR self-ordering prototype: link tree, digital menu, live kitchen dashboard and admin panel.",
};

export const viewport: Viewport = {
  themeColor: "#2a1c14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
