import type { Metadata } from "next";
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
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

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "BanThuoc - Nhà thuốc online uy tín | Dược phẩm chính hãng",
    template: "%s | BanThuoc",
    // Trang chủ dùng default, các trang con dùng template: "Tên trang | BanThuoc"
  },
  description: "Mua thuốc online chính hãng tại BanThuoc. Hơn 10.000+ sản phẩm dược phẩm, thực phẩm chức năng, thiết bị y tế. Giao nhanh, giá tốt, đảm bảo chất lượng.",
  keywords: ["mua thuốc online", "nhà thuốc online", "dược phẩm chính hãng", "thực phẩm chức năng", "thiết bị y tế", "banthuoc"],
  authors: [{ name: "BanThuoc" }],
  creator: "BanThuoc",
  metadataBase: new URL("https://banthuocsi.vn"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://banthuocsi.vn",
    siteName: "BanThuoc",
    title: "BanThuoc - Nhà thuốc online uy tín",
    description: "Mua thuốc online chính hãng tại BanThuoc. Hơn 10.000+ sản phẩm dược phẩm, thực phẩm chức năng, thiết bị y tế.",
    images: [
      {
        url: "/2.png",
        width: 1200,
        height: 630,
        alt: "BanThuoc - Nhà thuốc online uy tín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BanThuoc - Nhà thuốc online uy tín",
    description: "Mua thuốc online chính hãng tại BanThuoc.",
    images: ["/2.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} antialiased`}
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
