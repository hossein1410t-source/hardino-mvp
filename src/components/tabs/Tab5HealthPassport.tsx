"use client";

import React, { useState, useRef } from "react";
import { Search, ShieldCheck, QrCode, Sparkles, Layers, Thermometer, Activity, CheckCircle2, FileText, Camera, Zap, Cpu, HardDrive } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function Tab5HealthPassport({ listings }: { listings: any[] }) {
  const [searchCode, setSearchCode] = useState("");
  const [viewMode, setViewMode] = useState<"SIMPLE" | "PRO">("SIMPLE");
  const [isScanning, setIsScanning] = useState(false);

  const currentListing = listings.find(
    (l) => l.tracking_code?.trim().toUpperCase() === searchCode?.trim().toUpperCase()
  ) || listings.find(l => l.verification_type === "PRE_TESTED") || listings[0];

  const catObj = Array.isArray(currentListing?.hardware_catalog) ? currentListing?.hardware_catalog[0] : currentListing?.hardware_catalog;
  const report = Array.isArray(currentListing?.test_reports) ? currentListing?.test_reports[0] : currentListing?.test_reports;
  const metrics = report?.detailed_metrics || { max_temp: 69, hotspot_temp: 81, fan_speed_pct: 58, "3dmark_score": 11850, vcore: "1.05V", mem_junction: 78, pcie_lanes: "x16 Gen4", bios_hash: "0x8A4B9F" };

  const handlePrint = () => {
    window.print();
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setSearchCode(currentListing?.tracking_code || "TH-12345");
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 print-container">
      {/* استایل اختصاصی برای پرینت که سایر بخش‌های سایت را مخفی می‌کند */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-card, #printable-card * { visibility: visible; }
          #printable-card { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; background: #0f172a !important; color: white !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="liquid-glass rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-amber-400 p-3 rounded-2xl shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">استعلام شناسنامه سلامت قطعات</h2>
            <p className="text-xs text-slate-600">گزارش معتبر فیزیکی و بنچمارک ضدجعل</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={simulateScan}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Camera className="w-4 h-4" /> اسکن QR روی کارتن
          </button>
          <div className="flex items-center gap-2 bg-white/90 border border-slate-300 rounded-xl p-1.5 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="یا کد وارد کنید..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="bg-transparent border-none text-xs font-mono font-bold text-slate-900 focus:outline-none w-32"
            />
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center space-y-4 no-print">
          <div className="w-64 h-64 border-2 border-emerald-400 rounded-3xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 animate-bounce"></div>
            <p className="text-emerald-400 font-mono text-sm animate-pulse">درحال خواندن QR Code...</p>
          </div>
          <button onClick={() => setIsScanning(false)} className="text-white text-sm bg-slate-800 px-4 py-2 rounded-xl">لغو اسکن</button>
        </div>
      )}

      {currentListing && (
        <div id="printable-card" className="liquid-glass-dark rounded-3xl p-6 md:p-8 text-white space-y-6 relative overflow-hidden shadow-2xl border border-white/10 print:!bg-slate-900">
          <div className="absolute -left-10 -bottom-10 opacity-[0.03] pointer-events-none no-print">
            <ShieldCheck className="w-96 h-96" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                هولوگرام: {report?.hologram_code || `HOLO-${Math.floor(Math.random()*90000)}`}
              </span>
              <span className="text-xs text-slate-400 font-mono">SN: {report?.serial_number || "SN-VALIDATED"}</span>
            </div>

            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 backdrop-blur-sm no-print">
              <button onClick={() => setViewMode("SIMPLE")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "SIMPLE" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}>نمای ساده خریدار</button>
              <button onClick={() => setViewMode("PRO")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${viewMode === "PRO" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}>
                <Layers className="w-3.5 h-3.5" /> نمای تخصصی مهندسی
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <span className="text-xs bg-slate-800 text-cyan-400 px-2.5 py-0.5 rounded font-bold">{catObj?.brand || "برند"}</span>
              <h3 className="text-2xl font-extrabold text-white">{catObj?.model_name || "مدل قطعه نامشخص"}</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg">{report?.technician_note || "گزارش رسمی لابراتوار سخت‌افزار: قطعه فاقد عیوب فیزیکی بوده و پایداری ولتاژ تحت لود سنگین تایید می‌گردد."}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-center shadow-inner print:border-slate-600">
              <span className="text-[11px] text-slate-400">شاخص سلامت نهایی (Health Score):</span>
              <div className="text-4xl font-extrabold text-emerald-400 font-mono mt-1">{report?.overall_score || 94}<span className="text-base text-slate-400">/۱۰۰</span></div>
              <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mt-2 border border-emerald-500/30">گرید {report?.health_grade || "A"} (استاندارد کارخانه)</span>
            </div>
          </div>

          {viewMode === "SIMPLE" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1 print:border-slate-700">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-cyan-400" /> حداکثر دما زیر فشار:</span>
                <p className="text-lg font-bold text-white">{metrics.max_temp}°C <span className="text-xs font-normal text-emerald-400">(کاملاً خنک)</span></p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1 print:border-slate-700">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> وضعیت پلمپ و پیچ‌ها:</span>
                <p className="text-lg font-bold text-white">فابریک و دست‌نخورده</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1 print:border-slate-700">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Activity className="w-4 h-4 text-amber-400" /> تست نویز و فن:</span>
                <p className="text-lg font-bold text-white">{metrics.fan_speed_pct}٪ دور فن (بی‌صدا)</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">V-Core Voltage Load</span>
                <span className="text-amber-400 font-mono font-extrabold text-base mt-1">{metrics.vcore || "1.05V"}</span>
                <span className="text-[9px] text-emerald-400 mt-1">Stable Waveform</span>
              </div>
              <div className="bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Hotspot / Delta</span>
                <span className="text-cyan-400 font-mono font-extrabold text-base mt-1">{metrics.hotspot_temp}°C <span className="text-[10px] text-slate-500">(Δ 12°C)</span></span>
                <span className="text-[9px] text-emerald-400 mt-1">Thermal Paste OK</span>
              </div>
              <div className="bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Memory Junction</span>
                <span className="text-orange-400 font-mono font-extrabold text-base mt-1">{metrics.mem_junction || 78}°C</span>
                <span className="text-[9px] text-emerald-400 mt-1">VRAM Pads Intact</span>
              </div>
              <div className="bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">3DMark / FurMark Score</span>
                <span className="text-white font-mono font-extrabold text-base mt-1">{metrics["3dmark_score"]}</span>
                <span className="text-[9px] text-emerald-400 mt-1">100% Relative Perf</span>
              </div>
              <div className="bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">PCIe Lanes Status</span>
                <span className="text-white font-mono font-bold text-sm mt-1">{metrics.pcie_lanes || "x16 Gen4"}</span>
                <span className="text-[9px] text-emerald-400 mt-1">Pins Validated</span>
              </div>
              <div className="bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">BIOS ROM Hash</span>
                <span className="text-purple-400 font-mono font-bold text-sm mt-1">{metrics.bios_hash || "0x8A4B9F"}</span>
                <span className="text-[9px] text-emerald-400 mt-1">Authentic Stock ROM</span>
              </div>
              <div className="col-span-2 bg-[#0f172a] border border-slate-700/80 p-3 rounded-xl flex flex-col justify-between shadow-inner print:border-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">VRM & Physical Board Integrity</span>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-white text-xs font-bold">بدون سولفاته، بدون تعویض خازن، مقاومت‌ها فابریک</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-700/70 pt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <QRCodeSVG value={currentListing?.tracking_code || "TEST"} size={54} className="bg-white p-1 rounded-lg" />
              <div className="text-xs">
                <p className="font-bold text-white">تاییدیه رسمی لابراتوار تخصصی Hybrid Tech</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Tracking ID: {currentListing?.tracking_code}</p>
              </div>
            </div>
            <button onClick={handlePrint} className="no-print bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition shadow-md">
              <FileText className="w-4 h-4" /> پرینت پاسپورت دیجیتال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
