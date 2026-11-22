"use client";

import React, { useState } from "react";
import { ArrowLeft, BadgeCheck, CheckCircle2, Lock, Sparkles, X } from "lucide-react";

interface ActionBannersProps {
  onNavigateTab: (tabIndex: number) => void;
}

export default function ActionBanners({ onNavigateTab }: ActionBannersProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <section dir="rtl" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* بنر عریض خریدار */}
        <button
          type="button"
          onClick={() => setShowHowItWorks(true)}
          className="group block w-full overflow-hidden rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.008] focus:outline-none cursor-pointer"
        >
          <img
            src="/images/banner-buyer-wide.jpg"
            alt="قطعه دست‌دوم، انگار آکبند!"
            className="w-full h-auto object-cover block"
          />
        </button>

        {/* بنر عریض فروشنده */}
        <button
          type="button"
          onClick={() => onNavigateTab(1)}
          className="group block w-full overflow-hidden rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.008] focus:outline-none cursor-pointer"
        >
          <img
            src="/images/banner-seller-wide.jpg"
            alt="بدون چونه، واقعی بفروش!"
            className="w-full h-auto object-cover block"
          />
        </button>
      </section>

      {showHowItWorks && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
          onClick={() => setShowHowItWorks(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-amber-400/40 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="absolute left-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>راز خرید مطمئن در هاردینو چیه؟</span>
            </div>
            <h3 className="text-xl font-extrabold mb-5">
              ۳ قدم تا تحویل قطعه سالم، بدون ۱ ریال ریسک
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/70 p-3.5 border border-slate-700">
                <BadgeCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-300">۱. شناسنامه سلامت واقعی</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    دما، سلامت حافظه و نتیجه تست‌های فشار هر قطعه ثبت می‌شه تا با چشم باز انتخاب کنی.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/70 p-3.5 border border-slate-700">
                <Lock className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-300">۲. پولت پیش هاردینو امانت می‌مونه</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    مبلغ سفارش مستقیم به فروشنده نمی‌ره؛ تا زمان تحویل قطعه در سیستم امانی قفل می‌مونه.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/70 p-3.5 border border-slate-700">
                <CheckCircle2 className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-sky-300">۳. خودت تست کن، بعد پول آزاد می‌شه</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    ۴۸ ساعت مهلت تست داری؛ فقط وقتی تاییدش کردی پول برای فروشنده آزاد می‌شه.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowHowItWorks(false);
                  onNavigateTab(4);
                }}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                دیدن نمونه شناسنامه
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHowItWorks(false);
                  onNavigateTab(0);
                  window.scrollTo({ top: 420, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                <span>مشاهده قطعات تست‌شده</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
