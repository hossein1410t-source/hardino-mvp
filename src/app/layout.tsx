import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "هاردینو | خرید و فروش امن سخت‌افزار با شناسنامه سلامت",
  description:
    "مارکت‌پلیس تخصصی قطعات کارکرده کامپیوتر با شناسنامه سلامت دیجیتال و پرداخت امانی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <head>
        <meta name="enamad" content="295451" />
      </head>
      <body
        className={`${vazir.className} font-sans bg-slate-100 text-slate-900 antialiased`}
        style={{ fontFeatureSettings: '"ss01" 1' }}
      >
        {children}
      </body>
    </html>
  );
}
