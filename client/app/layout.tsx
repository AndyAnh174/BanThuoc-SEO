import type { Metadata } from "next";
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import FloatingContact from "@/src/components/FloatingContact";
import "./globals.css";

const SITE_URL = "https://banthuocsi.vn";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BanThuoc",
  url: SITE_URL,
  logo: `${SITE_URL}/2.png`,
  description: "Nhà thuốc online uy tín - Dược phẩm chính hãng",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "VN",
    availableLanguage: ["Vietnamese"],
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BanThuoc",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

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
  alternates: {
    canonical: "/",
  },
  ...(GSC_VERIFICATION && {
    verification: {
      google: GSC_VERIFICATION,
    },
  }),
  icons: {
    icon: [{ url: "/2.png", type: "image/png" }],
    shortcut: "/2.png",
    apple: "/2.png",
  },
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
      <head>
        <link rel="preconnect" href="https://minio.banthuocsi.vn" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://minio.banthuocsi.vn" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
        {children}
        <FloatingContact />
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
