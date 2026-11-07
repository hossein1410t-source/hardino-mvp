import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({ 
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"]
});

export const metadata: Metadata = {
  title: "پلتفرم معاملات امن سخت‌افزار | خرید و فروش با شناسنامه سلامت",
  description: "مارکت‌پلیس واسطه قطعات کارکرده کامپیوتر با تست تخصصی و درگاه پرداخت امانی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} bg-slate-100 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
