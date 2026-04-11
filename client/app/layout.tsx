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
  name: "BanThuocSi - Ngọc Kim Ngân Pharma",
  alternateName: [
    "BanThuocSi",
    "Bán Thuốc Sỉ",
    "Ngọc Kim Ngân",
    "Ngọc Kim Ngân Pharma",
    "NKN Pharma",
    "NKN",
    "Công ty Dược phẩm Ngọc Kim Ngân",
  ],
  url: SITE_URL,
  logo: `${SITE_URL}/2.png`,
  description:
    "BanThuocSi.vn - Sàn dược phẩm sỉ B2B của Công ty Dược phẩm Ngọc Kim Ngân (NKN Pharma). Cung cấp thuốc sỉ chính hãng cho nhà thuốc, phòng khám toàn quốc.",
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
  name: "BanThuocSi - Ngọc Kim Ngân Pharma",
  alternateName: ["BanThuocSi", "NKN Pharma", "Ngọc Kim Ngân"],
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
    default: "Bán Thuốc Sỉ - Ngọc Kim Ngân Pharma (NKN) | BanThuocSi.vn",
    template: "%s | BanThuocSi - NKN Pharma",
    // Trang chủ dùng default, các trang con dùng template: "Tên trang | BanThuocSi - NKN Pharma"
  },
  description:
    "BanThuocSi.vn - Sàn dược phẩm sỉ B2B của Công ty Dược phẩm Ngọc Kim Ngân (NKN Pharma). Bán thuốc sỉ giá tốt, hơn 10.000+ sản phẩm chính hãng cho nhà thuốc, phòng khám toàn quốc. Giao nhanh, giá cạnh tranh.",
  keywords: [
    // Core B2B wholesale
    "bán thuốc sỉ",
    "thuốc sỉ",
    "nhà thuốc sỉ",
    "mua thuốc sỉ",
    "thuốc sỉ giá tốt",
    "sàn dược phẩm sỉ",
    "banthuocsi",
    "banthuocsi.vn",
    "dược phẩm sỉ",
    "thuốc sỉ online",
    // Brand: Ngọc Kim Ngân / NKN Pharma
    "ngọc kim ngân",
    "ngoc kim ngan",
    "nkn pharma",
    "nkn",
    "dược phẩm ngọc kim ngân",
    "công ty ngọc kim ngân",
    "công ty dược phẩm ngọc kim ngân",
    "nkn pharmacy",
    "nhà thuốc ngọc kim ngân",
    "ngọc kim ngân pharma",
  ],
  authors: [{ name: "Ngọc Kim Ngân Pharma" }],
  creator: "Ngọc Kim Ngân Pharma",
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
    siteName: "BanThuocSi - NKN Pharma",
    title: "Bán Thuốc Sỉ - Ngọc Kim Ngân Pharma (NKN) | BanThuocSi.vn",
    description:
      "Sàn dược phẩm sỉ B2B của Công ty Dược phẩm Ngọc Kim Ngân (NKN Pharma). 10.000+ sản phẩm thuốc sỉ chính hãng cho nhà thuốc, phòng khám toàn quốc.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BanThuocSi - Ngọc Kim Ngân Pharma (NKN)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bán Thuốc Sỉ - NKN Pharma | BanThuocSi.vn",
    description:
      "Sàn dược phẩm sỉ B2B của Ngọc Kim Ngân Pharma - 10.000+ sản phẩm thuốc sỉ chính hãng.",
    images: ["/og-image.png"],
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
