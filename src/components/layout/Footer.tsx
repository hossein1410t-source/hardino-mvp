import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Lock,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText,
  Info,
} from "lucide-react";

interface FooterProps {
  onNavigateTab: (tabIndex: number) => void;
}

export default function Footer({ onNavigateTab }: FooterProps) {
  return (
    <footer
      dir="rtl"
      className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300 pt-12 pb-8 rounded-t-3xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ردیف ۴ ستونه معرفی، دسترسی سریع، قوانین و اطلاعات تماس */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* ستون ۱: درباره پلتفرم */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold">هاردینو | Hardino</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              پلتفرم تخصصی معامله امن سخت‌افزار کارکرده در ایران با کارشناسی فنی، صدور شناسنامه سلامت دیجیتال و تضمین بازگشت وجه در مهلت تست ۴۸ ساعته از طریق پرداخت امانی.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>پوشش تضمین سلامت و مهلت تست ۴۸ ساعته</span>
            </div>
            <div className="pt-1">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
              >
                <Info className="w-3.5 h-3.5" />
                <span>درباره هاردینو بیشتر بدانید</span>
              </Link>
            </div>
          </div>

          {/* ستون ۲: دسترسی سریع */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
              دسترسی سریع
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(0)}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  ویترین قطعات تست‌شده بازارچه
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(2)}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  مشاور و سیستم‌ساز هوشمند (PC Builder)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(1)}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  ثبت آگهی فروش قطعه
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(4)}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  استعلام آنلاین اصالت شناسنامه سلامت
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(3)}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  درخواست اعزام تکنسین و اسمبل در محل
                </button>
              </li>
            </ul>
          </div>

          {/* ستون ۳: راهنما و قوانین معاملات (لینک‌های مستقیم اینماد) */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
              قوانین و راهنمای کاربران
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-400 font-medium transition"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>قوانین و مقررات و رویه بازگشت وجه</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 font-medium transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>سوالات متداول خریداران و فروشندگان</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-slate-200 hover:text-sky-400 font-medium transition"
                >
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>درباره ما و سازوکار معامله امن</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 font-medium transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>تماس با پشتیبانی و ثبت شکایات</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ستون ۴: اطلاعات تماس و نمادهای اعتماد */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
              اطلاعات تماس و پشتیبانی
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  استان مرکزی، شهرستان فراهان، شهر تلخاب، خیابان امام، کوچه چمران (کد پستی: 3957145883)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  تلفن تماس:{" "}
                  <a href="tel:09965344598" dir="ltr" className="font-bold text-white hover:text-emerald-400">
                    09965344598
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href="mailto:hossein1410.t@gmail.com"
                  dir="ltr"
                  className="text-slate-200 hover:text-sky-400 truncate"
                >
                  hossein1410.t@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>پاسخگویی: ۲۴ ساعته (۷ روز هفته)</span>
              </div>
            </div>

            {/* نشان‌های اعتماد و جایگاه لوگوی اینماد */}
            <div className="pt-2 flex items-center gap-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center flex-1">
                <Lock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-200">پرداخت امانی</span>
                <span className="block text-[8px] text-slate-400">مهلت تست ۴۸ ساعته</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center flex-1">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-200">شناسنامه سلامت</span>
                <span className="block text-[8px] text-slate-400">تضمین اصالت قطعه</span>
              </div>
              {/* جایگاه درج کد لوگوی رسمی اینماد پس از دریافت */}
              <div
                id="enamad-badge-slot"
                className="bg-slate-800/70 border border-dashed border-slate-600 rounded-xl p-2 text-center flex-1 flex flex-col items-center justify-center min-h-[62px]"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400 mb-1" />
                <span className="block text-[9px] font-bold text-slate-300">نماد اعتماد</span>
                <span className="block text-[8px] text-slate-400">در حال دریافت</span>
              </div>
            </div>
          </div>
        </div>

        {/* نوار کپی‌رایت و لینک‌های اصلی پایین فوتر */}
        <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © کلیه حقوق مادی و معنوی متعلق به پلتفرم معاملات تخصصی سخت‌افزار هاردینو (hardino-market.ir) می‌باشد.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link href="/about" className="hover:text-white transition">
              درباره ما
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition">
              قوانین و بازگشت وجه
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-white transition">
              سوالات متداول
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition">
              تماس با ما
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
