"use client";

import React from "react";
import {
  ShieldCheck,
  Cpu,
  Lock,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  FileText,
} from "lucide-react";

interface FooterProps {
  onNavigateTab: (tabIndex: number) => void;
}

export default function Footer({ onNavigateTab }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300 pt-12 pb-8 rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ردیف ۴ ستونه معرفی و دسترسی سریع */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* ستون ۱: درباره پلتفرم */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight">هاردینو | Hybrid Tech</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              اولین پلتفرم معامله امن سخت‌افزار کارکرده در ایران با کارشناسی فیزیکی، بنچمارک هوش مصنوعی، صدور شناسنامه سلامت دیجیتال و ضمانت بازگشت وجه از طریق صندوق امانی (Escrow).
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>پوشش بیمه و گارانتی ۴۸ ساعته تست خریدار</span>
            </div>
          </div>

          {/* ستون ۲: دسترسی سریع */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
              دسترسی سریع
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(0)}
                  className="hover:text-emerald-400 transition"
                >
                  ویترین قطعات تست‌شده بازارچه
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(2)}
                  className="hover:text-emerald-400 transition"
                >
                  مشاور و سیستم‌ساز هوشمند (PC Builder)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(1)}
                  className="hover:text-emerald-400 transition"
                >
                  ثبت قطعه و دریافت بارکد پذیرش مرکز تست
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(4)}
                  className="hover:text-emerald-400 transition"
                >
                  استعلام آنلاین اصالت شناسنامه سلامت
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab(3)}
                  className="hover:text-emerald-400 transition"
                >
                  درخواست اعزام تکنسین و اسمبل در محل
                </button>
              </li>
            </ul>
          </div>

          {/* ستون ۳: قوانین داوری و صندوق امانی */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
              قوانین و داوری معاملات
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>نگهداری وجه در حساب امانی تا رضایت قطعی خریدار</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>داوری تخصصی در صورت مغایرت دمای قطعه یا ایراد فنی</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>تضمین عدم دستکاری بایوس و فابریک بودن قطعات</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>چانه‌زنی مستقیم خریدار و فروشنده پس از گزارش تست</span>
              </li>
            </ul>
          </div>

          {/* ستون ۴: اطلاعات تماس و نمادهای اعتماد */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
              ارتباط با مرکز تست و اعتماد
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>تهران، خیابان ولیعصر، تقاطع طالقانی، مجتمع نور</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>پشتیبانی مرکزی: ۰۲۱-۸۸۹۹۰۰۱۱</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>پذیرش حضوری قطعات: شنبه تا چهارشنبه ۹ الی ۱۸</span>
              </div>
            </div>

            {/* نشان‌های اعتماد و پرداخت امن */}
            <div className="pt-2 flex items-center gap-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center flex-1">
                <Lock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-200">پرداخت امن</span>
                <span className="block text-[8px] text-slate-400">شاپرک / سداد</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center flex-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-200">تست تخصصی</span>
                <span className="block text-[8px] text-slate-400">هوش مصنوعی</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-center flex-1">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-slate-200">ضمانت بازگشت</span>
                <span className="block text-[8px] text-slate-400">۴۸ ساعت مهلت</span>
              </div>
            </div>
          </div>
        </div>

        {/* نوار کپی‌رایت پایین فوتر */}
        <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © کلیه حقوق مادی و معنوی متعلق به پلتفرم معاملات تخصصی سخت‌افزار هاردینو (Hybrid Tech) می‌باشد.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">حریم خصوصی</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">شرایط و قوانین</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">فرصت‌های شغلی لابراتوار</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
