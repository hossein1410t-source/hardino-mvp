"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";
import {
  PlusCircle,
  Package,
  Trash2,
  Edit3,
  QrCode,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  HardDrive,
  MemoryStick,
  Calculator,
  Image as ImageIcon,
  ArrowLeft,
  X,
  Check,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Tab2Props {
  listings: any[];
  onRefresh: () => void;
  onGoToMarket: () => void;
}

const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  GPU: ["ASUS", "MSI", "Gigabyte", "Zotac", "Sapphire", "XFX", "EVGA", "Palit"],
  STORAGE: ["Samsung", "Western Digital", "Crucial", "Kingston", "Seagate", "ADATA", "Lexar"],
  RAM: ["Corsair", "G.Skill", "Kingston", "Crucial", "TeamGroup", "ADATA"],
};

const SAMPLE_IMAGES: Record<string, string> = {
  GPU: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
  STORAGE: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
  RAM: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80",
};

export default function Tab2SellerHub({ listings, onRefresh, onGoToMarket }: Tab2Props) {
  const [subTab, setSubTab] = useState<"NEW" | "MANAGE">("NEW");

  // استیت‌های فرم ثبت قطعه (آبشاری + دستی)
  const [category, setCategory] = useState<"GPU" | "STORAGE" | "RAM">("GPU");
  const [selectedBrand, setSelectedBrand] = useState<string>("ASUS");
  const [customBrand, setCustomBrand] = useState<string>("");
  const [modelName, setModelName] = useState<string>("");

  // مشخصات جزئی پویا (base_specs)
  const [gpuVram, setGpuVram] = useState<string>("8GB");
  const [gpuMemoryType, setGpuMemoryType] = useState<string>("GDDR6");
  const [gpuPsu, setGpuPsu] = useState<string>("650W");
  const [gpuFans, setGpuFans] = useState<string>("2");

  const [storageInterface, setStorageInterface] = useState<string>("M.2 NVMe PCIe 4.0");
  const [storageCapacity, setStorageCapacity] = useState<string>("1TB");

  const [ramType, setRamType] = useState<string>("DDR4");
  const [ramCapacity, setRamCapacity] = useState<string>("16GB (2x8GB)");
  const [ramSpeed, setRamSpeed] = useState<string>("3200MHz");

  // اطلاعات مالی و لجستیک
  const [price, setPrice] = useState<string>("12500000");
  const [hasBox, setHasBox] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [verificationType, setVerificationType] = useState<"PRE_TESTED" | "ON_DEMAND">("PRE_TESTED");

  // استیت پاسخ سرور پایتون (FastAPI)
  const [payoutData, setPayoutData] = useState<{
    platform_fee: number;
    test_fee: number;
    net_payout: number;
    tracking_code: string;
    engine: string;
  } | null>(null);

  // وضعیت ثبت و رسید QR
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdReceipt, setCreatedReceipt] = useState<any | null>(null);

  // استیت‌های مدیریت آگهی‌های من (حذف / ویرایش / بارکد)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>("");
  const [qrModalItem, setQrModalItem] = useState<any | null>(null);

  // تغییر برند پیش‌فرض هنگام تغییر دسته‌بندی
  useEffect(() => {
    setSelectedBrand(BRANDS_BY_CATEGORY[category][0]);
    setCustomBrand("");
  }, [category]);

  // استعلام زنده کارمزد از بک‌اند پایتون (FastAPI روی پورت 8000)
  useEffect(() => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) {
      setPayoutData(null);
      return;
    }

    async function calculateWithPython() {
      try {
        const res = await fetch("/api/calculate-seller-payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: numericPrice,
            verification_type: verificationType,
          }),
        });
        if (!res.ok) throw new Error("Python server not reachable");
        const data = await res.json();
        setPayoutData({ ...data, engine: "Python FastAPI 🐍" });
      } catch {
        // Fallback در صورتی که سرور پایتون خاموش باشد
        const platform_fee = Math.floor(numericPrice * 0.03);
        const test_fee = verificationType === "PRE_TESTED" ? 250000 : 0;
        const net_payout = Math.max(numericPrice - platform_fee - test_fee, 0);
        const tracking_code = `TH-${Math.floor(10000 + Math.random() * 90000)}`;
        setPayoutData({
          platform_fee,
          test_fee,
          net_payout,
          tracking_code,
          engine: "محاسبه محلی (پایتون خاموش)",
        });
      }
    }

    calculateWithPython();
  }, [price, verificationType]);

  // ثبت نهایی قطعه در کاتالوگ و ایجاد آگهی در دیتابیس
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = selectedBrand === "CUSTOM" ? customBrand.trim() : selectedBrand;
    if (!finalBrand || !modelName.trim() || !Number(price)) {
      alert("لطفاً برند، مدل دقیق قطعه و قیمت را وارد کنید.");
      return;
    }

    setSubmitting(true);
    try {
      // ۱. ساخت آبجکت مشخصات فنی بر اساس دسته قطعه
      let base_specs: Record<string, any> = {};
      if (category === "GPU") {
        base_specs = {
          vram: gpuVram,
          memory_type: gpuMemoryType,
          recommended_psu: gpuPsu,
          fans_count: Number(gpuFans),
        };
      } else if (category === "STORAGE") {
        base_specs = {
          interface: storageInterface,
          capacity: storageCapacity,
        };
      } else if (category === "RAM") {
        base_specs = {
          type: ramType,
          capacity: ramCapacity,
          speed: ramSpeed,
        };
      }

      // ۲. ثبت خودکار قطعه در جدول hardware_catalog (Auto-Cataloging)
      const { data: catalogRow, error: catError } = await supabase
        .from("hardware_catalog")
        .insert([
          {
            category,
            brand: finalBrand,
            model_name: modelName.trim(),
            base_specs,
          },
        ])
        .select()
        .single();

      if (catError) throw catError;

      // ۳. پیدا کردن فروشنده آزمایشی
      const { data: userRow } = await supabase
        .from("users")
        .select("user_id")
        .limit(1)
        .single();

      const trackingCode =
        payoutData?.tracking_code || `TH-${Math.floor(10000 + Math.random() * 90000)}`;
      const finalImage = imageUrl.trim() || SAMPLE_IMAGES[category];

      // ۴. ثبت آگهی در جدول listings
      const { data: newListing, error: listError } = await supabase
        .from("listings")
        .insert([
          {
            tracking_code: trackingCode,
            seller_id: userRow?.user_id || null,
            catalog_id: catalogRow.catalog_id,
            verification_type: verificationType,
            initial_price: Number(price),
            physical_location:
              verificationType === "PRE_TESTED" ? "AT_TEST_CENTER" : "WITH_SELLER",
            box_and_accessories: hasBox,
            seller_images: [finalImage],
          },
        ])
        .select("*, hardware_catalog(*)")
        .single();

      if (listError) throw listError;

      setCreatedReceipt(newListing);
      onRefresh();
    } catch (err: any) {
      alert("خطا در ثبت آگهی: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // حذف آگهی از دیتابیس
  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!window.confirm(`آیا از حذف آگهی «${title}» مطمئن هستید؟`)) return;
    const { error } = await supabase.from("listings").delete().eq("listing_id", listingId);
    if (error) {
      alert("خطا در حذف آگهی: " + error.message);
    } else {
      onRefresh();
    }
  };

  // ذخیره قیمت ویرایش‌شده
  const handleSavePrice = async (listingId: string) => {
    if (!Number(editPriceValue)) return;
    const { error } = await supabase
      .from("listings")
      .update({ initial_price: Number(editPriceValue) })
      .eq("listing_id", listingId);

    if (!error) {
      setEditingId(null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* نوار بالایی پنل فروشنده: سوییچ بین ثبت آگهی جدید و مدیریت آگهی‌های من */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">پنل جامع فروشندگان</h2>
            <p className="text-xs text-slate-500">
              ثبت مشخصات دقیق قطعه، دریافت بارکد پذیرش مرکز تست و مدیریت آگهی‌های فعال
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setSubTab("NEW");
              setCreatedReceipt(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              subTab === "NEW"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>ثبت قطعه جدید</span>
          </button>

          <button
            onClick={() => setSubTab("MANAGE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              subTab === "MANAGE"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>مدیریت آگهی‌های من ({listings.length})</span>
          </button>
        </div>
      </div>

      {/* بخش اول: فرم ثبت آگهی جدید */}
      {subTab === "NEW" && !createdReceipt && (
        <form onSubmit={handleCreateListing} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون راست (۲ ستون عرض): مشخصات قطعه و جزئیات فنی */}
          <div className="lg:col-span-2 space-y-6">
            {/* گام ۱: نوع قطعه، برند و مدل */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="bg-slate-900 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
                    ۱
                  </span>
                  مشخصات اصلی قطعه سخت‌افزاری
                </h3>
                <span className="text-xs text-slate-400">ورود آزاد یا انتخاب از لیست</span>
              </div>

              {/* انتخاب نوع قطعه */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  ۱. انتخاب نوع قطعه:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "GPU", label: "کارت گرافیک (GPU)", icon: Cpu },
                    { id: "STORAGE", label: "حافظه (SSD / HDD)", icon: HardDrive },
                    { id: "RAM", label: "حافظه رم (RAM)", icon: MemoryStick },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = category === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setCategory(item.id as any)}
                        className={`p-3.5 rounded-xl border text-right transition flex items-center gap-3 ${
                          active
                            ? "bg-slate-900 border-slate-900 text-white shadow-md"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                        <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* انتخاب برند و مدل دقیق */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ۲. برند سازنده:
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    {BRANDS_BY_CATEGORY[category].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="CUSTOM">➕ سایر برندها (تایپ دستی...)</option>
                  </select>

                  {selectedBrand === "CUSTOM" && (
                    <input
                      type="text"
                      placeholder="نام برند را تایپ کنید (مثلاً PNY یا Inno3D)"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="mt-2 w-full bg-amber-50/50 border border-amber-400 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ۳. مدل دقیق قطعه (تایپ آزاد):
                  </label>
                  <input
                    type="text"
                    placeholder={
                      category === "GPU"
                        ? "مثلاً: RTX 3060 Ti TUF Gaming OC"
                        : category === "STORAGE"
                        ? "مثلاً: 980 Pro M.2 NVMe"
                        : "مثلاً: Vengeance LPX Dual"
                    }
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>
              </div>

              {/* گام ۲: فیلدهای فنی اختصاصی هر دسته */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-extrabold text-slate-700">
                  ۴. مشخصات فنی جزئی ({category === "GPU" ? "کارت گرافیک" : category === "STORAGE" ? "حافظه" : "رم"}):
                </p>

                {category === "GPU" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">حجم حافظه (VRAM)</label>
                      <input
                        type="text"
                        value={gpuVram}
                        onChange={(e) => setGpuVram(e.target.value)}
                        placeholder="8GB"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">نوع حافظه</label>
                      <select
                        value={gpuMemoryType}
                        onChange={(e) => setGpuMemoryType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      >
                        <option value="GDDR6">GDDR6</option>
                        <option value="GDDR6X">GDDR6X</option>
                        <option value="GDDR5">GDDR5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">پاور پیشنهادی</label>
                      <input
                        type="text"
                        value={gpuPsu}
                        onChange={(e) => setGpuPsu(e.target.value)}
                        placeholder="650W"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">تعداد فن</label>
                      <select
                        value={gpuFans}
                        onChange={(e) => setGpuFans(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      >
                        <option value="1">۱ فن</option>
                        <option value="2">۲ فن</option>
                        <option value="3">۳ فن</option>
                      </select>
                    </div>
                  </div>
                )}

                {category === "STORAGE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">نوع رابط اتصال</label>
                      <select
                        value={storageInterface}
                        onChange={(e) => setStorageInterface(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      >
                        <option value="M.2 NVMe PCIe 4.0">M.2 NVMe PCIe 4.0</option>
                        <option value="M.2 NVMe PCIe 3.0">M.2 NVMe PCIe 3.0</option>
                        <option value="SATA 2.5-inch SSD">SATA 2.5-inch SSD</option>
                        <option value="HDD 3.5-inch">HDD 3.5-inch (هارد مکانیکی)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">ظرفیت حافظه</label>
                      <input
                        type="text"
                        value={storageCapacity}
                        onChange={(e) => setStorageCapacity(e.target.value)}
                        placeholder="مثلاً 1TB یا 512GB"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {category === "RAM" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">نسل رم</label>
                      <select
                        value={ramType}
                        onChange={(e) => setRamType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      >
                        <option value="DDR4">DDR4</option>
                        <option value="DDR5">DDR5</option>
                        <option value="DDR3">DDR3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">ظرفیت و چیدمان</label>
                      <input
                        type="text"
                        value={ramCapacity}
                        onChange={(e) => setRamCapacity(e.target.value)}
                        placeholder="16GB (2x8GB)"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">فرکانس (Speed)</label>
                      <input
                        type="text"
                        value={ramSpeed}
                        onChange={(e) => setRamSpeed(e.target.value)}
                        placeholder="3200MHz"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* گام ۲: قیمت، جعبه و تصویر */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
                  ۲
                </span>
                قیمت‌گذاری و تصویر قطعه
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    قیمت فروش مد نظر شما (تومان):
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900"
                    required
                  />
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    معادل: {Number(price || 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                    <input
                      type="checkbox"
                      checked={hasBox}
                      onChange={(e) => setHasBox(e.target.checked)}
                      className="w-4 h-4 accent-slate-900 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      جعبه و متعلقات اصلی قطعه موجود و سالم است
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  لینک تصویر قطعه (اختیاری - در صورت خالی بودن، تصویر استاندارد قرار می‌گیرد):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl(SAMPLE_IMAGES[category])}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    قرار دادن عکس نمونه
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ستون چپ (۱ ستون عرض): انتخاب مدل تست + محاسبه زنده با پایتون */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
                  ۳
                </span>
                روش اعتمادسازی و تست
              </h3>

              <div className="space-y-3">
                <div
                  onClick={() => setVerificationType("PRE_TESTED")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                    verificationType === "PRE_TESTED"
                      ? "bg-amber-50/60 border-amber-500"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
                      ارسال فوری به مرکز تست (نشان طلایی)
                    </span>
                    {verificationType === "PRE_TESTED" && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    قطعه را هم‌اکنون به مرکز تست تحویل می‌دهید؛ آگهی با کادر طلایی در صدر ویترین قرار گرفته و ۳ برابر سریع‌تر فروش می‌رود.
                  </p>
                </div>

                <div
                  onClick={() => setVerificationType("ON_DEMAND")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                    verificationType === "ON_DEMAND"
                      ? "bg-cyan-50/60 border-cyan-600"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-600" />
                      تست پس از پیدا شدن خریدار (امانی)
                    </span>
                    {verificationType === "ON_DEMAND" && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    قطعه نزد شما می‌ماند؛ هر زمان خریداری پول را در صندوق امانی قفل کرد، قطعه را برای تست ارسال می‌کنید (هزینه تست با خریدار).
                  </p>
                </div>
              </div>

              {/* باکس محاسبه زنده کارمزد متصل به سرور پایتون */}
              {payoutData && (
                <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4" />
                      محاسبه شفاف تسویه فروشنده
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {payoutData.engine}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>قیمت ثبت‌شده:</span>
                    <span>{Number(price).toLocaleString("fa-IR")} تومان</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>کارمزد درگاه امانی (۳٪):</span>
                    <span>{payoutData.platform_fee.toLocaleString("fa-IR")}- تومان</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>هزینه مرکز تست (سهم فروشنده):</span>
                    <span>
                      {payoutData.test_fee === 0
                        ? "رایگان (بر عهده خریدار)"
                        : `${payoutData.test_fee.toLocaleString("fa-IR")}- تومان`}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-400 text-sm pt-2 border-t border-slate-800">
                    <span>خالص دریافتی شما:</span>
                    <span>{payoutData.net_payout.toLocaleString("fa-IR")} تومان</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-900/10 transition"
              >
                {submitting ? "در حال ثبت در دیتابیس..." : "ثبت نهایی آگهی و دریافت بارکد پذیرش"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* رسید نهایی پس از ثبت موفق آگهی */}
      {subTab === "NEW" && createdReceipt && (
        <div className="max-w-xl mx-auto bg-white border-2 border-emerald-500 rounded-2xl p-8 text-center shadow-xl space-y-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
              آگهی با موفقیت در بازارچه ثبت شد
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-3">
              {createdReceipt.hardware_catalog?.brand} {createdReceipt.hardware_catalog?.model_name}
            </h3>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center space-y-3">
            <QRCodeSVG value={createdReceipt.tracking_code} size={150} />
            <div className="text-center">
              <p className="text-xs text-slate-500">کد رهگیری اختصاصی قطعه در مرکز تست:</p>
              <p className="text-2xl font-mono font-extrabold text-slate-900 tracking-wider mt-1">
                {createdReceipt.tracking_code}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            هنگام تحویل یا ارسال بسته به مرکز تست تخصصی، این بارکد را نشان دهید یا کد{" "}
            <strong className="font-mono text-slate-900">{createdReceipt.tracking_code}</strong> را روی جعبه یادداشت کنید.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onGoToMarket}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <span>مشاهده آگهی در ویترین بازارچه</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCreatedReceipt(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs"
            >
              ثبت قطعه دیگر
            </button>
          </div>
        </div>
      )}

      {/* بخش دوم: مدیریت آگهی‌های من (حذف، ویرایش قیمت و مشاهده بارکد) */}
      {subTab === "MANAGE" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">
              لیست آگهی‌های ثبت‌شده شما ({listings.length})
            </h3>
            <span className="text-xs text-slate-500">
              امکان تغییر آنی قیمت، دریافت مجدد بارکد یا حذف آگهی
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              هنوز هیچ آگهی ثبت نکرده‌اید.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {listings.map((item) => {
                const isEditing = editingId === item.listing_id;
                const specs = item.hardware_catalog?.base_specs || {};

                return (
                  <div
                    key={item.listing_id}
                    className="py-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.seller_images?.[0] ||
                          SAMPLE_IMAGES[item.hardware_catalog?.category || "GPU"]
                        }
                        alt={item.hardware_catalog?.model_name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                            {item.hardware_catalog?.brand}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {item.hardware_catalog?.model_name}
                          </h4>
                          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {item.tracking_code}
                          </span>
                        </div>

                        {/* نمایش مشخصات فنی ثبت‌شده */}
                        <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-slate-500">
                          {Object.entries(specs).map(([k, v]) => (
                            <span key={k} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                              {k}: <strong>{String(v)}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* بخش قیمت و دکمه‌های عملیات */}
                    <div className="flex flex-wrap items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-36 bg-slate-50 border border-slate-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                          />
                          <button
                            onClick={() => handleSavePrice(item.listing_id)}
                            className="bg-emerald-600 text-white p-1.5 rounded-lg"
                            title="ذخیره"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 text-slate-700 p-1.5 rounded-lg"
                            title="انصراف"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-left ml-2">
                          <span className="block text-[11px] text-slate-400">قیمت فعلی:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {Number(item.initial_price).toLocaleString("fa-IR")} تومان
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setEditingId(item.listing_id);
                          setEditPriceValue(String(item.initial_price));
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ویرایش قیمت</span>
                      </button>

                      <button
                        onClick={() => setQrModalItem(item)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>بارکد پذیرش</span>
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteListing(
                            item.listing_id,
                            `${item.hardware_catalog?.brand} ${item.hardware_catalog?.model_name}`
                          )
                        }
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* پنجره Modal نمایش بارکد پذیرش برای آگهی‌های قبلی */}
      {qrModalItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-slate-900 text-sm">
                برچسب پذیرش مرکز تست
              </span>
              <button
                onClick={() => setQrModalItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center space-y-2 border border-slate-200">
              <QRCodeSVG value={qrModalItem.tracking_code} size={160} />
              <p className="font-mono font-extrabold text-lg text-slate-900 mt-2">
                {qrModalItem.tracking_code}
              </p>
              <p className="text-xs text-slate-500">
                {qrModalItem.hardware_catalog?.brand} {qrModalItem.hardware_catalog?.model_name}
              </p>
            </div>
            <button
              onClick={() => setQrModalItem(null)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      )}
    </div>
  );
}