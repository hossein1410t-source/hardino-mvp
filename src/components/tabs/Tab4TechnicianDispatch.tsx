"use client";

import React, { useState } from "react";
import { Wrench, MapPin, Calendar, CheckCircle2, Truck, MonitorPlay, Wifi, Star, ShieldCheck, Zap, Activity } from "lucide-react";

export default function Tab4TechnicianDispatch() {
  const [mode, setMode] = useState<"IN_PERSON" | "REMOTE">("IN_PERSON");
  const [searchingTechs, setSearchingTechs] = useState(false);
  const [techResults, setTechResults] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // شبیه‌سازی درخواست به API پلتفرم‌های همکار (آچاره، استادکار و ...)
  const handleSearchAPI = () => {
    setSearchingTechs(true);
    setTimeout(() => {
      setTechResults([
        { id: "t1", name: "علی رضایی", platform: "آچاره", rating: 4.8, jobs: 124, price: 350000, eta: "۴۵ دقیقه" },
        { id: "t2", name: "محمد کریمی", platform: "استادکار", rating: 4.9, jobs: 310, price: 380000, eta: "۱ ساعت" },
        { id: "t3", name: "سینا توکلی", platform: "پین‌ورک", rating: 4.6, jobs: 89, price: 310000, eta: "۳۰ دقیقه" },
      ]);
      setSearchingTechs(false);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="liquid-glass rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">درخواست با موفقیت به پلتفرم همکار ارسال شد</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {mode === "REMOTE" 
            ? "تکنسین به زودی از طریق نرم‌افزار AnyDesk به سیستم شما متصل خواهد شد. پیامک حاوی لینک ارتباط مستقیم ارسال گردید." 
            : "تکنسین متخصص در زمان مقرر به آدرس شما اعزام خواهد شد. پیامک تایید و شماره تماس تکنسین ارسال گردید."}
        </p>
        <button onClick={() => setSubmitted(false)} className="mt-4 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition">
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="liquid-glass rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-cyan-400 p-3.5 rounded-2xl shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">خدمات تکنسین (حضوری و ریموت)</h2>
            <p className="text-xs text-slate-600 mt-1">یکپارچه با پلتفرم‌های خدماتی جهت اعزام سریع یا رفع مشکل نرم‌افزاری</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setMode("IN_PERSON")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${mode === "IN_PERSON" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Truck className="w-4 h-4 text-emerald-400" /> اعزام در محل
          </button>
          <button
            onClick={() => setMode("REMOTE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${mode === "REMOTE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Wifi className="w-4 h-4 text-amber-400" /> ریموت (AnyDesk)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ستون راست: فرم درخواست */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-5 h-5 text-emerald-600" />
            {mode === "IN_PERSON" ? "جزئیات سرویس و آدرس" : "مشخصات اتصال نرم‌افزاری"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">نوع مشکل یا سرویس:</label>
              <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900">
                {mode === "IN_PERSON" ? (
                  <>
                    <option>اسمبل کامل کیس و مدیریت کابل‌ها</option>
                    <option>نصب فیزیکی قطعات (گرافیک، رم، واترکولر)</option>
                    <option>تست سلامت قطعه کارکرده در محل خریدار</option>
                  </>
                ) : (
                  <>
                    <option>نصب درایورها، ویندوز و رفع بلواسکرین (BSOD)</option>
                    <option>آپدیت بایوس (BIOS) و تنظیمات XMP</option>
                    <option>آندرولتینگ و بهینه‌سازی دمای کارت گرافیک</option>
                  </>
                )}
              </select>
            </div>

            {mode === "IN_PERSON" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">تاریخ اعزام:</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900">
                      <option>امروز (فوری)</option>
                      <option>فردا صبح</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">ساعت حدودی:</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900">
                      <option>۱۰:۰۰ تا ۱۲:۰۰</option>
                      <option>۱۶:۰۰ تا ۱۸:۰۰</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">آدرس دقیق محل:</label>
                  <textarea rows={2} placeholder="تهران، خیابان..." className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900"></textarea>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">نرم‌افزار ارتباطی:</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900">
                    <option>AnyDesk</option>
                    <option>RustDesk</option>
                    <option>TeamViewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">آی‌دی (ID) سیستم شما:</label>
                  <input type="text" placeholder="مثلاً 123 456 789" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold font-mono tracking-widest text-slate-900" />
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2">
                  <MonitorPlay className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    پس از اتصال تکنسین، هیچ پسوردی را در اختیار وی قرار ندهید و مراحل کار را از روی مانیتور خود مشاهده کنید.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ستون چپ: فراخوانی API و انتخاب تکنسین */}
        <div className="liquid-glass-dark rounded-3xl p-6 text-white space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="font-extrabold text-cyan-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              تکنسین‌های پلتفرم‌های همکار
            </h3>
          </div>
          
          {techResults.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 leading-relaxed">
                سیستم از طریق API به پلتفرم‌های خدماتی متصل شده و برترین تکنسین‌های آزادِ نزدیک به شما را پیشنهاد می‌دهد.
              </p>
              <button 
                onClick={handleSearchAPI}
                disabled={searchingTechs}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3 rounded-xl text-sm transition"
              >
                {searchingTechs ? "در حال دریافت اطلاعات از API..." : "جستجوی تکنسین در پلتفرم‌های همکار"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {techResults.map((tech) => (
                <div 
                  key={tech.id} 
                  onClick={() => setSelectedTech(tech.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${selectedTech === tech.id ? "bg-slate-800 border-cyan-400" : "bg-slate-900 border-slate-700 hover:border-slate-500"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm">{tech.name}</span>
                      <span className="text-[10px] bg-slate-700 text-cyan-300 px-2 py-0.5 rounded">از {tech.platform}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {tech.rating}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{tech.jobs} کار موفق | زمان رسیدن: {tech.eta}</span>
                    <span className="text-emerald-400 font-extrabold">{tech.price.toLocaleString("fa-IR")} تومان</span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button 
                  disabled={!selectedTech}
                  onClick={() => setSubmitted(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg transition"
                >
                  تایید تکنسین و ثبت نهایی درخواست
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
