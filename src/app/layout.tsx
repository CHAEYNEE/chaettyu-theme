import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import Providers from "./providers";

const wantedSans = localFont({
  src: "./fonts/WantedSansVariable.woff2",
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  title: "chaettyu.theme",
  description: "카카오톡 테마 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={wantedSans.variable}>
      <body>
        <Providers>
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
