import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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
    default: "BanThuoc - Nhà thuốc online uy tín | Dược phẩm chính hãng",
    template: "%s | BanThuoc",
  },
  description: "Mua thuốc online chính hãng tại BanThuoc. Hơn 10.000+ sản phẩm dược phẩm, thực phẩm chức năng, thiết bị y tế. Giao nhanh, giá tốt, đảm bảo chất lượng.",
  keywords: ["mua thuốc online", "nhà thuốc online", "dược phẩm chính hãng", "thực phẩm chức năng", "thiết bị y tế", "banthuoc"],
  authors: [{ name: "BanThuoc" }],
  creator: "BanThuoc",
  metadataBase: new URL("https://banthuoc.andyanh.id.vn"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://banthuoc.andyanh.id.vn",
    siteName: "BanThuoc",
    title: "BanThuoc - Nhà thuốc online uy tín",
    description: "Mua thuốc online chính hãng tại BanThuoc. Hơn 10.000+ sản phẩm dược phẩm, thực phẩm chức năng, thiết bị y tế.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BanThuoc - Nhà thuốc online uy tín",
    description: "Mua thuốc online chính hãng tại BanThuoc.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
