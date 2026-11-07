"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  Zap,
  ArrowLeft,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Award,
} from "lucide-react";

interface HeroBannerProps {
  onNavigateTab: (tabIndex: number) => void;
}

const SLIDES = [
  {
    id: 1,
    tag: "تضمین اصالت و سلامت ۱۰۰٪",
    tagColor: "from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-500/30",
    title: "خرید سخت‌افزار دست‌دوم، به امنیت خرید قطعه آکبند",
    subtitle:
      "تمامی قطعات دارای نشان طلایی در لابراتوار تخصصی تست دما، بنچمارک استرس و پایداری ولتاژ شده و دارای شناسنامه دیجیتال ضدجعل هستند.",
    cta: "مشاهده شناسنامه سلامت نمونه",
    targetTab: 4, // تب استعلام شناسنامه
    badgeIcon: Award,
    statNumber: "۱,۴۸۰+",
    statLabel: "قطعه کارشناسی‌شده",
    gradient: "from-slate-900 via-indigo-950/80 to-slate-900",
    accentGlow: "rgba(99, 102, 241, 0.25)",
  },
  {
    id: 2,
    tag: "معامله امن با صندوق امانی (Escrow)",
    tagColor: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/30",
    title: "پول شما تا پایان ۴۸ ساعت مهلت تست، نزد پلتفرم قفل است",
    subtitle:
      "وجه پرداختی خریدار در صندوق امانی محافظت می‌شود و تنها پس از تحویل کالا، رضایت کامل و اعلام کد ۶ رقمی ترخیص، به حساب فروشنده واریز خواهد شد.",
    cta: "ورود به اتاق معامله امن",
    targetTab: 6, // تب معامله امن
    badgeIcon: Lock,
    statNumber: "۴۸ ساعت",
    statLabel: "ضمانت بازگشت وجه",
    gradient: "from-slate-900 via-slate-950 to-slate-900",
    accentGlow: "rgba(16, 185, 129, 0.25)",
  },
  {
    id: 3,
    tag: "هوش مصنوعی و سیستم‌ساز هوشمند",
    tagColor: "from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-cyan-500/30",
    title: "اسمبل دقیق کیس با هوش مصنوعی و بدون ریسک گلوگاه",
    subtitle:
      "محاسبه توان دقیق پاور، بررسی همخوانی رم و ابعاد کارت گرافیک، و چیدمان خودکار بهترین قطعات متناسب با بودجه گیمینگ یا رندرینگ شما.",
    cta: "شروع اسمبل هوشمند سیستم",
    targetTab: 2, // تب سیستم‌ساز
    badgeIcon: Cpu,
    statNumber: "۰٪ گلوگاه",
    statLabel: "تطابق استاندارد قطعات",
    gradient: "from-slate-900 via-slate-900 to-cyan-950/70",
    accentGlow: "rgba(6, 182, 212, 0.25)",
  },
];

export default function HeroBanner({ onNavigateTab }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  // تعویض خودکار اسلاید هر ۶ ثانیه
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl mb-8">
      {/* پس‌زمینه گرادیان با افکت هاله نوری نئونی */}
      <div
        className={`bg-gradient-to-r ${slide.gradient} p-8 sm:p-10 md:p-12 text-white relative transition-all duration-700`}
        style={{
          boxShadow: `inset 0 0 100px -20px ${slide.accentGlow}`,
        }}
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* محتوای متنی پوستر */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold backdrop-blur-md bg-gradient-to-l transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.tag}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">
              {slide.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {slide.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigateTab(slide.targetTab)}
                className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{slide.cta}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab(1)} // ثبت آگهی فروش
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition backdrop-blur-sm"
              >
                فروش بدون واسطه قطعه من
              </button>
            </div>
          </div>

          {/* کارت آمار و نشان اعتمادسازی سمت چپ */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="liquid-glass-dark border border-white/15 p-6 rounded-3xl w-full max-w-xs text-center space-y-4 shadow-2xl relative">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                <BadgeIcon className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <div className="text-3xl font-black font-mono tracking-tight text-white">
                  {slide.statNumber}
                </div>
                <div className="text-xs text-slate-300 font-bold mt-1">
                  {slide.statLabel}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>تاییدیه رسمی لابراتوار سخت‌افزار</span>
              </div>
            </div>
          </div>
        </div>

        {/* دکمه‌های کنترل اسلایدر و نقاط زیرین */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  current === idx ? "w-8 bg-emerald-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                title={`اسلاید ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition border border-white/10"
              title="قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition border border-white/10"
              title="بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
