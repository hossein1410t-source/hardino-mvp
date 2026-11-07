"use client";











import Tab3SmartBuilder from "../components/tabs/Tab3SmartBuilder";
import HeroBanner from "../components/layout/HeroBanner";
import Footer from "../components/layout/Footer";
import Tab7EscrowRoom from "../components/tabs/Tab7EscrowRoom";
import Tab5HealthPassport from "../components/tabs/Tab5HealthPassport";
import Tab4TechnicianDispatch from "../components/tabs/Tab4TechnicianDispatch";
import Tab6TestCenterAI from "../components/tabs/Tab6TestCenterAI";
import Tab2SellerHub from "../components/tabs/Tab2SellerHub";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bookmark,
  Cpu,
  FilePlus,
  FileSearch,
  HardDrive,
  Layers,
  Lock,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Thermometer,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SELECT = "*, hardware_catalog(*), test_reports(*)";

type Metrics = Record<string, unknown>;

type Report = {
  overall_score?: number | string | null;
  health_grade?: string | null;
  serial_number?: string | null;
  hologram_code?: string | null;
  technician_note?: string | null;
  detailed_metrics?: Metrics | null;
  physical_status?: Metrics | null;
};

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
  box_and_accessories?: boolean | null;
  hardware_catalog?: Catalog | Catalog[] | null;
  test_reports?: Report | Report[] | null;
};

type Row = { label: string; value: (i: Listing) => string; best?: (i: Listing) => boolean };

const TABS: { label: string; icon: LucideIcon }[] = [
  { label: "بازارچه قطعات", icon: Store },
  { label: "ثبت آگهی فروش", icon: FilePlus },
  { label: "مشاور و سیستم‌ساز هوشمند", icon: Sparkles },
  { label: "اعزام تکنسین و نصب", icon: Wrench },
  { label: "استعلام شناسنامه سلامت", icon: FileSearch },
  { label: "پنل مراکز تست (AI)", icon: Activity },
  { label: "معامله امن و قوانین", icon: Lock },
];

const CATEGORIES = [
  { key: "ALL", label: "همه قطعات" },
  { key: "GPU", label: "کارت گرافیک" },
  { key: "RAM", label: "رم" },
  { key: "STORAGE", label: "حافظه SSD" },
];

const FALLBACK_IMG: Record<string, string> = {
  GPU: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=70",
  RAM: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=70",
  STORAGE: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=70",
};

const LOCATIONS: Record<string, string> = {
  WITH_SELLER: "نزد فروشنده",
  AT_TEST_CENTER: "در مرکز تست",
  IN_TRANSIT: "در مسیر ارسال",
  WITH_BUYER: "تحویل خریدار",
};

const LABELS: Record<string, string> = {
  max_temp: "دمای ماکزیمم (°C)",
  hotspot_temp: "دمای نقطه داغ (°C)",
  fan_speed_pct: "سرعت فن (٪)",
  "3dmark_score": "امتیاز 3DMark",
  warranty_seal_intact: "پلمپ پیچ‌ها سالم است",
  repaired_board: "برد تعمیر شده است",
  tdp_w: "توان مصرفی (W)",
  form_factor: "فرم‌فاکتور",
  interface: "رابط",
  capacity_gb: "ظرفیت (GB)",
  memory_gb: "حافظه (GB)",
  speed_mhz: "سرعت (MHz)",
  power_connector: "کانکتور برق",
};

const GRADE_STYLE: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  B: "bg-sky-100 text-sky-700 ring-sky-200",
  C: "bg-amber-100 text-amber-700 ring-amber-200",
};

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";
const btnPrimary =
  "rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300";
const btnGhost =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const fa = (v: unknown, suffix = ""): string => {
  const n = toNum(v);
  return n === null ? "—" : n.toLocaleString("fa-IR") + suffix;
};

const label = (k: string) => LABELS[k] ?? k.replace(/_/g, " ");

const fmtVal = (v: unknown): string => {
  if (typeof v === "boolean") return v ? "بله" : "خیر";
  if (typeof v === "number") return v.toLocaleString("fa-IR");
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

const getReport = (i: Listing): Report | null => {
  const report = Array.isArray(i.test_reports) ? i.test_reports[0] : i.test_reports;
  return report ?? null;
};
const getCatalog = (i: Listing) => one(i.hardware_catalog);
const getCat = (i: Listing) => String(getCatalog(i)?.category ?? "").toUpperCase();
const getModel = (i: Listing) => getCatalog(i)?.model_name || "قطعه بدون نام";
const getSpecs = (i?: Listing | null): Metrics => (i ? getCatalog(i)?.base_specs ?? {} : {});
const getGrade = (i: Listing) => String(getReport(i)?.health_grade ?? "").replace("GRADE_", "").toUpperCase();
const getScore = (i: Listing) => toNum(getReport(i)?.overall_score);
const getMetric = (i: Listing, k: string) => toNum(getReport(i)?.detailed_metrics?.[k]);
const getStatus = (i: Listing, k: string): boolean | null => {
  const v = getReport(i)?.physical_status?.[k];
  return typeof v === "boolean" ? v : null;
};
const getPrice = (i: Listing) => toNum(i.initial_price);
const isPre = (i: Listing) => i.verification_type === "PRE_TESTED";
const getImage = (i: Listing) => (Array.isArray(i.seller_images) ? i.seller_images[0] ?? null : null);
const catLabel = (k: string) => CATEGORIES.find((c) => c.key === k)?.label ?? "نامشخص";
const specNum = (o: Metrics, keys: string[]) => {
  for (const k of keys) {
    const n = toNum(o[k]);
    if (n !== null) return n;
  }
  return null;
};
const randCode = (prefix: string, digits = 5) =>
  `${prefix}-${Math.floor(10 ** (digits - 1) + Math.random() * 9 * 10 ** (digits - 1))}`;

function useForm<T extends object>(init: T) {
  const [v, setV] = useState<T>(init);
  const set = <K extends keyof T>(k: K, val: T[K]) => setV((p) => ({ ...p, [k]: val }));
  return [v, set, setV] as const;
}

function bestVal(items: Listing[], get: (i: Listing) => number | null, mode: "min" | "max") {
  const v = items.map(get).filter((n): n is number => n !== null);
  if (v.length < 2) return null;
  return mode === "min" ? Math.min(...v) : Math.max(...v);
}

function buildRows(items: Listing[]): Row[] {
  const bp = bestVal(items, getPrice, "min");
  const bs = bestVal(items, getScore, "max");
  const bt = bestVal(items, (i) => getMetric(i, "max_temp"), "min");
  const bm = bestVal(items, (i) => getMetric(i, "3dmark_score"), "max");
  const seal = (i: Listing) => (getStatus(i, "warranty_seal_intact") === null ? "—" : getStatus(i, "warranty_seal_intact") ? "سالم" : "شکسته");
  const repaired = (i: Listing) => (getStatus(i, "repaired_board") === null ? "—" : getStatus(i, "repaired_board") ? "تعمیر شده" : "دست‌نخورده");
  const specKeys = Array.from(new Set(items.flatMap((i) => Object.keys(getSpecs(i)))));
  return [
    { label: "قیمت (تومان)", value: (i) => fa(getPrice(i)), best: (i) => bp !== null && getPrice(i) === bp },
    { label: "نوع تایید", value: (i) => (isPre(i) ? "تست‌شده در مرکز" : "تست پس از سفارش") },
    { label: "نمره سلامت", value: (i) => (getScore(i) !== null ? fa(getScore(i), " / ۱۰۰") : "پس از تست"), best: (i) => bs !== null && getScore(i) === bs },
    { label: "گرید", value: (i) => getGrade(i) || "پس از تست" },
    { label: "دمای ماکزیمم", value: (i) => fa(getMetric(i, "max_temp"), "°"), best: (i) => bt !== null && getMetric(i, "max_temp") === bt },
    { label: "دمای نقطه داغ", value: (i) => fa(getMetric(i, "hotspot_temp"), "°") },
    { label: "سرعت فن", value: (i) => fa(getMetric(i, "fan_speed_pct"), "٪") },
    { label: "امتیاز 3DMark", value: (i) => fa(getMetric(i, "3dmark_score")), best: (i) => bm !== null && getMetric(i, "3dmark_score") === bm },
    { label: "پلمپ پیچ‌ها", value: seal },
    { label: "وضعیت برد", value: repaired },
    { label: "جعبه و متعلقات", value: (i) => (i.box_and_accessories === null || i.box_and_accessories === undefined ? "—" : i.box_and_accessories ? "دارد" : "ندارد") },
    { label: "محل فعلی قطعه", value: (i) => LOCATIONS[i.physical_location ?? ""] ?? "—" },
    ...specKeys.map((k) => ({ label: label(k), value: (i: Listing) => fmtVal(getSpecs(i)[k]) })),
  ];
}

function buildSummary(items: Listing[]): string[] {
  const out: string[] = [];
  const n = (i: Listing) => `«${getModel(i)}»`;
  const withPrice = items.filter((i) => getPrice(i) !== null);
  const withScore = items.filter((i) => getScore(i) !== null);
  const withTemp = items.filter((i) => getMetric(i, "max_temp") !== null);
  if (new Set(items.map(getCat)).size > 1) out.push("این قطعات از دسته‌های متفاوتی هستند؛ مقایسه مستقیم قیمت و عملکرد آن‌ها دقیق نیست.");
  if (withPrice.length > 1) out.push(`${n(withPrice.reduce((a, b) => (getPrice(b)! < getPrice(a)! ? b : a)))} ارزان‌ترین گزینه است.`);
  if (withScore.length > 1) {
    const best = withScore.reduce((a, b) => (getScore(b)! > getScore(a)! ? b : a));
    out.push(`${n(best)} بالاترین نمره سلامت (${fa(getScore(best), " از ۱۰۰")}) را دارد.`);
  }
  if (withTemp.length > 1) {
    const cool = withTemp.reduce((a, b) => (getMetric(b, "max_temp")! < getMetric(a, "max_temp")! ? b : a));
    out.push(`${n(cool)} زیر بار خنک‌تر کار کرده (${fa(getMetric(cool, "max_temp"), " درجه")}).`);
  }
  items.filter((i) => getStatus(i, "repaired_board") === true).forEach((i) => out.push(`${n(i)} سابقه تعمیر برد دارد؛ یادداشت تکنسین را حتماً بخوانید.`));
  if (items.some((i) => !getReport(i))) out.push("قطعاتی که هنوز شناسنامه ندارند، بعد از ثبت سفارش در مرکز تست می‌شوند و نمره آن‌ها بعداً مشخص می‌شود.");
  return out;
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  if (category === "STORAGE") return <HardDrive className={className} />;
  if (category === "RAM") return <Layers className={className} />;
  return <Cpu className={className} />;
}

function ProductImage({ src, category, alt }: { src: string | null; category: string; alt: string }) {
  const list = useMemo(() => [src, FALLBACK_IMG[category]].filter(Boolean) as string[], [src, category]);
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [list]);
  if (idx >= list.length) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
        <CategoryIcon category={category} className="h-12 w-12" />
      </div>
    );
  }
  return <img src={list[idx]} alt={alt} loading="lazy" onError={() => setIdx((i) => i + 1)} className="h-full w-full object-cover" />;
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className={`inline-flex min-w-7 justify-center rounded-md px-2 py-0.5 text-xs font-extrabold ring-1 ${GRADE_STYLE[grade] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      {grade || "—"}
    </span>
  );
}

function ScoreBar({ score }: { score: number | null }) {
  const s = Math.max(0, Math.min(100, score ?? 0));
  const color = s >= 85 ? "bg-emerald-500" : s >= 70 ? "bg-cyan-500" : "bg-amber-500";
  return (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${s}%` }} />
    </div>
  );
}

function Panel({ title, icon: Icon, children, className = "" }: { title?: string; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-900">
          {Icon && <Icon className="h-5 w-5 text-cyan-600" />}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Field({ label: text, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{text}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, children, tone }: { checked: boolean; onChange: () => void; children: ReactNode; tone: "amber" | "cyan" }) {
  const box = tone === "amber" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-cyan-200 bg-cyan-50 text-cyan-800";
  const on = tone === "amber" ? "bg-amber-500" : "bg-cyan-500";
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-right ${box}`}>
      <span className="flex items-center gap-2 text-sm font-bold">{children}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? on : "bg-slate-300"}`}>
        <span className={`absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "-translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function KV({ rows }: { rows: [string, string, boolean?][] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-400">اطلاعاتی ثبت نشده است.</p>;
  return (
    <dl className="divide-y divide-slate-100 text-sm">
      {rows.map(([k, v, bad]) => (
        <div key={k} className="flex items-center justify-between gap-3 py-2">
          <dt className="text-slate-500">{k}</dt>
          <dd className={`font-bold ${bad ? "text-red-600" : "text-slate-900"}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function PassportView({ item }: { item: Listing }) {
  const report = getReport(item);
  const imgs = Array.isArray(item.seller_images) ? item.seller_images.slice(0, 4) : [];
  const category = getCat(item);
  const isBad = (k: string, v: unknown) => (k === "repaired_board" && v === true) || (k === "warranty_seal_intact" && v === false);
  const layer1: [string, string][] = [
    ["محل فعلی قطعه", LOCATIONS[item.physical_location ?? ""] ?? "—"],
    ["جعبه و متعلقات", item.box_and_accessories === null || item.box_and_accessories === undefined ? "—" : item.box_and_accessories ? "دارد" : "ندارد"],
    ...Object.entries(getSpecs(item)).map(([k, v]) => [label(k), fmtVal(v)] as [string, string]),
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-1 text-sm font-extrabold text-slate-800">لایه ۱ · اظهارات فروشنده</h3>
        <p className="mb-3 text-xs text-slate-500">این بخش را فروشنده ثبت کرده و هنوز توسط مرکز تست تایید نشده است.</p>
        <div className="mb-3 grid grid-cols-4 gap-2">
          {(imgs.length ? imgs : [null]).map((src, n) => (
            <div key={n} className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
              <ProductImage src={src} category={category} alt={getModel(item)} />
            </div>
          ))}
        </div>
        <KV rows={layer1} />
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <h3 className="mb-1 flex items-center gap-1.5 text-sm font-extrabold text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          لایه ۲ · تاییدیه مرکز تست
        </h3>
        {report ? (
          <>
            <p className="mb-3 text-xs text-emerald-800/70">نتایج زیر را تکنسین مرکز تست ثبت کرده است.</p>
            <div className="mb-3 rounded-xl bg-white p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">نمره سلامت</span>
                <span className="flex items-center gap-2 font-extrabold text-slate-900">
                  {fa(getScore(item))} <span className="text-xs font-normal text-slate-500">از ۱۰۰</span>
                  <GradeBadge grade={getGrade(item)} />
                </span>
              </div>
              <ScoreBar score={getScore(item)} />
            </div>
            <KV
              rows={[
                ["شماره سریال", report.serial_number ?? "—"],
                ["کد هولوگرام", report.hologram_code ?? "—"],
                ...Object.entries(report.detailed_metrics ?? {}).map(([k, v]) => [label(k), fmtVal(v)] as [string, string]),
                ...Object.entries(report.physical_status ?? {}).map(([k, v]) => [label(k), fmtVal(v), isBad(k, v)] as [string, string, boolean]),
              ]}
            />
            {report.technician_note && (
              <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-7 text-slate-700">
                <span className="font-bold text-slate-900">یادداشت تکنسین: </span>
                {report.technician_note}
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 rounded-xl bg-white p-4 text-sm leading-7 text-slate-600">
            این قطعه هنوز در مرکز تست نشده است. بعد از ثبت سفارش، قطعه به مرکز تست می‌رود و مبلغ تا تایید سلامت در درگاه امانی می‌ماند.
          </p>
        )}
      </div>
    </div>
  );
}

function ProductCard({ item, saved, compared, onSave, onCompare, onOpen }: { item: Listing; saved: boolean; compared: boolean; onSave: () => void; onCompare: () => void; onOpen: () => void }) {
  const pre = isPre(item);
  const waiting = pre && !getReport(item);
  const price = getPrice(item);
  const seal = getStatus(item, "warranty_seal_intact");
  const brand = getCatalog(item)?.brand;
  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg ${pre ? "border-2 border-amber-400" : "border border-slate-200"} ${compared ? "ring-2 ring-cyan-400" : ""}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <ProductImage src={getImage(item)} category={getCat(item)} alt={getModel(item)} />
        <button type="button" onClick={onSave} aria-label="ذخیره آگهی" aria-pressed={saved} className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow ${saved ? "text-rose-600" : "text-slate-500 hover:text-rose-600"}`}>
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
        <button type="button" onClick={onCompare} aria-label="افزودن به مقایسه" aria-pressed={compared} className={`absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow ${compared ? "bg-cyan-600 text-white" : "bg-white/95 text-slate-500 hover:text-cyan-700"}`}>
          <Scale className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {waiting ? (
          <span className="w-fit rounded-lg border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-800">⏳ در انتظار تست در مرکز</span>
        ) : pre ? (
          <span className="w-fit rounded-lg bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-900 shadow-sm">⚡ تست‌شده در مرکز (آماده ارسال فوری)</span>
        ) : (
          <span className="w-fit rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-800">🛡️ تست در مرکز پس از ثبت سفارش شما</span>
        )}

        <div>
          {brand && <p className="text-xs text-slate-500">{brand}</p>}
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-6 text-slate-900">{getModel(item)}</h3>
          <p className="mt-1 text-xs text-slate-400">
            کد رهگیری:{" "}
            <span dir="ltr" className="inline-block font-mono text-slate-600">{item.tracking_code ?? "—"}</span>
          </p>
        </div>

        {waiting ? (
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">قطعه در مسیر مرکز تست است؛ شناسنامه سلامت پس از تست صادر می‌شود.</p>
        ) : pre ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">نمره سلامت</span>
              <span className="font-extrabold text-slate-900">{fa(getScore(item))} <span className="font-normal text-slate-500">از ۱۰۰</span></span>
            </div>
            <ScoreBar score={getScore(item)} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
              <div><p className="mb-1">گرید</p><GradeBadge grade={getGrade(item)} /></div>
              <div>
                <p className="mb-1 flex items-center justify-center gap-0.5"><Thermometer className="h-3 w-3" />ماکزیمم</p>
                <p className="text-sm font-bold text-slate-900">{fa(getMetric(item, "max_temp"), "°")}</p>
              </div>
              <div>
                <p className="mb-1">پلمپ پیچ</p>
                <p className={`text-sm font-bold ${seal === false ? "text-red-600" : "text-emerald-600"}`}>{seal === null ? "—" : seal ? "سالم ✓" : "شکسته"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-sky-50 p-3 text-xs leading-6 text-sky-900">
            پول شما در درگاه امانی می‌ماند و فقط بعد از تست و تایید سلامت قطعه به فروشنده می‌رسد.
          </p>
        )}

        <div className="mt-auto border-t border-slate-100 pt-3">
          <p className="text-[11px] text-slate-400">قیمت</p>
          <p className="mb-3 text-2xl font-extrabold text-slate-900">
            {price === null ? "توافقی" : fa(price)}
            {price !== null && <span className="mr-1 text-xs font-medium text-slate-500">تومان</span>}
          </p>
          <button type="button" onClick={onOpen} className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700">
            مشاهده شناسنامه سلامت / خرید امن
          </button>
        </div>
      </div>
    </article>
  );
}

function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-5xl" : "max-w-4xl"}`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="بستن" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Storefront({
  listings, loading, error, onRetry, query, setQuery, saved, toggleSave, savedOnly, setSavedOnly, onGo,
}: {
  listings: Listing[]; loading: boolean; error: string | null; onRetry: () => void; query: string; setQuery: (v: string) => void;
  saved: string[]; toggleSave: (id: string) => void; savedOnly: boolean; setSavedOnly: (v: boolean) => void; onGo: (tab: number, item?: Listing) => void;
}) {
  const [category, setCategory] = useState("ALL");
  const [onlyTested, setOnlyTested] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [passport, setPassport] = useState<Listing | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: listings.length };
    listings.forEach((i) => (c[getCat(i)] = (c[getCat(i)] ?? 0) + 1));
    return c;
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((i) => {
      if (onlyTested && !isPre(i)) return false;
      if (category !== "ALL" && getCat(i) !== category) return false;
      if (savedOnly && !saved.includes(i.listing_id)) return false;
      if (q && ![getModel(i), getCatalog(i)?.brand, i.tracking_code].filter(Boolean).join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [listings, query, onlyTested, category, savedOnly, saved]);

  const compareItems = compare.map((id) => listings.find((l) => l.listing_id === id)).filter((l): l is Listing => Boolean(l));
  const hasFilters = onlyTested || category !== "ALL" || savedOnly || query.trim() !== "";
  const reset = () => { setQuery(""); setOnlyTested(false); setCategory("ALL"); setSavedOnly(false); };

  const toggleCompare = (id: string) => {
    if (compare.includes(id)) return setCompare(compare.filter((x) => x !== id));
    if (compare.length >= 3) return setNotice("حداکثر ۳ قطعه را می‌توانید با هم مقایسه کنید.");
    setCompare([...compare, id]);
  };

  return (
    <div className={`grid gap-6 lg:grid-cols-[280px_1fr] ${compare.length > 0 ? "pb-28" : ""}`}>
      <aside className={`${filtersOpen ? "block" : "hidden"} lg:sticky lg:top-40 lg:block lg:self-start`}>
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی مدل، برند یا کد رهگیری" className={`${inputCls} pr-9`} />
          </div>
          <Toggle checked={onlyTested} onChange={() => setOnlyTested(!onlyTested)} tone="amber">
            <Zap className="h-4 w-4 shrink-0" />
            فقط قطعات تست‌شده
          </Toggle>
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-900">دسته‌بندی</h3>
            <ul className="space-y-1">
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button type="button" onClick={() => setCategory(c.key)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${category === c.key ? "bg-slate-900 font-bold text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                    <span className="flex items-center gap-2">
                      {c.key === "ALL" ? <Store className="h-4 w-4" /> : <CategoryIcon category={c.key} className="h-4 w-4" />}
                      {c.label}
                    </span>
                    <span className="text-xs opacity-60">{(counts[c.key] ?? 0).toLocaleString("fa-IR")}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Toggle checked={savedOnly} onChange={() => setSavedOnly(!savedOnly)} tone="cyan">
            <Bookmark className="h-4 w-4 shrink-0" />
            فقط نشان‌شده‌ها
          </Toggle>
          {hasFilters && (
            <button type="button" onClick={reset} className={`${btnGhost} w-full`}>حذف همه فیلترها</button>
          )}
        </div>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-base font-extrabold text-slate-900">
            {savedOnly ? "آگهی‌های نشان‌شده" : "بازارچه قطعات کارکرده"}
            {!loading && <span className="mr-2 text-sm font-normal text-slate-500">{filtered.length.toLocaleString("fa-IR")} قطعه</span>}
          </h1>
          <button type="button" onClick={() => setFiltersOpen(!filtersOpen)} className={`${btnGhost} flex items-center gap-1.5 !py-2 lg:hidden`}>
            <SlidersHorizontal className="h-4 w-4" />
            فیلترها
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="space-y-3 p-4"><div className="h-5 w-2/3 rounded bg-slate-100" /><div className="h-16 rounded bg-slate-100" /><div className="h-10 rounded bg-slate-100" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-bold text-red-700">دریافت آگهی‌ها انجام نشد</p>
            <p dir="ltr" className="mt-2 text-xs text-red-600">{error}</p>
            <button type="button" onClick={onRetry} className={`${btnPrimary} mt-4`}>تلاش دوباره</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-bold text-slate-700">قطعه‌ای با این فیلترها پیدا نشد</p>
            <p className="mt-1 text-sm text-slate-500">فیلترها را کم کنید یا عبارت دیگری جستجو کنید.</p>
            {hasFilters && <button type="button" onClick={reset} className={`${btnPrimary} mt-4`}>حذف همه فیلترها</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((i) => (
              <ProductCard key={i.listing_id} item={i} saved={saved.includes(i.listing_id)} compared={compare.includes(i.listing_id)} onSave={() => toggleSave(i.listing_id)} onCompare={() => toggleCompare(i.listing_id)} onOpen={() => setPassport(i)} />
            ))}
          </div>
        )}
      </section>

      {compare.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="flex gap-2">
            {compareItems.map((i) => (
              <div key={i.listing_id} className="group relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <ProductImage src={getImage(i)} category={getCat(i)} alt={getModel(i)} />
                <button type="button" onClick={() => toggleCompare(i.listing_id)} aria-label="حذف از مقایسه" className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white opacity-0 transition group-hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="flex-1 text-sm text-slate-600">
            {compare.length.toLocaleString("fa-IR")} از ۳ قطعه انتخاب شده
            {compare.length < 2 && <span className="block text-xs text-slate-400">برای مقایسه حداقل ۲ قطعه لازم است.</span>}
          </p>
          <button type="button" onClick={() => setCompare([])} className="text-sm text-slate-500 hover:text-red-600">پاک کردن</button>
          <button type="button" disabled={compare.length < 2} onClick={() => setShowCompare(true)} className={btnPrimary}>مقایسه قطعات</button>
        </div>
      )}

      {notice && <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{notice}</div>}

      {passport && (
        <Modal title={`شناسنامه سلامت · ${getModel(passport)}`} onClose={() => setPassport(null)}>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span dir="ltr" className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-slate-700">{passport.tracking_code ?? "—"}</span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${isPre(passport) ? "bg-amber-400 text-slate-900" : "bg-sky-100 text-sky-800"}`}>
              {isPre(passport) ? "⚡ تست‌شده در مرکز" : "🛡️ تست پس از سفارش"}
            </span>
            <span className="mr-auto text-xl font-extrabold text-slate-900">{fa(getPrice(passport))} <span className="text-xs font-medium text-slate-500">تومان</span></span>
          </div>
          <PassportView item={passport} />
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => { const p = passport; setPassport(null); onGo(6, p); }} className={btnPrimary}>خرید امن با درگاه امانی</button>
            <button type="button" onClick={() => { const p = passport; setPassport(null); onGo(4, p); }} className={btnGhost}>استعلام کامل در تب ۵</button>
          </div>
        </Modal>
      )}

      {showCompare && compareItems.length > 1 && (
        <Modal title="مقایسه قطعات" wide onClose={() => setShowCompare(false)}>
          <div className="mb-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <h3 className="mb-2 text-sm font-extrabold text-cyan-900">خلاصه به زبان ساده</h3>
            <ul className="list-inside list-disc space-y-1 text-sm leading-7 text-cyan-950">
              {buildSummary(compareItems).map((l) => <li key={l}>{l}</li>)}
            </ul>
          </div>
          <h3 className="mb-2 text-sm font-extrabold text-slate-800">مقایسه فنی</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-36" />
                  {compareItems.map((i) => (
                    <th key={i.listing_id} className="p-2 align-top">
                      <div className="mx-auto mb-2 aspect-[4/3] w-32 overflow-hidden rounded-xl border border-slate-200"><ProductImage src={getImage(i)} category={getCat(i)} alt={getModel(i)} /></div>
                      <p className="text-xs font-bold leading-5 text-slate-900">{getModel(i)}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildRows(compareItems).map((r) => (
                  <tr key={r.label} className="border-t border-slate-100">
                    <td className="py-2.5 pl-2 text-xs font-medium text-slate-500">{r.label}</td>
                    {compareItems.map((i) => (
                      <td key={i.listing_id} className={`py-2.5 text-center ${r.best?.(i) ? "font-extrabold text-emerald-600" : "text-slate-800"}`}>{r.value(i)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400">مقدارهای سبز بهترین گزینه در هر ردیف هستند.</p>
        </Modal>
      )}
    </div>
  );
}

const SELLER_STEPS = ["انتخاب قطعه", "قیمت و تصویر", "روش تست", "رسید و QR"];
const SELLER_CATS = ["GPU", "STORAGE", "RAM"];
const EXTRA_SAMPLES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70",
  "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=70",
];

const normDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");

function SellerTab({
  catalogItems,
  catalogLoading,
  catalogError,
  onCreated,
  onView,
}: {
  catalogItems: Catalog[];
  catalogLoading: boolean;
  catalogError: string | null;
  onCreated: () => Promise<void>;
  onView: (code: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState("GPU");
  const [selected, setSelected] = useState<Catalog | null>(null);
  const [price, setPrice] = useState("");
  const [box, setBox] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [vtype, setVtype] = useState<"PRE_TESTED" | "ON_DEMAND" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [receipt, setReceipt] = useState<{ code: string; vtype: string; model: string } | null>(null);

  const options = catalogItems.filter((c) => String(c.category ?? "").toUpperCase() === cat);
  const specs = Object.entries(selected?.base_specs ?? {});
  const priceOk = price !== "" && Number(price) > 0;
  const samples = [FALLBACK_IMG[cat], ...EXTRA_SAMPLES].filter(Boolean);

  const pickCat = (c: string) => {
    setCat(c);
    if (selected && String(selected.category ?? "").toUpperCase() !== c) setSelected(null);
  };

  const reset = () => {
    setStep(0);
    setSelected(null);
    setPrice("");
    setBox(true);
    setImageUrl("");
    setVtype("");
    setReceipt(null);
    setErr("");
  };

  const submit = async () => {
    if (!selected || !vtype || !priceOk) return;
    setSubmitting(true);
    setErr("");
    try {
      let sellerId: unknown = null;
      const { data: users } = await supabase.from("users").select("*").limit(1);
      const u = (users?.[0] ?? null) as Record<string, unknown> | null;
      if (u) sellerId = u.user_id ?? u.id ?? null;

      const base = {
        catalog_id: selected.catalog_id,
        seller_id: sellerId,
        verification_type: vtype,
        initial_price: Number(price),
        physical_location: vtype === "PRE_TESTED" ? "AT_TEST_CENTER" : "WITH_SELLER",
        box_and_accessories: box,
        seller_images: [imageUrl.trim() || FALLBACK_IMG[cat] || FALLBACK_IMG.GPU],
      };

      let code = "";
      let insertError: { message: string; code?: string } | null = null;
      for (let n = 0; n < 3; n++) {
        code = randCode("TH");
        const { error } = await supabase.from("listings").insert({ ...base, tracking_code: code });
        insertError = error;
        if (!error || error.code !== "23505") break;
      }
      if (insertError) throw new Error(insertError.message);

      await onCreated();
      setReceipt({ code, vtype, model: selected.model_name ?? "" });
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ثبت آگهی انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="mb-6 flex items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {SELLER_STEPS.map((s, n) => {
          const done = n < step;
          const active = n === step;
          return (
            <li key={s} className={`flex items-center ${n < SELLER_STEPS.length - 1 ? "flex-1" : ""}`}>
              <span className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-emerald-500 text-white" : active ? "bg-cyan-600 text-white ring-4 ring-cyan-100" : "bg-slate-200 text-slate-500"}`}>
                  {done ? "✓" : (n + 1).toLocaleString("fa-IR")}
                </span>
                <span className={`hidden text-sm sm:block ${active ? "font-bold text-slate-900" : "text-slate-500"}`}>{s}</span>
              </span>
              {n < SELLER_STEPS.length - 1 && <span className={`mx-3 h-0.5 flex-1 rounded ${done ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </li>
          );
        })}
      </ol>

      {step === 0 && (
        <Panel title="گام ۱ · انتخاب قطعه از کاتالوگ استاندارد" icon={FilePlus}>
          <div className="mb-4 flex flex-wrap gap-2">
            {SELLER_CATS.map((c) => (
              <button key={c} type="button" onClick={() => pickCat(c)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${cat === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                <CategoryIcon category={c} className="h-4 w-4" />
                {c}
              </button>
            ))}
          </div>

          {catalogLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((n) => <div key={n} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : catalogError ? (
            <p dir="ltr" className="rounded-xl bg-red-50 p-3 text-left text-sm text-red-700">{catalogError}</p>
          ) : options.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">در کاتالوگ قطعه‌ای برای این دسته ثبت نشده است.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((c, n) => (
                <button key={String(c.catalog_id ?? n)} type="button" onClick={() => setSelected(c)} className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-right transition ${selected === c ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
                    <CategoryIcon category={cat} className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-xs text-slate-500">{c.brand ?? "—"}</span>
                    <span className="block text-sm font-bold leading-6 text-slate-900">{c.model_name ?? "قطعه بدون نام"}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">مشخصات پایه «{selected.model_name}»</h3>
              <KV rows={specs.map(([k, v]) => [label(k), fmtVal(v)] as [string, string])} />
              <p className="mt-2 text-xs text-slate-400">مشخصات فنی از کاتالوگ خوانده می‌شود و لازم نیست آن‌ها را تایپ کنید.</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button type="button" disabled={!selected} onClick={() => setStep(1)} className={btnPrimary}>مرحله بعد</button>
          </div>
        </Panel>
      )}

      {step === 1 && (
        <Panel title="گام ۲ · قیمت‌گذاری، وضعیت جعبه و تصویر" icon={FilePlus}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Field label="قیمت (تومان)">
                <input dir="ltr" inputMode="numeric" value={price} onChange={(e) => setPrice(normDigits(e.target.value))} placeholder="12500000" className={`${inputCls} text-left`} />
              </Field>
              <p className="mt-2 min-h-6 text-lg font-extrabold text-slate-900">
                {priceOk ? <>{fa(price)} <span className="text-xs font-medium text-slate-500">تومان</span></> : <span className="text-sm font-normal text-slate-400">قیمت را وارد کنید</span>}
              </p>
              <div className="mt-3">
                <Toggle checked={box} onChange={() => setBox(!box)} tone="cyan">جعبه و متعلقات اصلی قطعه موجود است</Toggle>
              </div>
            </div>

            <div>
              <Field label="لینک تصویر قطعه (اختیاری)">
                <input dir="ltr" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={`${inputCls} text-left`} />
              </Field>
              <p className="mb-2 mt-3 text-xs font-medium text-slate-600">انتخاب سریع عکس نمونه</p>
              <div className="flex gap-2">
                {samples.map((s, n) => (
                  <button key={s} type="button" onClick={() => setImageUrl(s)} aria-label={`عکس نمونه ${n + 1}`} className={`h-14 w-14 overflow-hidden rounded-xl border-2 ${imageUrl === s ? "border-cyan-500" : "border-slate-200"}`}>
                    <ProductImage src={s} category={cat} alt={`نمونه ${n + 1}`} />
                  </button>
                ))}
              </div>
              <div className="mt-3 aspect-[4/3] w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <ProductImage key={imageUrl} src={imageUrl.trim() || null} category={cat} alt="پیش‌نمایش" />
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-400">اگر لینکی وارد نکنید، یک عکس پیش‌فرض مرتبط با دسته قطعه گذاشته می‌شود.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button type="button" onClick={() => setStep(0)} className={btnGhost}>مرحله قبل</button>
            <button type="button" disabled={!priceOk} onClick={() => setStep(2)} className={btnPrimary}>مرحله بعد</button>
          </div>
        </Panel>
      )}

      {step === 2 && (
        <Panel title="گام ۳ · انتخاب روش اعتمادسازی و تست" icon={ShieldCheck}>
          <div className="grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => setVtype("PRE_TESTED")} className={`relative rounded-2xl border-2 p-5 pt-7 text-right transition ${vtype === "PRE_TESTED" ? "border-amber-500 bg-amber-50 ring-4 ring-amber-100" : "border-amber-300 bg-white hover:bg-amber-50"}`}>
              <span className="absolute -top-3 right-4 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-slate-900">پیشنهاد ویژه فروش سریع</span>
              <p className="text-base font-extrabold text-slate-900">ارسال فوری به مرکز تست و دریافت نشان طلایی ⚡</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                قطعه را اکنون به مرکز تست ما تحویل می‌دهید. پس از صدور شناسنامه سلامت، آگهی شما با کادر طلایی در صدر ویترین قرار می‌گیرد و ۳ برابر سریع‌تر فروش می‌رود.
              </p>
            </button>
            <button type="button" onClick={() => setVtype("ON_DEMAND")} className={`rounded-2xl border-2 p-5 pt-7 text-right transition ${vtype === "ON_DEMAND" ? "border-sky-500 bg-sky-50 ring-4 ring-sky-100" : "border-slate-300 bg-white hover:bg-slate-50"}`}>
              <p className="text-base font-extrabold text-slate-900">نگهداری قطعه نزد خودم و تست پس از پیدا شدن خریدار 🛡️</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                قطعه پیش شما می‌ماند. هر زمان خریداری مبلغ را در صندوق امانی (Escrow) قفل کرد، قطعه را برای تست به مرکز ارسال می‌کنید.
              </p>
            </button>
          </div>

          <dl className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-slate-500">قطعه</dt><dd className="font-bold text-slate-900">{selected?.model_name}</dd></div>
            <div><dt className="text-xs text-slate-500">قیمت</dt><dd className="font-bold text-slate-900">{fa(price)} تومان</dd></div>
            <div>
              <dt className="text-xs text-slate-500">محل اولیه قطعه</dt>
              <dd className="font-bold text-slate-900">{vtype ? LOCATIONS[vtype === "PRE_TESTED" ? "AT_TEST_CENTER" : "WITH_SELLER"] : "—"}</dd>
            </div>
          </dl>

          {err && <p dir="auto" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
          <div className="mt-6 flex justify-between">
            <button type="button" onClick={() => setStep(1)} disabled={submitting} className={btnGhost}>مرحله قبل</button>
            <button type="button" disabled={!vtype || submitting} onClick={submit} className={btnPrimary}>
              {submitting ? "در حال ثبت..." : "تایید نهایی و ثبت آگهی"}
            </button>
          </div>
        </Panel>
      )}

      {step === 3 && receipt && (
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
                <button type="button" onClick={() => navigator.clipboard?.writeText(receipt.code)} className={`${btnGhost} mt-3 !py-1.5 text-xs`}>کپی کد رهگیری</button>
              </div>
              <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3">
                <QRCodeSVG value={receipt.code} size={140} />
              </div>
            </div>

            <div className="relative border-t-2 border-dashed border-slate-300">
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-100" />
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-100" />
              <p className="px-6 py-4 text-xs leading-6 text-slate-400">این رسید را نگه دارید؛ با همین کد می‌توانید در تب «استعلام شناسنامه سلامت» وضعیت قطعه را ببینید.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => onView(receipt.code)} className={btnPrimary}>مشاهده آگهی من در بازارچه (تب ۱)</button>
            <button type="button" onClick={reset} className={btnGhost}>ثبت آگهی جدید</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BuilderTab({ listings }: { listings: Listing[] }) {
  const [mode, setMode] = useState<"DESKTOP" | "LAPTOP">("DESKTOP");
  const [psu, setPsu] = useState("650");
  const [cpuTdp, setCpuTdp] = useState("105");
  const [manualTdp, setManualTdp] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({ GPU: "", RAM: "", STORAGE: "" });

  const pick = (cat: string) => listings.find((l) => l.listing_id === sel[cat]) ?? null;
  const gpu = pick("GPU"), ram = pick("RAM"), ssd = pick("STORAGE");
  const chosen = [gpu, ram, ssd].filter((x): x is Listing => Boolean(x));
  const gpuTdp = gpu ? specNum(getSpecs(gpu), ["tdp_w", "tdp", "power_w"]) ?? toNum(manualTdp) : null;
  const ff = (i: Listing) => String(getSpecs(i).form_factor ?? "");

  const checks: { level: "ok" | "warn" | "bad"; text: string }[] = [];
  if (chosen.length === 0) checks.push({ level: "warn", text: "برای بررسی سازگاری، حداقل یک قطعه انتخاب کنید." });
  if (mode === "DESKTOP") {
    if (gpu) {
      if (gpuTdp === null) checks.push({ level: "warn", text: "توان مصرفی این کارت گرافیک در کاتالوگ ثبت نشده؛ عدد را دستی وارد کنید." });
      else {
        const need = Math.ceil(((gpuTdp + (toNum(cpuTdp) ?? 0) + 100) * 1.3) / 50) * 50;
        const have = toNum(psu) ?? 0;
        const level = have >= need ? "ok" : have >= need * 0.9 ? "warn" : "bad";
        checks.push({ level, text: `پاور پیشنهادی حدود ${fa(need)} وات است؛ پاور شما ${fa(have)} وات است.` });
      }
      if (getSpecs(gpu).power_connector) checks.push({ level: "ok", text: `کانکتور برق مورد نیاز کارت: ${fmtVal(getSpecs(gpu).power_connector)}` });
    }
    if (ram && /so-?dimm/i.test(ff(ram))) checks.push({ level: "bad", text: "رم SODIMM مخصوص لپ‌تاپ است و روی مادربرد دسکتاپ جا نمی‌شود." });
  } else {
    if (gpu) checks.push({ level: "bad", text: "کارت گرافیک دسکتاپ روی لپ‌تاپ نصب نمی‌شود؛ در لپ‌تاپ فقط رم و SSD قابل ارتقا هستند." });
    if (ram && ff(ram) && !/so-?dimm/i.test(ff(ram))) checks.push({ level: "bad", text: "رم دسکتاپ (DIMM) روی لپ‌تاپ جا نمی‌شود؛ رم SODIMM بردارید." });
    if (ssd) checks.push({ level: "warn", text: "قبل از خرید SSD مطمئن شوید لپ‌تاپ شما اسلات M.2 یا جای هارد ۲٫۵ اینچی دارد." });
  }
  chosen.filter((i) => !getReport(i)).forEach((i) => checks.push({ level: "warn", text: `«${getModel(i)}» هنوز شناسنامه سلامت ندارد و بعد از سفارش تست می‌شود.` }));
  if (chosen.length > 0 && checks.every((c) => c.level === "ok")) checks.push({ level: "ok", text: "تا اینجا مشکل سازگاری پیدا نشد." });

  const total = chosen.reduce((s, i) => s + (getPrice(i) ?? 0), 0);
  const icon = { ok: "✅", warn: "⚠️", bad: "❌" };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Panel title="سیستم‌ساز و بررسی سازگاری" icon={Sparkles}>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {([["DESKTOP", "کامپیوتر دسکتاپ"], ["LAPTOP", "لپ‌تاپ"]] as const).map(([k, t]) => (
            <button key={k} type="button" onClick={() => setMode(k)} className={`rounded-lg py-2 text-sm font-bold transition ${mode === k ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>{t}</button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.slice(1).map((c) => (
            <Field key={c.key} label={c.label}>
              <select value={sel[c.key]} onChange={(e) => setSel({ ...sel, [c.key]: e.target.value })} className={inputCls}>
                <option value="">انتخاب نشده</option>
                {listings.filter((l) => getCat(l) === c.key).map((l) => <option key={l.listing_id} value={l.listing_id}>{getModel(l)} — {fa(getPrice(l))}</option>)}
              </select>
            </Field>
          ))}
          {mode === "DESKTOP" && (
            <>
              <Field label="توان پاور (وات)"><input type="number" value={psu} onChange={(e) => setPsu(e.target.value)} className={inputCls} /></Field>
              <Field label="توان پردازنده (وات)">
                <select value={cpuTdp} onChange={(e) => setCpuTdp(e.target.value)} className={inputCls}>
                  {[65, 95, 105, 125, 170].map((w) => <option key={w} value={w}>{fa(w)} وات</option>)}
                </select>
              </Field>
              {gpu && specNum(getSpecs(gpu), ["tdp_w", "tdp", "power_w"]) === null && (
                <Field label="توان کارت گرافیک (وات، دستی)"><input type="number" value={manualTdp} onChange={(e) => setManualTdp(e.target.value)} className={inputCls} /></Field>
              )}
            </>
          )}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="نتیجه بررسی">
          <ul className="space-y-2">
            {checks.map((c, n) => <li key={n} className="flex gap-2 text-sm leading-7 text-slate-700"><span>{icon[c.level]}</span>{c.text}</li>)}
          </ul>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">جمع قیمت قطعات</span>
            <span className="text-xl font-extrabold text-slate-900">{fa(total)} <span className="text-xs font-medium text-slate-500">تومان</span></span>
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-400">محاسبه پاور تخمینی است: (توان کارت + پردازنده + ۱۰۰ وات سایر قطعات) × ۱٫۳.</p>
        </Panel>
      </div>
    </div>
  );
}

function TechnicianTab() {
  const [f, set] = useForm({ mode: "ONSITE", service: "نصب فیزیکی قطعه", city: "", address: "", date: "", slot: "۹ تا ۱۲", phone: "", anydesk: "", code: "" });
  const [err, setErr] = useState("");
  const [ticket, setTicket] = useState<{ id: string; step: number } | null>(null);
  const STEPS = ["درخواست ثبت شد", "تکنسین تایید شد", f.mode === "ONSITE" ? "تکنسین در مسیر است" : "اتصال AnyDesk برقرار شد", "کار انجام و گزارش ثبت شد"];
  const FEE = f.mode === "ONSITE" ? 400000 : 150000;

  const submit = () => {
    if (!/^09\d{9}$/.test(f.phone.trim())) return setErr("شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.");
    if (f.mode === "ONSITE" && (!f.city.trim() || !f.address.trim() || !f.date)) return setErr("شهر، نشانی و تاریخ را کامل کنید.");
    if (f.mode === "REMOTE" && !/^\d{9,10}$/.test(f.anydesk.replace(/\s/g, ""))) return setErr("شناسه AnyDesk باید ۹ یا ۱۰ رقم باشد.");
    setErr("");
    setTicket({ id: randCode("TK", 4), step: 0 });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Panel title="اعزام تکنسین و نصب" icon={Wrench}>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {([["ONSITE", "حضوری"], ["REMOTE", "از راه دور (AnyDesk)"]] as const).map(([k, t]) => (
            <button key={k} type="button" onClick={() => set("mode", k)} className={`rounded-lg py-2 text-sm font-bold transition ${f.mode === k ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>{t}</button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نوع خدمت">
            <select value={f.service} onChange={(e) => set("service", e.target.value)} className={inputCls}>
              {["نصب فیزیکی قطعه", "نصب درایور و تنظیمات", "تست پایداری بعد از نصب", "عیب‌یابی"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="کد رهگیری قطعه (اختیاری)"><input dir="ltr" value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="TH-84920" className={`${inputCls} text-left`} /></Field>
          <Field label="شماره موبایل"><input dir="ltr" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09123456789" className={`${inputCls} text-left`} /></Field>
          {f.mode === "ONSITE" ? (
            <>
              <Field label="شهر"><input value={f.city} onChange={(e) => set("city", e.target.value)} className={inputCls} /></Field>
              <Field label="تاریخ"><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={inputCls} /></Field>
              <Field label="بازه زمانی">
                <select value={f.slot} onChange={(e) => set("slot", e.target.value)} className={inputCls}>
                  {["۹ تا ۱۲", "۱۲ تا ۱۵", "۱۵ تا ۱۸", "۱۸ تا ۲۱"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2"><Field label="نشانی"><textarea rows={2} value={f.address} onChange={(e) => set("address", e.target.value)} className={`${inputCls} h-auto py-2`} /></Field></div>
            </>
          ) : (
            <Field label="شناسه AnyDesk"><input dir="ltr" value={f.anydesk} onChange={(e) => set("anydesk", e.target.value)} placeholder="123 456 789" className={`${inputCls} text-left`} /></Field>
          )}
        </div>
        {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <div className="mt-5 flex items-center gap-4">
          <button type="button" onClick={submit} className={btnPrimary}>ثبت درخواست</button>
          <span className="text-sm text-slate-500">هزینه تخمینی: <b className="text-slate-900">{fa(FEE)}</b> تومان</span>
        </div>
      </Panel>

      <div className="space-y-5">
        {ticket && (
          <Panel title={`درخواست ${ticket.id}`}>
            <ol className="space-y-3">
              {STEPS.map((s, n) => (
                <li key={s} className={`flex items-center gap-3 text-sm ${n <= ticket.step ? "font-bold text-emerald-700" : "text-slate-400"}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${n <= ticket.step ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>{n <= ticket.step ? "✓" : n + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={ticket.step >= 3} onClick={() => setTicket({ ...ticket, step: ticket.step + 1 })} className={`${btnGhost} !py-1.5 text-xs`}>مرحله بعد (شبیه‌سازی)</button>
              <button type="button" onClick={() => setTicket(null)} className="text-xs text-slate-500 hover:text-red-600">لغو درخواست</button>
            </div>
          </Panel>
        )}
        {f.mode === "REMOTE" && (
          <Panel title="راهنمای اتصال AnyDesk">
            <ol className="list-inside list-decimal space-y-2 text-sm leading-7 text-slate-700">
              <li>برنامه AnyDesk را از سایت رسمی نصب کنید.</li>
              <li>شناسه نمایش‌داده‌شده در برنامه را در فرم بنویسید.</li>
              <li>وقتی تکنسین درخواست اتصال فرستاد، فقط همان را تایید کنید.</li>
              <li>رمز حساب بانکی یا کد پیامکی هرگز به تکنسین ندهید؛ ما چنین چیزی نمی‌خواهیم.</li>
            </ol>
          </Panel>
        )}
      </div>
    </div>
  );
}

function LookupTab({ listings, preset }: { listings: Listing[]; preset: string }) {
  const [input, setInput] = useState(preset);
  const [result, setResult] = useState<Listing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [holo, setHolo] = useState("");

  const lookup = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setNotFound(false);
    setHolo("");
    let found = listings.find((l) => (l.tracking_code ?? "").toUpperCase() === code) ?? null;
    if (!found) {
      try {
        const { data } = await supabase.from("listings").select(SELECT).eq("tracking_code", code).maybeSingle();
        found = (data as Listing | null) ?? null;
      } catch {
        found = null;
      }
    }
    setResult(found);
    setNotFound(!found);
    setBusy(false);
  };

  useEffect(() => {
    setInput(preset);
    if (preset) lookup(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const report = result ? getReport(result) : null;
  const holoOk = report?.hologram_code && holo.trim() ? report.hologram_code.trim().toUpperCase() === holo.trim().toUpperCase() : null;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Panel title="استعلام شناسنامه سلامت" icon={FileSearch}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input dir="ltr" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup(input)} placeholder="کد رهگیری، مثلاً TH-84920" className={`${inputCls} text-left`} />
          <button type="button" disabled={busy} onClick={() => lookup(input)} className={`${btnPrimary} shrink-0`}>{busy ? "در حال استعلام..." : "استعلام"}</button>
        </div>
        {notFound && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">کدی با این شماره پیدا نشد. کد را دوباره بررسی کنید.</p>}
      </Panel>

      {result && (
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900">{getModel(result)}</h2>
            <span dir="ltr" className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm text-slate-700">{result.tracking_code}</span>
          </div>
          <PassportView item={result} />
          {report?.hologram_code && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-bold text-slate-800">تطبیق هولوگرام روی قطعه</p>
              <input dir="ltr" value={holo} onChange={(e) => setHolo(e.target.value)} placeholder="کد چاپ‌شده روی هولوگرام" className={`${inputCls} text-left`} />
              {holoOk !== null && (
                <p className={`mt-3 text-sm font-bold ${holoOk ? "text-emerald-600" : "text-red-600"}`}>
                  {holoOk ? "✅ کد هولوگرام با شناسنامه مطابقت دارد." : "❌ کد هولوگرام مطابقت ندارد؛ قطعه را تحویل نگیرید."}
                </p>
              )}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function TestCenterTab({ listings }: { listings: Listing[] }) {
  const candidates = useMemo(() => {
    const c = listings.filter((l) => l.physical_location === "AT_TEST_CENTER" || !getReport(l));
    return c.length ? c : listings;
  }, [listings]);
  const [f, set] = useForm({ listingId: "", serial: "", hologram: "", maxTemp: "", hotspot: "", fan: "", mark: "", seal: true, repaired: false, note: "" });
  const [shots, setShots] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<{ score: number; grade: string; reasons: string[] } | null>(null);
  const [payload, setPayload] = useState<object | null>(null);

  const analyze = () => {
    let score = 100;
    const reasons: string[] = [];
    const t = toNum(f.maxTemp), h = toNum(f.hotspot), fan = toNum(f.fan);
    if (t !== null) { const d = t > 90 ? 25 : t > 80 ? 15 : t > 70 ? 7 : 0; if (d) { score -= d; reasons.push(`دمای ماکزیمم ${fa(t)} درجه است (−${fa(d)})`); } }
    if (h !== null) { const d = h > 105 ? 15 : h > 95 ? 8 : 0; if (d) { score -= d; reasons.push(`دمای نقطه داغ ${fa(h)} درجه است (−${fa(d)})`); } }
    if (fan !== null && fan > 85) { score -= 8; reasons.push("فن برای خنک ماندن باید نزدیک سرعت کامل بچرخد (−۸)"); }
    if (!f.seal) { score -= 10; reasons.push("پلمپ پیچ‌ها شکسته است (−۱۰)"); }
    if (f.repaired) { score -= 20; reasons.push("برد سابقه تعمیر دارد (−۲۰)"); }
    if (reasons.length === 0) reasons.push("مورد منفی‌ای در داده‌های واردشده دیده نشد.");
    score = Math.max(0, score);
    setAnalysis({ score, grade: score >= 85 ? "A" : score >= 70 ? "B" : "C", reasons });
  };

  const submit = () => {
    if (!f.listingId || !analysis) return;
    setPayload({
      listing_id: f.listingId,
      overall_score: analysis.score,
      health_grade: `GRADE_${analysis.grade}`,
      serial_number: f.serial,
      hologram_code: f.hologram,
      technician_note: f.note,
      detailed_metrics: { max_temp: toNum(f.maxTemp), hotspot_temp: toNum(f.hotspot), fan_speed_pct: toNum(f.fan), "3dmark_score": toNum(f.mark) },
      physical_status: { warranty_seal_intact: f.seal, repaired_board: f.repaired },
    });
  };

  const num = (k: "maxTemp" | "hotspot" | "fan" | "mark", text: string) => (
    <Field label={text}><input type="number" value={f[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} /></Field>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Panel title="پنل مرکز تست" icon={Activity}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="قطعه در صف تست">
              <select value={f.listingId} onChange={(e) => set("listingId", e.target.value)} className={inputCls}>
                <option value="">انتخاب کنید</option>
                {candidates.map((l) => <option key={l.listing_id} value={l.listing_id}>{l.tracking_code} · {getModel(l)}</option>)}
              </select>
            </Field>
          </div>
          <Field label="شماره سریال"><input dir="ltr" value={f.serial} onChange={(e) => set("serial", e.target.value)} className={`${inputCls} text-left`} /></Field>
          <Field label="کد هولوگرام">
            <div className="flex gap-2">
              <input dir="ltr" value={f.hologram} onChange={(e) => set("hologram", e.target.value)} className={`${inputCls} text-left`} />
              <button type="button" onClick={() => set("hologram", randCode("HG", 8))} className={`${btnGhost} shrink-0 !px-3`}>تولید</button>
            </div>
          </Field>
          {num("maxTemp", "دمای ماکزیمم (°C)")}
          {num("hotspot", "دمای نقطه داغ (°C)")}
          {num("fan", "سرعت فن (٪)")}
          {num("mark", "امتیاز 3DMark")}
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={f.seal} onChange={(e) => set("seal", e.target.checked)} className="h-4 w-4 accent-emerald-600" />پلمپ پیچ‌ها سالم است</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={f.repaired} onChange={(e) => set("repaired", e.target.checked)} className="h-4 w-4 accent-red-600" />برد تعمیر شده است</label>
          <div className="sm:col-span-2">
            <Field label="عکس نتیجه بنچمارک">
              <input type="file" accept="image/*" multiple onChange={(e) => setShots(Array.from(e.target.files ?? []).map((file) => URL.createObjectURL(file)))} className="block w-full text-sm text-slate-600 file:ml-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white" />
            </Field>
            {shots.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{shots.slice(0, 6).map((s) => <img key={s} src={s} alt="بنچمارک" className="aspect-video w-full rounded-lg border border-slate-200 object-cover" />)}</div>}
          </div>
          <div className="sm:col-span-2"><Field label="یادداشت تکنسین"><textarea rows={3} value={f.note} onChange={(e) => set("note", e.target.value)} className={`${inputCls} h-auto py-2`} /></Field></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={analyze} className={btnGhost}>تحلیل خودکار</button>
          <button type="button" disabled={!f.listingId || !analysis} onClick={submit} className={btnPrimary}>ثبت گزارش</button>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="نتیجه تحلیل خودکار">
          {analysis ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-slate-900">{fa(analysis.score)} <span className="text-sm font-normal text-slate-500">از ۱۰۰</span></span>
                <GradeBadge grade={analysis.grade} />
              </div>
              <ScoreBar score={analysis.score} />
              <ul className="mt-4 list-inside list-disc space-y-1 text-sm leading-7 text-slate-700">{analysis.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              <p className="mt-3 text-xs text-slate-400">این تحلیل بر پایه قاعده‌های ساده دما، فن و وضعیت فیزیکی است و تصمیم نهایی با تکنسین است.</p>
            </>
          ) : (
            <p className="text-sm leading-7 text-slate-500">داده‌های تست را وارد کنید و «تحلیل خودکار» را بزنید.</p>
          )}
        </Panel>
        {payload && (
          <Panel title="گزارش آماده درج در test_reports">
            <pre dir="ltr" className="max-h-72 overflow-auto rounded-xl bg-slate-900 p-3 text-left text-xs leading-5 text-emerald-300">{JSON.stringify(payload, null, 2)}</pre>
          </Panel>
        )}
      </div>
    </div>
  );
}

function EscrowTab({ listings, presetId }: { listings: Listing[]; presetId: string }) {
  const [id, setId] = useState(presetId || listings[0]?.listing_id || "");
  const [stage, setStage] = useState(0);
  const [dispute, setDispute] = useState(false);
  const [pct, setPct] = useState("3");
  const [testFee, setTestFee] = useState("150000");
  const [ship, setShip] = useState("120000");

  useEffect(() => { if (presetId) setId(presetId); }, [presetId]);
  useEffect(() => { if (!id && listings[0]) setId(listings[0].listing_id); }, [listings, id]);

  const item = listings.find((l) => l.listing_id === id) ?? null;
  const price = item ? getPrice(item) ?? 0 : 0;
  const commission = Math.round((price * (toNum(pct) ?? 0)) / 100);
  const tFee = item && !isPre(item) ? toNum(testFee) ?? 0 : 0;
  const shipping = toNum(ship) ?? 0;
  const STAGES = ["واریز به حساب امانی", "تست و تایید سلامت", "ارسال به خریدار", "تایید دریافت و آزادسازی وجه"];
  const next = ["واریز مبلغ به حساب امانی", "تایید نتیجه تست", "ثبت ارسال", "تایید دریافت سالم"];

  const choose = (v: string) => { setId(v); setStage(0); setDispute(false); };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <Panel title="اتاق معامله امن" icon={Lock}>
          <Field label="قطعه مورد معامله">
            <select value={id} onChange={(e) => choose(e.target.value)} className={inputCls}>
              {listings.map((l) => <option key={l.listing_id} value={l.listing_id}>{l.tracking_code} · {getModel(l)}</option>)}
            </select>
          </Field>
          {item ? (
            <>
              <p className="mt-3 text-sm text-slate-500">
                محل فعلی قطعه: <b className="text-slate-800">{LOCATIONS[item.physical_location ?? ""] ?? "—"}</b>
              </p>
              <ol className="mt-5 space-y-3">
                {STAGES.map((s, n) => (
                  <li key={s} className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${dispute && n === stage ? "border-red-300 bg-red-50 text-red-700" : n < stage ? "border-emerald-200 bg-emerald-50 font-bold text-emerald-700" : n === stage ? "border-cyan-300 bg-cyan-50 font-bold text-cyan-800" : "border-slate-200 text-slate-400"}`}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">{n < stage ? "✓" : n + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {stage < 4 && !dispute && <button type="button" onClick={() => setStage(stage + 1)} className={btnPrimary}>{next[stage]}</button>}
                {stage >= 1 && stage < 4 && !dispute && <button type="button" onClick={() => setDispute(true)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">ثبت اختلاف</button>}
                {(stage > 0 || dispute) && <button type="button" onClick={() => { setStage(0); setDispute(false); }} className="text-sm text-slate-500 hover:text-slate-800">شروع دوباره</button>}
              </div>
              <p className={`mt-4 rounded-xl p-3 text-sm leading-7 ${dispute ? "bg-red-50 text-red-700" : stage === 4 ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"}`}>
                {dispute ? "اختلاف ثبت شد؛ وجه تا بررسی کارشناس در حساب امانی می‌ماند." : stage === 0 ? "هنوز مبلغی واریز نشده است." : stage < 4 ? "وجه شما نزد درگاه امانی نگه داشته می‌شود و هنوز به فروشنده نرسیده است." : "معامله کامل شد و وجه به فروشنده پرداخت شد."}
              </p>
              <p className="mt-2 text-xs text-slate-400">این بخش شبیه‌سازی جریان معامله است و هنوز به درگاه پرداخت وصل نیست.</p>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">آگهی‌ای برای انتخاب وجود ندارد.</p>
          )}
        </Panel>

        <Panel title="قوانین معامله امن">
          <ul className="list-inside list-disc space-y-2 text-sm leading-7 text-slate-700">
            <li>پول خریدار تا تایید سلامت قطعه در مرکز تست، نزد درگاه امانی می‌ماند.</li>
            <li>قطعه فقط با کد رهگیری و هولوگرام مطابق شناسنامه تحویل داده می‌شود.</li>
            <li>اگر قطعه با شناسنامه مطابقت نداشت، خریدار تا پایان بررسی اختلاف مبلغی پرداخت نمی‌کند.</li>
            <li>معامله، چت و پرداخت خارج از پلتفرم زیر پوشش درگاه امانی نیست.</li>
          </ul>
        </Panel>
      </div>

      <Panel title="ماشین‌حساب کارمزد">
        <div className="space-y-3">
          <Field label="کارمزد پلتفرم از فروشنده (٪)"><input type="number" value={pct} onChange={(e) => setPct(e.target.value)} className={inputCls} /></Field>
          <Field label="هزینه تست پس از سفارش (تومان)"><input type="number" value={testFee} onChange={(e) => setTestFee(e.target.value)} className={inputCls} /></Field>
          <Field label="هزینه ارسال (تومان)"><input type="number" value={ship} onChange={(e) => setShip(e.target.value)} className={inputCls} /></Field>
        </div>
        <dl className="mt-5 divide-y divide-slate-100 text-sm">
          {([
            ["قیمت قطعه", price],
            ["هزینه تست", tFee],
            ["هزینه ارسال", shipping],
            ["کارمزد پلتفرم (از فروشنده)", commission],
          ] as [string, number][]).map(([k, v]) => (
            <div key={k} className="flex justify-between py-2"><dt className="text-slate-500">{k}</dt><dd className="font-bold text-slate-900">{fa(v)}</dd></div>
          ))}
        </dl>
        <div className="mt-4 space-y-2 rounded-xl bg-slate-900 p-4 text-white">
          <div className="flex justify-between text-sm"><span className="text-slate-300">مبلغ پرداختی خریدار</span><b className="text-cyan-300">{fa(price + tFee + shipping)} تومان</b></div>
          <div className="flex justify-between text-sm"><span className="text-slate-300">دریافتی فروشنده</span><b className="text-emerald-300">{fa(price - commission)} تومان</b></div>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-400">درصد و هزینه‌های بالا نمونه‌اند و می‌توانید آن‌ها را تغییر دهید.</p>
      </Panel>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogItems, setCatalogItems] = useState<Catalog[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedReady, setSavedReady] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [lookupCode, setLookupCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qrCode = params.get("code") || params.get("passport");
      if (qrCode) {
        setLookupCode(qrCode);
        setTab(4);
      }
    }
  }, []);
  const [escrowId, setEscrowId] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("listings")
      .select(SELECT)
      .order("verification_type", { ascending: false });
    if (err) setError(err.message);
    else setListings((data as Listing[]) ?? []);
    setLoading(false);
  }, []);

  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    const { data, error: err } = await supabase.from("hardware_catalog").select("*");
    if (err) setCatalogError(err.message);
    else setCatalogItems((data as Catalog[]) ?? []);
    setCatalogLoading(false);
  }, []);

  useEffect(() => {
    fetchListings();
    fetchCatalog();
  }, [fetchListings, fetchCatalog]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("saved_listings");
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
    setSavedReady(true);
  }, []);

  useEffect(() => {
    if (!savedReady) return;
    try { localStorage.setItem("saved_listings", JSON.stringify(saved)); } catch {}
  }, [saved, savedReady]);

  const toggleSave = (id: string) => setSaved((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const goTo = (t: number, item?: Listing) => {
    if (item) {
      setLookupCode(item.tracking_code ?? "");
      setEscrowId(item.listing_id);
    }
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const viewListing = (code: string) => {
    setSavedOnly(false);
    setQuery(code);
    goTo(0);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg">
        <header>
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
            <button type="button" onClick={() => goTo(0)} className="flex shrink-0 items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900">
                <Cpu className="h-6 w-6" />
              </span>
              <span className="hidden text-right leading-tight sm:block">
                <span className="block text-lg font-extrabold">هاردینو</span>
                <span className="block text-[11px] text-emerald-400">معامله امن سخت‌افزار کارکرده</span>
              </span>
            </button>

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setTab(0); }}
                placeholder="جستجوی کارت گرافیک، رم، SSD یا کد رهگیری..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-800 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <button
              type="button"
              onClick={() => { setTab(0); setSavedOnly(!savedOnly); }}
              aria-pressed={savedOnly}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${savedOnly ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-slate-700 text-slate-200 hover:border-cyan-400"}`}
            >
              <Bookmark className={`h-5 w-5 ${savedOnly ? "fill-current" : ""}`} />
              <span className="hidden md:inline">آگهی‌های ذخیره‌شده</span>
              {saved.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[11px] font-bold text-slate-900">{saved.length.toLocaleString("fa-IR")}</span>}
            </button>

            <button type="button" onClick={() => goTo(1)} className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-400 px-4 text-sm font-extrabold text-slate-900 transition hover:bg-emerald-300">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">فروش قطعه در پلتفرم</span>
              <span className="sm:hidden">فروش</span>
            </button>
          </div>
        </header>

        <nav className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
            {TABS.map((t, n) => {
              const Icon = t.icon;
              return (
                <button key={t.label} type="button" onClick={() => goTo(n)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition ${n === tab ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-300 hover:text-white"}`}>
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 0 && (
            <>
            <HeroBanner onNavigateTab={setTab} />
            

          <Storefront listings={listings} loading={loading} error={error} onRetry={fetchListings} query={query} setQuery={setQuery} saved={saved} toggleSave={toggleSave} savedOnly={savedOnly} setSavedOnly={setSavedOnly} onGo={goTo} />
          </>
        )}
        {tab === 1 && <Tab2SellerHub listings={listings} onRefresh={fetchListings} onGoToMarket={() => setTab(0)} />}
        {tab === 2 && <Tab3SmartBuilder listings={listings} />}
        {tab === 3 && <Tab4TechnicianDispatch />}
        {tab === 4 && <Tab5HealthPassport listings={listings} />}
        {tab === 5 && <Tab6TestCenterAI listings={listings} onRefresh={fetchListings} />}
        {tab === 6 && <Tab7EscrowRoom listings={listings} presetId={escrowId} />}
      </main>
    
      <Footer onNavigateTab={setTab} />
</div>
  );
}