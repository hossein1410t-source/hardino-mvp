"use client";

import React, { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Laptop,
  Monitor,
  ShoppingBag,
  Lock,
  KeyRound,
  Sliders,
  Trash2,
  Share2,
  Copy,
  Check,
  X,
  Gauge,
  FileSpreadsheet,
} from "lucide-react";

export interface CatalogItem {
  catalog_id?: string;
  category?: string;
  brand?: string;
  model_name?: string;
  base_specs?: Record<string, unknown>;
}

export interface TestReportItem {
  overall_score?: number;
  health_grade?: string;
  detailed_metrics?: Record<string, unknown>;
}

export interface ListingItem {
  listing_id: string;
  tracking_code?: string | null;
  verification_type?: "PRE_TESTED" | "ON_DEMAND" | string;
  initial_price?: number | string;
  physical_location?: string;
  box_and_accessories?: boolean;
  seller_images?: string[];
  hardware_catalog?: CatalogItem | CatalogItem[] | null;
  test_reports?: TestReportItem | TestReportItem[] | null;
}

interface EscrowOrder {
  order_id: string;
  release_code: string;
  listing_id: string;
  tracking_code: string;
  title: string;
  category: string;
  price: number;
  escrow_fee: number;
  step: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

export interface Tab3Props {
  listings: ListingItem[];
  onSelectForEscrow?: (item: ListingItem) => void;
}

const getCatalog = (item?: ListingItem | null): CatalogItem | null => {
  if (!item?.hardware_catalog) return null;
  return Array.isArray(item.hardware_catalog)
    ? item.hardware_catalog[0] ?? null
    : item.hardware_catalog;
};

const getReport = (item?: ListingItem | null): TestReportItem | null => {
  if (!item?.test_reports) return null;
  return Array.isArray(item.test_reports)
    ? item.test_reports[0] ?? null
    : item.test_reports;
};

export function Tab3SmartBuilder({ listings, onSelectForEscrow }: Tab3Props) {
  const [subMode, setSubMode] = useState<"BUILDER" | "BUYER_HUB">("BUILDER");

  const [deviceType, setDeviceType] = useState<"DESKTOP" | "LAPTOP">("DESKTOP");
  const [usageType, setUsageType] = useState<"GAMING" | "RENDERING" | "OFFICE">("GAMING");
  const [budget, setBudget] = useState<number>(29000000);
  const [userPsu, setUserPsu] = useState<number>(650);

  const [selectedGpuId, setSelectedGpuId] = useState<string>("");
  const [selectedStorageId, setSelectedStorageId] = useState<string>("");
  const [selectedRamId, setSelectedRamId] = useState<string>("");

  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const [buyerOrders, setBuyerOrders] = useState<EscrowOrder[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hw_buyer_escrow_orders");
      if (saved) setBuyerOrders(JSON.parse(saved));
    } catch {}
  }, []);

  const saveOrders = (next: EscrowOrder[]) => {
    setBuyerOrders(next);
    try {
      localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(next));
    } catch {}
  };

  const gpuList = useMemo(
    () => listings.filter((i) => String(getCatalog(i)?.category ?? "").toUpperCase() === "GPU"),
    [listings]
  );
  const storageList = useMemo(
    () => listings.filter((i) => String(getCatalog(i)?.category ?? "").toUpperCase() === "STORAGE"),
    [listings]
  );
  const ramList = useMemo(
    () => listings.filter((i) => String(getCatalog(i)?.category ?? "").toUpperCase() === "RAM"),
    [listings]
  );

  const selectedGpu = useMemo(() => gpuList.find((i) => i.listing_id === selectedGpuId) ?? null, [gpuList, selectedGpuId]);
  const selectedStorage = useMemo(() => storageList.find((i) => i.listing_id === selectedStorageId) ?? null, [storageList, selectedStorageId]);
  const selectedRam = useMemo(() => ramList.find((i) => i.listing_id === selectedRamId) ?? null, [ramList, selectedRamId]);

  const totalCost =
    (Number(selectedGpu?.initial_price) || 0) +
    (Number(selectedStorage?.initial_price) || 0) +
    (Number(selectedRam?.initial_price) || 0);

  const estimatedWattage = useMemo(() => {
    let w = deviceType === "LAPTOP" ? 65 : 150;
    if (selectedGpu) {
      const model = `${getCatalog(selectedGpu)?.brand ?? ""} ${getCatalog(selectedGpu)?.model_name ?? ""}`.toUpperCase();
      if (model.includes("3080") || model.includes("3090") || model.includes("4080") || model.includes("4090")) w += 330;
      else if (model.includes("3070") || model.includes("3060") || model.includes("4060") || model.includes("6700")) w += 210;
      else w += 150;
    }
    if (selectedRam) w += 15;
    if (selectedStorage) w += 10;
    return w;
  }, [deviceType, selectedGpu, selectedRam, selectedStorage]);

  const powerLoadPct = Math.min(Math.round((estimatedWattage / userPsu) * 100), 100);
  const recommendedPsu = Math.round((estimatedWattage * 1.3) / 50) * 50;
  const powerHeadroom = Math.max(userPsu - estimatedWattage, 0);

  const handleAutoRecommend = () => {
    let rem = budget;
    if (deviceType === "DESKTOP") {
      const sorted = [...gpuList].sort((a, b) => Number(b.initial_price) - Number(a.initial_price));
      const cand = sorted.find((g) => Number(g.initial_price) <= rem * 0.65) ?? sorted[0] ?? null;
      if (cand) {
        setSelectedGpuId(cand.listing_id);
        rem -= Number(cand.initial_price) || 0;
      }
    } else {
      setSelectedGpuId("");
    }

    const candStorage = storageList.find((s) => Number(s.initial_price) <= rem * 0.6) ?? storageList[0] ?? null;
    if (candStorage) {
      setSelectedStorageId(candStorage.listing_id);
      rem -= Number(candStorage.initial_price) || 0;
    }

    const candRam = ramList.find((r) => Number(r.initial_price) <= rem) ?? ramList[0] ?? null;
    if (candRam) setSelectedRamId(candRam.listing_id);
  };

  const handleLockInEscrow = () => {
    const chosen = [selectedGpu, selectedStorage, selectedRam].filter(
      (x): x is ListingItem => Boolean(x)
    );
    if (chosen.length === 0) return;

    const created: EscrowOrder[] = chosen.map((item) => {
      const cat = getCatalog(item);
      const pr = Number(item.initial_price) || 0;
      return {
        order_id: `ESC-${Math.floor(10000 + Math.random() * 90000)}`,
        release_code: `${Math.floor(100000 + Math.random() * 900000)}`,
        listing_id: item.listing_id,
        tracking_code: item.tracking_code || "TH-00000",
        title: `${cat?.brand ?? ""} ${cat?.model_name ?? "قطعه"}`.trim(),
        category: String(cat?.category ?? "GPU"),
        price: pr,
        escrow_fee: Math.floor(pr * 0.03),
        step: 2,
        created_at: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      };
    });

    saveOrders([...created, ...buyerOrders]);
    setSubMode("BUYER_HUB");
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?build=${[selectedGpuId, selectedRamId, selectedStorageId].filter(Boolean).join(",")}`
      : `http://localhost:3000/?build=demo`;

  const invoiceText = `پیش‌فاکتور سیستم پیشنهادی هاردینو:
${selectedGpu ? `کارت گرافیک: ${getCatalog(selectedGpu)?.brand} ${getCatalog(selectedGpu)?.model_name} (${Number(selectedGpu.initial_price).toLocaleString("fa-IR")} ت)` : ""}
${selectedStorage ? `ذخیره‌سازی: ${getCatalog(selectedStorage)?.brand} ${getCatalog(selectedStorage)?.model_name} (${Number(selectedStorage.initial_price).toLocaleString("fa-IR")} ت)` : ""}
${selectedRam ? `رم: ${getCatalog(selectedRam)?.brand} ${getCatalog(selectedRam)?.model_name} (${Number(selectedRam.initial_price).toLocaleString("fa-IR")} ت)` : ""}
جمع کل: ${totalCost.toLocaleString("fa-IR")} تومان
توان مصرفی: ${estimatedWattage} وات (پاور مورد نیاز: ${recommendedPsu}W)`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="liquid-glass rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-slate-900 text-cyan-400 p-3.5 rounded-2xl shadow-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              سیستم‌ساز هوشمند و پنل خریداران
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              محاسبه مصرف برق، نوار لود پاور، لینک اشتراک‌گذاری سیستم و مدیریت معاملات امانی
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900/5 p-1.5 rounded-2xl border border-white/80 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSubMode("BUILDER")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition ${
              subMode === "BUILDER" ? "bg-slate-900 text-white shadow-md" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>مشاور و سیستم‌ساز هوشمند</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode("BUYER_HUB")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition ${
              subMode === "BUYER_HUB" ? "bg-slate-900 text-white shadow-md" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>پنل خریدار و سفارش‌های امانی ({buyerOrders.length})</span>
          </button>
        </div>
      </div>

      {subMode === "BUILDER" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="liquid-glass rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    تنظیمات بودجه و پروفایل کاربری
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">قطعات ناسازگار بر اساس نوع دستگاه فیلتر می‌شوند.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-extrabold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Share2 className="w-4 h-4 text-cyan-600" />
                    <span>اشتراک‌گذاری پیش‌فاکتور</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoRecommend}
                    className="bg-slate-900 hover:bg-emerald-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>چیدمان خودکار با بودجه من</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">نوع دستگاه:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeviceType("DESKTOP")}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                        deviceType === "DESKTOP" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white/80 text-slate-700 border-slate-200"
                      }`}
                    >
                      <Monitor className="w-4 h-4 text-cyan-400" /> کیس (PC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceType("LAPTOP")}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                        deviceType === "LAPTOP" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white/80 text-slate-700 border-slate-200"
                      }`}
                    >
                      <Laptop className="w-4 h-4 text-amber-400" /> لپ‌تاپ
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">هدف کاربری:</label>
                  <select
                    value={usageType}
                    onChange={(e) => setUsageType(e.target.value as "GAMING" | "RENDERING" | "OFFICE")}
                    className="w-full bg-white/90 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="GAMING">گیمینگ و استریم (تمرکز بر GPU)</option>
                    <option value="RENDERING">رندرینگ و تدوین (تمرکز بر VRAM و RAM)</option>
                    <option value="OFFICE">برنامه‌نویسی و سرعت سیستم (SSD و RAM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">توان پاور فعلی کیس:</label>
                  <select
                    value={userPsu}
                    onChange={(e) => setUserPsu(Number(e.target.value))}
                    disabled={deviceType === "LAPTOP"}
                    className="w-full bg-white/90 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 disabled:opacity-50"
                  >
                    {[450, 500, 550, 600, 650, 700, 750, 850, 1000].map((w) => (
                      <option key={w} value={w}>
                        پاور {w} وات
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-4">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-600">سقف بودجه برای ارتقا:</span>
                  <span className="text-emerald-700 font-extrabold text-sm">{budget.toLocaleString("fa-IR")} تومان</span>
                </div>
                <input
                  type="range"
                  min={3000000}
                  max={65000000}
                  step={1000000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: "GPU", title: "اسلات ۱: کارت گرافیک (GPU)", list: gpuList, selId: selectedGpuId, setSel: setSelectedGpuId, item: selectedGpu, icon: Cpu },
                { key: "STORAGE", title: "اسلات ۲: حافظه پرسرعت (SSD / NVMe / HDD)", list: storageList, selId: selectedStorageId, setSel: setSelectedStorageId, item: selectedStorage, icon: HardDrive },
                { key: "RAM", title: "اسلات ۳: حافظه رم (RAM)", list: ramList, selId: selectedRamId, setSel: setSelectedRamId, item: selectedRam, icon: MemoryStick },
              ].map((slot) => {
                const Icon = slot.icon;
                const cat = getCatalog(slot.item);
                const rep = getReport(slot.item);

                return (
                  <div key={slot.key} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-cyan-400 p-2.5 rounded-xl">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{slot.title}</h4>
                      </div>
                      {slot.item && (
                        <button
                          type="button"
                          onClick={() => slot.setSel("")}
                          className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف
                        </button>
                      )}
                    </div>

                    <select
                      value={slot.selId}
                      onChange={(e) => slot.setSel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="">-- انتخاب قطعه از آگهی‌های فعال در بازارچه --</option>
                      {slot.list.map((it) => {
                        const c = getCatalog(it);
                        const isPre = it.verification_type === "PRE_TESTED";
                        return (
                          <option key={it.listing_id} value={it.listing_id}>
                            {isPre ? "[تست طلایی] " : "[تست امانی] "}
                            {c?.brand} {c?.model_name} — {Number(it.initial_price).toLocaleString("fa-IR")} تومان
                          </option>
                        );
                      })}
                    </select>

                    {slot.item && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold bg-slate-900 text-cyan-400 px-2 py-0.5 rounded">
                              {cat?.brand}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm">{cat?.model_name}</span>
                            <span className="font-mono text-[11px] bg-white border px-2 py-0.5 rounded text-slate-500">
                              {slot.item.tracking_code}
                            </span>
                          </div>
                          {rep?.overall_score && (
                            <span className="text-[11px] font-bold text-emerald-700">
                              نمره سلامت کارشناسی: {rep.overall_score}٪ ({rep.health_grade})
                            </span>
                          )}
                        </div>
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {Number(slot.item.initial_price).toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="liquid-glass-dark text-white rounded-3xl p-6 space-y-5 sticky top-24 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <h3 className="font-extrabold text-sm text-cyan-400 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  سلامت و مصرف توان پاور
                </h3>
                <span className="font-mono text-xs bg-slate-800 text-amber-300 px-2.5 py-1 rounded-lg">
                  {estimatedWattage} W / {userPsu} W
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">فشار وارده به پاور کیس:</span>
                  <span
                    className={`font-mono font-extrabold ${
                      powerLoadPct <= 75 ? "text-emerald-400" : powerLoadPct <= 90 ? "text-amber-400" : "text-red-400"
                    }`}
                  >
                    {powerLoadPct}٪
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      powerLoadPct <= 75
                        ? "bg-gradient-to-l from-emerald-400 to-teal-500"
                        : powerLoadPct <= 90
                        ? "bg-gradient-to-l from-amber-400 to-orange-500"
                        : "bg-gradient-to-l from-red-500 to-rose-600 animate-pulse"
                    }`}
                    style={{ width: `${powerLoadPct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>حاشیه امن: {powerHeadroom}W</span>
                  <span className={powerLoadPct <= 80 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {powerLoadPct <= 80 ? "راندمان طلایی (ایمن)" : "نزدیک به پیک مصرف"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                {deviceType === "LAPTOP" && selectedGpu && (
                  <div className="text-amber-300 flex items-start gap-1.5 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>کارت گرافیک دسکتاپ فقط با داک eGPU اکسترنال روی لپ‌تاپ قابل استفاده است.</span>
                  </div>
                )}
                <div className="text-emerald-300 flex items-start gap-1.5 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>پاور پیشنهادی استاندارد در پیک مصرف: {recommendedPsu} وات.</span>
                </div>
              </div>

              <div className="border-t border-slate-700/80 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">مجموع قطعات انتخابی:</span>
                  <span className="text-lg font-extrabold text-white">
                    {totalCost.toLocaleString("fa-IR")}{" "}
                    <span className="text-xs font-normal text-slate-400">تومان</span>
                  </span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">وضعیت با بودجه:</span>
                  <span className={totalCost <= budget ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                    {totalCost <= budget
                      ? `${(budget - totalCost).toLocaleString("fa-IR")} تومان زیر سقف بودجه`
                      : `${(totalCost - budget).toLocaleString("fa-IR")} تومان بالاتر از بودجه`}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={totalCost === 0}
                  onClick={handleLockInEscrow}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>قفل وجه در صندوق امانی و ثبت سفارش</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {subMode === "BUYER_HUB" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                سفارش‌های فعال شما در صندوق امانی (Escrow)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                وجه شما تا زمان تحویل کالا و اعلام کد ترخیص در حساب امانی پلتفرم قفل می‌ماند.
              </p>
            </div>
          </div>

          {buyerOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">هنوز سفارشی در صندوق امانی ثبت نکرده‌اید.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {buyerOrders.map((ord) => (
                <div key={ord.order_id} className="liquid-glass rounded-2xl p-5 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-cyan-400 font-mono text-xs px-2.5 py-0.5 rounded-md font-bold">
                        {ord.order_id}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{ord.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      مبلغ امانی: <strong className="text-slate-900 font-extrabold">{ord.price.toLocaleString("fa-IR")} تومان</strong>
                    </p>
                  </div>

                  <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md">
                    <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-400">کد ۶ رقمی ترخیص شما (خریدار):</span>
                      <span className="font-mono font-extrabold text-base text-amber-400 tracking-widest">{ord.release_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
                <span>اشتراک‌گذاری کانفیگ و پیش‌فاکتور رسمی</span>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <QRCodeSVG value={shareUrl} size={110} />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">لینک مستقیم این سیستم:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shareUrl, true)}
                    className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "کپی شد" : "کپی لینک"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">متن آماده برای ارسال در پیام‌رسان‌ها:</label>
                <textarea
                  readOnly
                  rows={4}
                  value={invoiceText}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed text-slate-800 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(invoiceText, false)}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText ? "متن پیش‌فاکتور کپی شد!" : "کپی متن کامل پیش‌فاکتور"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tab3SmartBuilder;
