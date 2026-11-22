"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  ArrowLeft,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface HeroBannerProps {
  onNavigateTab: (tabIndex: number) => void;
}

const SLIDES = [
  {
    id: 1,
    tag: "شناسنامه سلامت دیجیتال",
    tagColor:
      "from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-400/35",
    title: "قبل از خرید، نبض واقعی قطعه رو ببین!",
    subtitle:
      "دما، سلامت حافظه و نتیجه تست فشار هر قطعه رو توی شناسنامه دیجیتال هاردینو چک کن تا خریدت هیچ ریسکی نداشته باشه.",
    cta: "دیدن نمونه شناسنامه سلامت",
    ctaStyle:
      "bg-gradient-to-l from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20",
    targetTab: 4,
    badgeIcon: ShieldCheck,
    badgeTitle: "برگه سلامت واقعی",
    badgeSubtitle: "تست دما، ولتاژ و پایداری زیر فشار",
    image: "/images/hero-health.jpg",
    imageAlt: "شناسنامه سلامت قطعات هاردینو",
    gradient: "from-[#0F172A] via-[#172038] to-[#0F172A]",
    borderGlow: "border-amber-400/25",
    accentGlow: "rgba(245, 158, 11, 0.22)",
    dotActive: "bg-amber-400",
    badgeAccent: "text-amber-400",
  },
  {
    id: 2,
    tag: "معامله امن با قفل پول",
    tagColor:
      "from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-400/35",
    title: "تا قطعه رو روی سیستمت تست نکنی، پولی جابه‌جا نمی‌شه!",
    subtitle:
      "مبلغ سفارش ۴۸ ساعت پیش هاردینو امانت می‌مونه؛ فقط وقتی خودت سلامت قطعه رو تایید کردی، به حساب فروشنده واریز می‌شه.",
    cta: "ببین معامله امن چطوریه",
    ctaStyle:
      "bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25",
    targetTab: 6,
    badgeIcon: Lock,
    badgeTitle: "۴۸ ساعت مهلت تست",
    badgeSubtitle: "امانت‌داری امن وجه تا تایید نهایی",
    image: "/images/hero-escrow.jpg",
    imageAlt: "صندوق امانی و پرداخت امن هاردینو",
    gradient: "from-[#0B1F2A] via-[#0F2933] to-[#0F172A]",
    borderGlow: "border-emerald-400/25",
    accentGlow: "rgba(16, 185, 129, 0.22)",
    dotActive: "bg-emerald-400",
    badgeAccent: "text-emerald-400",
  },
  {
    id: 3,
    tag: "سیستم‌ساز هوشمند",
    tagColor:
      "from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-cyan-400/35",
    title: "نمی‌دونی کدوم قطعه با سیستمت مچ می‌شه؟",
    subtitle:
      "بودجه و کاربردت رو بگو تا هوش مصنوعی بهترین ترکیب قطعات سازگار، بدون گلوگاه و متناسب با پاور و کیست رو برات بچینه.",
    cta: "شروع چیدمان هوشمند سیستم",
    ctaStyle:
      "bg-gradient-to-l from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 shadow-cyan-500/25",
    targetTab: 2,
    badgeIcon: Cpu,
    badgeTitle: "بررسی خودکار گلوگاه",
    badgeSubtitle: "تطابق کامل پاور، مادربرد و گرافیک",
    image: "/images/hero-builder.jpg",
    imageAlt: "سیستم‌ساز هوشمند هاردینو",
    gradient: "from-[#0F172A] via-[#0E2438] to-[#0F172A]",
    borderGlow: "border-cyan-400/25",
    accentGlow: "rgba(6, 182, 212, 0.22)",
    dotActive: "bg-cyan-400",
    badgeAccent: "text-cyan-400",
  },
];

export default function HeroBanner({ onNavigateTab }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div
      dir="rtl"
      className={`relative overflow-hidden rounded-3xl border ${slide.borderGlow} shadow-2xl mb-8 transition-colors duration-500`}
    >
      <div
        className={`bg-gradient-to-l ${slide.gradient} p-6 sm:p-8 md:p-10 text-white relative transition-all duration-700`}
        style={{
          boxShadow: `inset 0 0 110px -25px ${slide.accentGlow}`,
        }}
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* بخش متنی اسلایدر */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold backdrop-blur-md bg-gradient-to-l ${slide.tagColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.tag}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold leading-[1.45] text-white">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-[15px] text-slate-300 leading-7 max-w-2xl font-normal">
              {slide.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onNavigateTab(slide.targetTab)}
                className={`${slide.ctaStyle} font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
              >
                <span>{slide.cta}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab(1)}
                className="bg-slate-800/75 hover:bg-slate-800 text-slate-200 border border-white/15 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition backdrop-blur-sm cursor-pointer"
              >
                قطعه برای فروش داری؟
              </button>
            </div>
          </div>

          {/* بخش گرافیک سه‌بعدی سمت چپ */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[300px] sm:max-w-[330px]">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/15 bg-[#0F172A] shadow-2xl">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className="w-full h-full object-cover mix-blend-lighten transition-transform duration-700 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent" />

                {/* برچسب شناور پایین تصویر */}
                <div className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/15 px-3.5 py-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <BadgeIcon className={`w-5 h-5 ${slide.badgeAccent}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{slide.badgeTitle}</span>
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${slide.badgeAccent} shrink-0`}
                      />
                    </div>
                    <div className="text-[11px] text-slate-300 truncate mt-0.5">
                      {slide.badgeSubtitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* نوار کنترل اسلایدر */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  current === idx
                    ? `w-8 ${slide.dotActive}`
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`اسلاید ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
              }
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition border border-white/10 cursor-pointer"
              title="قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition border border-white/10 cursor-pointer"
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
