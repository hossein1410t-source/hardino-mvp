"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const PAYOUT_API = "http://localhost:8000/api/calculate-seller-payout";
const LOCAL_FEE_RATE = 0.03;
const OTHER = "__OTHER__";

type Metrics = Record<string, unknown>;
type Catalog = {
  catalog_id?: string | number | null;
  category?: string | null;
  brand?: string | null;
  model_name?: string | null;
  base_specs?: Metrics | null;
};
type Listing = {
  listing_id: string;
  tracking_code?: string | null;
  verification_type?: string | null;
  initial_price?: number | string | null;
  physical_location?: string | null;
  seller_images?: string[] | null;
  hardware_catalog?: Catalog | Catalog[] | null;
};
type Cat = "GPU" | "STORAGE" | "RAM";
type VType = "PRE_TESTED" | "ON_DEMAND";
type Payout = { platform_fee: number; net_payout: number; tracking_code: string; source: "python" | "local"; key: string };
type SpecField = { key: string; label: string; options?: { v: string; t: string }[]; placeholder?: string; required?: boolean; num?: boolean };
type Msg = { type: "ok" | "err"; text: string } | null;

const CATS: { key: Cat; label: string; icon: string }[] = [
  { key: "GPU", label: "کارت گرافیک (GPU)", icon: "🎮" },
  { key: "STORAGE", label: "حافظه (STORAGE)", icon: "💾" },
  { key: "RAM", label: "رم (RAM)", icon: "🧩" },
];

const BRANDS: Record<Cat, string[]> = {
  GPU: ["ASUS", "MSI", "Gigabyte", "Zotac", "Sapphire", "XFX", "PowerColor", "Palit", "Gainward", "Inno3D", "EVGA", "NVIDIA"],
  STORAGE: ["Samsung", "Western Digital", "Seagate", "Kingston", "Crucial", "ADATA", "SK hynix", "Corsair", "Lexar", "Toshiba"],
  RAM: ["Corsair", "G.Skill", "Kingston", "Crucial", "TeamGroup", "ADATA", "Patriot", "Samsung", "Lexar"],
};

const opts = (vals: (string | number)[], fmt?: (v: string) => string) =>
  vals.map((v) => ({ v: String(v), t: fmt ? fmt(String(v)) : String(v) }));
const fmtCap = (v: string) => (Number(v) >= 1024 ? `${Number(v) / 1024}TB` : `${v}GB`);

const SPEC_FIELDS: Record<Cat, SpecField[]> = {
  GPU: [
    { key: "memory_gb", label: "حجم VRAM", options: opts([2, 3, 4, 6, 8, 10, 12, 16, 24], (v) => `${v}GB`), required: true, num: true },
    { key: "recommended_psu_w", label: "توان پاور پیشنهادی (وات)", placeholder: "650", num: true },
    { key: "fan_count", label: "تعداد فن", options: opts([0, 1, 2, 3]), num: true },
  ],
  STORAGE: [
    { key: "interface", label: "نوع رابط", options: opts(["M.2 NVMe", "SATA SSD", "HDD"]), required: true },
    { key: "capacity_gb", label: "ظرفیت", options: opts([128, 256, 512, 1024, 2048, 4096, 8192], fmtCap), required: true, num: true },
  ],
  RAM: [
    { key: "generation", label: "نسل", options: opts(["DDR3", "DDR4", "DDR5"]), required: true },
    { key: "capacity_gb", label: "ظرفیت کل", options: opts([4, 8, 16, 32, 64, 128], (v) => `${v}GB`), required: true, num: true },
    { key: "speed_mhz", label: "فرکانس", options: opts([2133, 2400, 2666, 3000, 3200, 3600, 4800, 5200, 5600, 6000, 6400], (v) => `${v}MHz`), num: true },
    { key: "form_factor", label: "فرم‌فاکتور", options: opts(["DIMM", "SODIMM"], (v) => (v === "DIMM" ? "DIMM (دسکتاپ)" : "SODIMM (لپ‌تاپ)")) },
  ],
};

const EXTRA_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70",
  "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=70",
];
const SAMPLE_IMAGES: Record<Cat, string[]> = {
  GPU: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=70", ...EXTRA_IMAGES],
  STORAGE: ["https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=70", ...EXTRA_IMAGES],
  RAM: ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=70", ...EXTRA_IMAGES],
};

const LOCATIONS: Record<string, string> = {
  WITH_SELLER: "نزد فروشنده",
  AT_TEST_CENTER: "در مرکز تست",
  IN_TRANSIT: "در مسیر ارسال",
  WITH_BUYER: "تحویل خریدار",
};

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";
const btnPrimary =
  "rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300";
const btnGhost =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const fa = (v: unknown, suffix = "") => {
  const n = toNum(v);
  return n === null ? "—" : n.toLocaleString("fa-IR") + suffix;
};
const normDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
const randCode = () => `TH-${Math.floor(10000 + Math.random() * 90000)}`;
function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

async function calculatePayout(price: number, verificationType: VType, signal?: AbortSignal): Promise<Payout> {
  const key = `${price}|${verificationType}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  signal?.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetch(PAYOUT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, verification_type: verificationType }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Record<string, unknown>;
    const fee = toNum(data.platform_fee);
    const net = toNum(data.net_payout);
    if (fee === null || net === null) throw new Error("bad response");
    const code = typeof data.tracking_code === "string" && data.tracking_code.trim() ? data.tracking_code.trim() : randCode();
    return { platform_fee: fee, net_payout: net, tracking_code: code, source: "python", key };
  } catch {
    const fee = Math.round(price * LOCAL_FEE_RATE);
    return { platform_fee: fee, net_payout: price - fee, tracking_code: randCode(), source: "local", key };
  } finally {
    clearTimeout(timer);
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-extrabold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-2xl text-slate-400">🖼️</div>;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />;
}

export default function Tab2SellerHub({
  listings,
  onRefresh,
  onGoToMarket,
}: {
  listings: Listing[];
  onRefresh: () => void | Promise<void>;
  onGoToMarket: () => void;
}) {
  const [sub, setSub] = useState<"new" | "manage">("new");

  const [cat, setCat] = useState<Cat>("GPU");
  const [brandSel, setBrandSel] = useState("");
  const [brandCustom, setBrandCustom] = useState("");
  const [model, setModel] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [price, setPrice] = useState("");
  const [box, setBox] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [vtype, setVtype] = useState<VType>("ON_DEMAND");
  const [calc, setCalc] = useState<Payout | null>(null);
  const [calcBusy, setCalcBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [receipt, setReceipt] = useState<{ code: string; model: string; vtype: VType; fee: number; net: number } | null>(null);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [qrItem, setQrItem] = useState<Listing | null>(null);

  const priceNum = Number(price);
  const priceOk = price !== "" && priceNum > 0;

  useEffect(() => {
    if (!priceOk) {
      setCalc(null);
      setCalcBusy(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setCalcBusy(true);
      const r = await calculatePayout(priceNum, vtype, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setCalc(r);
      setCalcBusy(false);
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [priceNum, priceOk, vtype]);

  const pickCat = (c: Cat) => {
    setCat(c);
    setBrandSel("");
    setBrandCustom("");
    setSpecs({});
  };

  const resetForm = () => {
    setCat("GPU");
    setBrandSel("");
    setBrandCustom("");
    setModel("");
    setSpecs({});
    setPrice("");
    setBox(true);
    setImageUrl("");
    setVtype("ON_DEMAND");
    setCalc(null);
    setFormError("");
    setReceipt(null);
  };

  const submit = async () => {
    const brand = brandSel === OTHER ? brandCustom.trim() : brandSel;
    const missing = SPEC_FIELDS[cat].find((f) => f.required && !specs[f.key]);
    if (!brand) return setFormError("برند را انتخاب کنید یا نام آن را تایپ کنید.");
    if (!model.trim()) return setFormError("نام مدل قطعه را وارد کنید.");
    if (missing) return setFormError(`فیلد «${missing.label}» را پر کنید.`);
    if (!priceOk) return setFormError("قیمت معتبر وارد کنید.");

    setFormError("");
    setSubmitting(true);
    let createdCatalogId: string | number | null = null;
    try {
      const payout = calc && calc.key === `${priceNum}|${vtype}` ? calc : await calculatePayout(priceNum, vtype);

      const baseSpecs: Metrics = {};
      SPEC_FIELDS[cat].forEach((f) => {
        const v = specs[f.key];
        if (v) baseSpecs[f.key] = f.num ? Number(v) : v;
      });

      let catalogId: string | number | null = null;
      const { data: ins, error: catErr } = await supabase
        .from("hardware_catalog")
        .insert({ category: cat, brand, model_name: model.trim(), base_specs: baseSpecs })
        .select("catalog_id")
        .single();
      if (!catErr && ins) {
        catalogId = ins.catalog_id;
        createdCatalogId = ins.catalog_id;
      } else if (catErr?.code === "23505") {
        const { data: ex } = await supabase
          .from("hardware_catalog")
          .select("catalog_id")
          .eq("category", cat)
          .eq("brand", brand)
          .eq("model_name", model.trim())
          .limit(1);
        catalogId = ex?.[0]?.catalog_id ?? null;
      }
      if (catalogId === null) throw new Error(catErr?.message ?? "ثبت قطعه در کاتالوگ انجام نشد.");

      let sellerId: unknown = null;
      const { data: users } = await supabase.from("users").select("*").limit(1);
      const u = (users?.[0] ?? null) as Record<string, unknown> | null;
      if (u) sellerId = u.user_id ?? u.id ?? null;

      const record = {
        catalog_id: catalogId,
        seller_id: sellerId,
        verification_type: vtype,
        initial_price: priceNum,
        physical_location: vtype === "PRE_TESTED" ? "AT_TEST_CENTER" : "WITH_SELLER",
        box_and_accessories: box,
        seller_images: [imageUrl.trim() || SAMPLE_IMAGES[cat][0]],
      };

      let code = payout.tracking_code;
      let insertError: { message: string; code?: string } | null = null;
      for (let n = 0; n < 3; n++) {
        if (n > 0) code = randCode();
        const { error } = await supabase.from("listings").insert({ ...record, tracking_code: code });
        insertError = error;
        if (!error || error.code !== "23505") break;
      }
      if (insertError) throw new Error(insertError.message);

      createdCatalogId = null;
      await onRefresh();
      setReceipt({ code, model: model.trim(), vtype, fee: payout.platform_fee, net: payout.net_payout });
    } catch (e) {
      if (createdCatalogId !== null) {
        await supabase.from("hardware_catalog").delete().eq("catalog_id", createdCatalogId);
      }
      setFormError(e instanceof Error ? e.message : "ثبت آگهی انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  const savePrice = async (item: Listing) => {
    const n = Number(editPrice);
    if (!(n > 0)) return setMsg({ type: "err", text: "قیمت معتبر وارد کنید." });
    setBusyId(item.listing_id);
    setMsg(null);
    const { data, error } = await supabase
      .from("listings")
      .update({ initial_price: n })
      .eq("listing_id", item.listing_id)
      .select("listing_id");
    setBusyId(null);
    if (error) return setMsg({ type: "err", text: error.message });
    if (!data || data.length === 0) return setMsg({ type: "err", text: "قیمت تغییر نکرد؛ احتمالاً سیاست دسترسی (RLS) اجازه ویرایش نمی‌دهد." });
    setEditingId(null);
    setMsg({ type: "ok", text: "قیمت آگهی به‌روزرسانی شد." });
    await onRefresh();
  };

  const removeListing = async (item: Listing) => {
    setBusyId(item.listing_id);
    setMsg(null);
    const { data, error } = await supabase.from("listings").delete().eq("listing_id", item.listing_id).select("listing_id");
    setBusyId(null);
    setConfirmId(null);
    if (error) return setMsg({ type: "err", text: error.message });
    if (!data || data.length === 0) return setMsg({ type: "err", text: "آگهی حذف نشد؛ احتمالاً سیاست دسترسی (RLS) اجازه حذف نمی‌دهد." });
    setMsg({ type: "ok", text: "آگهی حذف شد." });
    await onRefresh();
  };

  const q = search.trim().toLowerCase();
  const mine = listings.filter((l) => {
    if (!q) return true;
    const c = one(l.hardware_catalog);
    return [c?.model_name, c?.brand, l.tracking_code].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-2">
        {([
          ["new", "➕ ثبت قطعه جدید برای فروش"],
          ["manage", `📦 مدیریت آگهی‌های من (حذف / ویرایش قیمت / بارکد) · ${listings.length.toLocaleString("fa-IR")}`],
        ] as const).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setSub(k)} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${sub === k ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            {t}
          </button>
        ))}
      </div>

      {sub === "new" && receipt && (
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div>
                <p className="text-xs text-emerald-400">آگهی با موفقیت ثبت شد</p>
                <p className="font-extrabold">{receipt.model}</p>
              </div>
              <span className={`rounded-lg px-3 py-1 text-xs font-extrabold ${receipt.vtype === "PRE_TESTED" ? "bg-amber-400 text-slate-900" : "bg-sky-200 text-sky-900"}`}>
                {receipt.vtype === "PRE_TESTED" ? "⚡ نشان طلایی" : "🛡️ تست پس از سفارش"}
              </span>
            </div>
            <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs text-slate-500">کد رهگیری</p>
                <p dir="ltr" className="text-right font-mono text-4xl font-extrabold tracking-wider text-slate-900">{receipt.code}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {receipt.vtype === "PRE_TESTED"
                    ? "این بارکد را به تکنسین مرکز تست نشان دهید یا کد رهگیری را روی جعبه بنویسید."
                    : "قطعه نزد شما می‌ماند. وقتی خریدار مبلغ را در صندوق امانی قفل کرد، با همین کد قطعه را برای تست ارسال کنید."}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  مبلغ خالص دریافتی شما: <b className="text-emerald-600">{fa(receipt.net)} تومان</b>
                  <span className="text-xs"> (کارمزد {fa(receipt.fee)})</span>
                </p>
                <button type="button" onClick={() => navigator.clipboard?.writeText(receipt.code)} className={`${btnGhost} mt-3 !py-1.5 text-xs`}>کپی کد رهگیری</button>
              </div>
              <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3">
                <QRCodeSVG value={receipt.code} size={140} />
              </div>
            </div>
            <div className="relative border-t-2 border-dashed border-slate-300">
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-100" />
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-100" />
              <p className="px-6 py-4 text-xs leading-6 text-slate-400">این رسید را نگه دارید؛ بارکد را بعداً در «مدیریت آگهی‌های من» هم می‌توانید دوباره ببینید.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onGoToMarket} className={btnPrimary}>مشاهده آگهی من در بازارچه (تب ۱)</button>
            <button type="button" onClick={resetForm} className={btnGhost}>ثبت قطعه دیگر</button>
          </div>
        </div>
      )}

      {sub === "new" && !receipt && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <Card title="۱. مشخصات قطعه">
              <div className="mb-4 grid gap-2 sm:grid-cols-3">
                {CATS.map((c) => (
                  <button key={c.key} type="button" onClick={() => pickCat(c.key)} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${cat === c.key ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                    <span className="ml-1">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="برند">
                  <select value={brandSel} onChange={(e) => setBrandSel(e.target.value)} className={inputCls}>
                    <option value="">انتخاب کنید</option>
                    {BRANDS[cat].map((b) => <option key={b} value={b}>{b}</option>)}
                    <option value={OTHER}>سایر (تایپ دستی برند)</option>
                  </select>
                </Field>
                {brandSel === OTHER && (
                  <Field label="نام برند">
                    <input dir="ltr" value={brandCustom} onChange={(e) => setBrandCustom(e.target.value)} placeholder="مثلاً Biostar" className={`${inputCls} text-left`} />
                  </Field>
                )}
                <div className={brandSel === OTHER ? "sm:col-span-2" : ""}>
                  <Field label="نام مدل قطعه">
                    <input dir="ltr" value={model} onChange={(e) => setModel(e.target.value)} placeholder="RTX 3070 Ti Gaming X" className={`${inputCls} text-left`} />
                  </Field>
                </div>
              </div>
            </Card>

            <Card title="۲. مشخصات فنی (base_specs)">
              <div className="grid gap-4 sm:grid-cols-2">
                {SPEC_FIELDS[cat].map((f) => (
                  <Field key={f.key} label={f.label + (f.required ? " *" : "")}>
                    {f.options ? (
                      <select value={specs[f.key] ?? ""} onChange={(e) => setSpecs({ ...specs, [f.key]: e.target.value })} className={inputCls}>
                        <option value="">انتخاب کنید</option>
                        {f.options.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
                      </select>
                    ) : (
                      <input dir="ltr" inputMode="numeric" value={specs[f.key] ?? ""} onChange={(e) => setSpecs({ ...specs, [f.key]: normDigits(e.target.value) })} placeholder={f.placeholder} className={`${inputCls} text-left`} />
                    )}
                  </Field>
                ))}
              </div>
            </Card>

            <Card title="۳. قیمت، جعبه و تصویر">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Field label="قیمت (تومان)">
                    <input dir="ltr" inputMode="numeric" value={price} onChange={(e) => setPrice(normDigits(e.target.value))} placeholder="12500000" className={`${inputCls} text-left`} />
                  </Field>
                  <p className="mt-2 min-h-7 text-lg font-extrabold text-slate-900">
                    {priceOk ? <>{fa(price)} <span className="text-xs font-medium text-slate-500">تومان</span></> : <span className="text-sm font-normal text-slate-400">قیمت را وارد کنید</span>}
                  </p>
                  <button type="button" role="switch" aria-checked={box} onClick={() => setBox(!box)} className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-right text-sm font-bold text-cyan-800">
                    جعبه و متعلقات اصلی قطعه موجود است
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${box ? "bg-cyan-500" : "bg-slate-300"}`}>
                      <span className={`absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${box ? "-translate-x-5" : ""}`} />
                    </span>
                  </button>
                </div>
                <div>
                  <Field label="لینک تصویر قطعه (اختیاری)">
                    <input dir="ltr" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={`${inputCls} text-left`} />
                  </Field>
                  <p className="mb-2 mt-3 text-xs font-medium text-slate-600">انتخاب سریع عکس نمونه</p>
                  <div className="flex gap-2">
                    {SAMPLE_IMAGES[cat].map((s, n) => (
                      <button key={s} type="button" onClick={() => setImageUrl(s)} aria-label={`عکس نمونه ${n + 1}`} className={`h-14 w-14 overflow-hidden rounded-xl border-2 ${imageUrl === s ? "border-cyan-500" : "border-slate-200"}`}>
                        <Thumb src={s} alt={`نمونه ${n + 1}`} />
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 aspect-[4/3] w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Thumb src={imageUrl.trim() || SAMPLE_IMAGES[cat][0]} alt="پیش‌نمایش" />
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-400">اگر لینکی وارد نکنید، عکس پیش‌فرض این دسته ثبت می‌شود.</p>
                </div>
              </div>
            </Card>

            <Card title="۴. روش تست و اعتمادسازی">
              <div className="grid gap-4 md:grid-cols-2">
                <button type="button" onClick={() => setVtype("PRE_TESTED")} className={`relative rounded-2xl border-2 p-5 pt-7 text-right transition ${vtype === "PRE_TESTED" ? "border-amber-500 bg-amber-50 ring-4 ring-amber-100" : "border-amber-300 bg-white hover:bg-amber-50"}`}>
                  <span className="absolute -top-3 right-4 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-slate-900">پیشنهاد ویژه فروش سریع</span>
                  <p className="text-base font-extrabold text-slate-900">ارسال فوری به مرکز تست و دریافت نشان طلایی ⚡</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">قطعه را اکنون به مرکز تست ما تحویل می‌دهید؛ پس از صدور شناسنامه سلامت، آگهی شما با کادر طلایی در صدر ویترین قرار می‌گیرد و ۳ برابر سریع‌تر فروش می‌رود.</p>
                </button>
                <button type="button" onClick={() => setVtype("ON_DEMAND")} className={`rounded-2xl border-2 p-5 pt-7 text-right transition ${vtype === "ON_DEMAND" ? "border-sky-500 bg-sky-50 ring-4 ring-sky-100" : "border-slate-300 bg-white hover:bg-slate-50"}`}>
                  <p className="text-base font-extrabold text-slate-900">نگهداری قطعه نزد خودم و تست پس از پیدا شدن خریدار 🛡️</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">قطعه پیش شما می‌ماند؛ هر زمان خریداری مبلغ را در صندوق امانی (Escrow) قفل کرد، قطعه را برای تست به مرکز ارسال می‌کنید.</p>
                </button>
              </div>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-40 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-extrabold text-slate-900">مبلغ خالص دریافتی شما</h3>
              {!priceOk ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-500">با وارد کردن قیمت، کارمزد پلتفرم و مبلغ خالص دریافتی شما محاسبه می‌شود.</p>
              ) : (
                <>
                  <dl className={`divide-y divide-slate-100 text-sm transition ${calcBusy ? "opacity-50" : ""}`}>
                    <div className="flex justify-between py-2"><dt className="text-slate-500">قیمت فروش</dt><dd className="font-bold text-slate-900">{fa(priceNum)}</dd></div>
                    <div className="flex justify-between py-2"><dt className="text-slate-500">کارمزد پلتفرم</dt><dd className="font-bold text-red-600">− {fa(calc?.platform_fee)}</dd></div>
                    <div className="flex justify-between py-2"><dt className="font-bold text-slate-700">خالص دریافتی</dt><dd className="text-lg font-extrabold text-emerald-600">{fa(calc?.net_payout)}</dd></div>
                    <div className="flex justify-between py-2"><dt className="text-slate-500">کد رهگیری</dt><dd dir="ltr" className="font-mono font-bold text-slate-900">{calc?.tracking_code ?? "—"}</dd></div>
                  </dl>
                  <p className={`mt-3 rounded-lg px-3 py-2 text-xs leading-6 ${calc?.source === "python" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                    {calcBusy ? "در حال محاسبه..." : calc?.source === "python" ? "✅ محاسبه توسط سرور پایتون انجام شد." : "⚠️ سرور پایتون در دسترس نیست؛ محاسبه محلی و تقریبی است."}
                  </p>
                </>
              )}
              {formError && <p dir="auto" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-7 text-red-700">{formError}</p>}
              <button type="button" disabled={submitting} onClick={submit} className={`${btnPrimary} mt-4 w-full`}>
                {submitting ? "در حال ثبت..." : "تایید نهایی و ثبت آگهی"}
              </button>
              <p className="mt-3 text-xs leading-6 text-slate-400">با ثبت نهایی، قطعه ابتدا در کاتالوگ استاندارد و سپس به‌عنوان آگهی ذخیره می‌شود.</p>
            </div>
          </aside>
        </div>
      )}

      {sub === "manage" && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی مدل، برند یا کد رهگیری" className={`${inputCls} max-w-sm`} />
            <span className="text-sm text-slate-500">{mine.length.toLocaleString("fa-IR")} آگهی</span>
          </div>
          {msg && (
            <p dir="auto" className={`mb-4 rounded-xl p-3 text-sm ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
          )}

          {mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">آگهی‌ای برای نمایش وجود ندارد.</div>
          ) : (
            <ul className="space-y-3">
              {mine.map((item) => {
                const c = one(item.hardware_catalog);
                const pre = item.verification_type === "PRE_TESTED";
                const busy = busyId === item.listing_id;
                const img = Array.isArray(item.seller_images) ? item.seller_images[0] ?? null : null;
                return (
                  <li key={item.listing_id} className={`flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center ${pre ? "border-2 border-amber-400" : "border border-slate-200"}`}>
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <Thumb src={img} alt={c?.model_name ?? "قطعه"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${pre ? "bg-amber-400 text-slate-900" : "bg-sky-100 text-sky-800"}`}>{pre ? "⚡ نشان طلایی" : "🛡️ تست پس از سفارش"}</span>
                        <span className="text-xs text-slate-500">{LOCATIONS[item.physical_location ?? ""] ?? "—"}</span>
                      </div>
                      <p className="truncate text-sm font-bold text-slate-900">{[c?.brand, c?.model_name].filter(Boolean).join(" ") || "قطعه بدون نام"}</p>
                      <p dir="ltr" className="mt-0.5 text-right font-mono text-xs text-slate-500">{item.tracking_code ?? "—"}</p>
                    </div>

                    <div className="md:w-56">
                      {editingId === item.listing_id ? (
                        <div>
                          <input dir="ltr" inputMode="numeric" autoFocus value={editPrice} onChange={(e) => setEditPrice(normDigits(e.target.value))} className={`${inputCls} text-left`} />
                          <p className="mt-1 text-sm font-bold text-slate-900">{fa(editPrice, " تومان")}</p>
                          <div className="mt-2 flex gap-2">
                            <button type="button" disabled={busy} onClick={() => savePrice(item)} className={`${btnPrimary} !px-3 !py-1.5 text-xs`}>{busy ? "..." : "ذخیره"}</button>
                            <button type="button" disabled={busy} onClick={() => setEditingId(null)} className={`${btnGhost} !px-3 !py-1.5 text-xs`}>انصراف</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xl font-extrabold text-slate-900">{fa(item.initial_price)} <span className="text-xs font-medium text-slate-500">تومان</span></p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:w-60 md:justify-end">
                      {confirmId === item.listing_id ? (
                        <>
                          <span className="text-xs font-bold text-red-600">حذف قطعی؟</span>
                          <button type="button" disabled={busy} onClick={() => removeListing(item)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:bg-slate-300">{busy ? "..." : "بله، حذف شود"}</button>
                          <button type="button" disabled={busy} onClick={() => setConfirmId(null)} className={`${btnGhost} !px-3 !py-1.5 text-xs`}>خیر</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => { setMsg(null); setEditingId(item.listing_id); setEditPrice(String(toNum(item.initial_price) ?? "")); }} className={`${btnGhost} !px-3 !py-1.5 text-xs`}>✏️ ویرایش قیمت</button>
                          <button type="button" onClick={() => setQrItem(item)} className={`${btnGhost} !px-3 !py-1.5 text-xs`}>📱 نمایش بارکد پذیرش</button>
                          <button type="button" onClick={() => { setMsg(null); setConfirmId(item.listing_id); }} className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50">🗑️ حذف آگهی</button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {qrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setQrItem(null)}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-xs text-slate-500">بارکد پذیرش در مرکز تست</p>
            <p className="mb-4 mt-1 text-sm font-bold text-slate-900">{one(qrItem.hardware_catalog)?.model_name ?? "قطعه"}</p>
            <div className="mx-auto inline-block rounded-2xl border border-slate-200 bg-white p-4">
              <QRCodeSVG value={qrItem.tracking_code ?? qrItem.listing_id} size={200} />
            </div>
            <p dir="ltr" className="mt-3 font-mono text-2xl font-extrabold tracking-wider text-slate-900">{qrItem.tracking_code ?? "—"}</p>
            <p className="mt-2 text-xs leading-6 text-slate-500">این بارکد را به تکنسین مرکز تست نشان دهید یا کد رهگیری را روی جعبه بنویسید.</p>
            <button type="button" onClick={() => setQrItem(null)} className={`${btnPrimary} mt-5 w-full`}>بستن</button>
          </div>
        </div>
      )}
    </div>
  );
}