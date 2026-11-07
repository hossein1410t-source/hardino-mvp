"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  MessageSquare,
  KeyRound,
  Send,
  Handshake,
  ArrowRightLeft,
  CreditCard,
  Receipt,
  ExternalLink,
  X,
  Building2,
} from "lucide-react";

interface EscrowOrder {
  order_id: string;
  release_code: string;
  listing_id: string;
  tracking_code: string;
  title: string;
  price: number;
  escrow_fee: number;
  step: 1 | 2 | 3 | 4 | 5; // 1: در انتظار پرداخت درگاه | 2: قفل در صندوق | 3: تست مرکز | 4: ارسال و مهلت تست | 5: تسویه نهایی
  payment_ref?: string;
  paid_at?: string;
}

interface Tab7Props {
  listings: any[];
  presetId?: string;
}

const getCatalogObj = (item: any) => {
  if (!item?.hardware_catalog) return null;
  return Array.isArray(item.hardware_catalog)
    ? item.hardware_catalog[0]
    : item.hardware_catalog;
};

export default function Tab7EscrowRoom({ listings, presetId }: Tab7Props) {
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [releaseInput, setReleaseInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [discountOffer, setDiscountOffer] = useState("");

  // استیت مودال درگاه پرداخت بانکی شاپرک
  const [showGateway, setShowGateway] = useState(false);
  const [cardNum, setCardNum] = useState("6037-9975-1234-5678");
  const [cvv2, setCvv2] = useState("482");
  const [otp, setOtp] = useState("");
  const [paying, setPaying] = useState(false);

  const [messages, setMessages] = useState<
    { sender: string; text: string; type: "TEXT" | "OFFER"; time: string }[]
  >([
    {
      sender: "SYSTEM",
      text: "اتاق معامله امن ایجاد شد. خریدار محترم، جهت شروع فرآیند ارسال و قفل شدن قطعه برای شما، ابتدا مبلغ را از طریق درگاه امن امانی پرداخت نمایید.",
      type: "TEXT",
      time: "۱۰:۳۰",
    },
  ]);

  const buildOrderFromListing = (item: any): EscrowOrder => {
    const cat = getCatalogObj(item);
    const priceNum = Number(item?.initial_price) || 0;
    const codeClean =
      String(item?.tracking_code || "").replace(/\D/g, "") ||
      String(Math.floor(10000 + Math.random() * 90000));
    return {
      order_id: `ESC-${codeClean}`,
      release_code: `${Math.floor(100000 + Math.random() * 900000)}`,
      listing_id: item.listing_id,
      tracking_code: item.tracking_code || "TH-00000",
      title: `${cat?.brand || ""} ${cat?.model_name || "قطعه سخت‌افزاری"}`.trim(),
      price: priceNum,
      escrow_fee: Math.floor(priceNum * 0.03),
      step: 1, // مرحله ۱: هنوز پرداخت بانکی انجام نشده
    };
  };

  useEffect(() => {
    let loadedOrders: EscrowOrder[] = [];
    try {
      const saved = localStorage.getItem("hw_buyer_escrow_orders");
      if (saved) loadedOrders = JSON.parse(saved);
    } catch {
      loadedOrders = [];
    }

    if (presetId && listings.length > 0) {
      const targetListing = listings.find(
        (l) => l.listing_id === presetId || l.tracking_code === presetId
      );
      if (targetListing) {
        const existing = loadedOrders.find(
          (o) => o.listing_id === targetListing.listing_id
        );
        if (existing) {
          setOrders(loadedOrders);
          setSelectedId(existing.order_id);
          return;
        } else {
          const newOrd = buildOrderFromListing(targetListing);
          const updated = [newOrd, ...loadedOrders];
          setOrders(updated);
          setSelectedId(newOrd.order_id);
          try {
            localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(updated));
          } catch {}
          return;
        }
      }
    }

    if (loadedOrders.length === 0 && listings.length > 0) {
      const firstOrder = buildOrderFromListing(listings[0]);
      loadedOrders = [firstOrder];
      try {
        localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(loadedOrders));
      } catch {}
    }

    setOrders(loadedOrders);
    if (loadedOrders.length > 0 && !selectedId) {
      setSelectedId(loadedOrders[0].order_id);
    }
  }, [presetId, listings]);

  const activeOrder = orders.find((o) => o.order_id === selectedId) || orders[0];

  const handleSelectChange = (val: string) => {
    if (val.startsWith("NEW_LISTING:")) {
      const lid = val.replace("NEW_LISTING:", "");
      const foundListing = listings.find((l) => l.listing_id === lid);
      if (!foundListing) return;

      const existing = orders.find((o) => o.listing_id === lid);
      if (existing) {
        setSelectedId(existing.order_id);
      } else {
        const newOrd = buildOrderFromListing(foundListing);
        const updated = [newOrd, ...orders];
        setOrders(updated);
        setSelectedId(newOrd.order_id);
        try {
          localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(updated));
        } catch {}
      }
    } else {
      setSelectedId(val);
    }
  };

  // پردازش پرداخت درگاه بانکی (متصل به بک‌اند پایتون)
  const handleCompleteBankPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setPaying(true);

    try {
      let refId = `SHP-${Math.floor(10000000 + Math.random() * 90000000)}`;
      let relCode = activeOrder.release_code;

      try {
        const res = await fetch("http://localhost:8000/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: activeOrder.order_id,
            amount: activeOrder.price + activeOrder.escrow_fee,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          refId = data.ref_id || refId;
          relCode = data.release_code || relCode;
        }
      } catch {
        // fallback if python server is offline
      }

      const now = new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const updated: EscrowOrder[] = orders.map((o) =>
        o.order_id === activeOrder.order_id
          ? {
              ...o,
              step: 3,
              payment_ref: refId,
              release_code: relCode,
              paid_at: now,
            }
          : o
      );

      setOrders(updated);
      localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(updated));

      setMessages((prev) => [
        ...prev,
        {
          sender: "SYSTEM",
          text: `✅ پرداخت بانکی با شماره پیگیری ${refId} با موفقیت انجام شد. مبلغ در صندوق امانی قفل گردید و کد ۶ رقمی ترخیص برای خریدار صادر شد.`,
          type: "TEXT",
          time: now,
        },
      ]);

      setShowGateway(false);
    } finally {
      setPaying(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { sender: "BUYER", text: chatInput, type: "TEXT", time: now },
    ]);
    setChatInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "SELLER",
          text: "سلام، پیام شما رو دیدم. به محض قفل شدن وجه در صندوق امانی، قطعه از طریق مرکز تست برایتان ارسال می‌شود.",
          type: "TEXT",
          time: now,
        },
      ]);
    }, 1000);
  };

  const handleSendOffer = () => {
    if (!discountOffer || !activeOrder) return;
    const newPrice = Number(discountOffer);
    if (newPrice <= 0) return;

    const now = new Date().toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: "BUYER",
        text: `پیشنهاد اصلاح قیمت: ${newPrice.toLocaleString("fa-IR")} تومان (بروزرسانی فاکتور درگاه)`,
        type: "OFFER",
        time: now,
      },
    ]);

    const updated = orders.map((o) =>
      o.order_id === activeOrder.order_id
        ? { ...o, price: newPrice, escrow_fee: Math.floor(newPrice * 0.03) }
        : o
    );
    setOrders(updated);
    localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(updated));
    setDiscountOffer("");
  };

  const handleReleaseFunds = () => {
    if (!activeOrder) return;
    if (releaseInput.trim() === activeOrder.release_code) {
      const updated: EscrowOrder[] = orders.map((o) =>
        o.order_id === activeOrder.order_id ? { ...o, step: 5 } : o
      );
      setOrders(updated);
      localStorage.setItem("hw_buyer_escrow_orders", JSON.stringify(updated));
      alert("✅ کد ترخیص تایید شد! وجه قفل‌شده با موفقیت به حساب شبا فروشنده واریز گردید.");
    } else {
      alert(
        `❌ کد واردشده اشتباه است. کد صحیح این معامله ${activeOrder.release_code} است.`
      );
    }
  };

  const qrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?code=${activeOrder?.tracking_code || "TH-00000"}`
      : `http://localhost:3000/?code=${activeOrder?.tracking_code || "TH-00000"}`;

  return (
    <div className="space-y-6">
      {/* هدر انتخاب معامله */}
      <div className="liquid-glass rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl shadow-md">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              اتاق معامله امن (Escrow)، درگاه پرداخت و چانه‌زنی
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              اتصال مستقیم به درگاه پرداخت امانی، صدور کد رهگیری بانکی و ترخیص وجه با کد ۶ رقمی
            </p>
          </div>
        </div>

        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            انتخاب معامله فعال یا شروع خرید جدید:
          </label>
          <select
            value={activeOrder?.order_id || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-sm"
          >
            {orders.length > 0 && (
              <optgroup label="🔒 معاملات امانی شما">
                {orders.map((o) => (
                  <option key={o.order_id} value={o.order_id}>
                    {o.order_id} — {o.title} ({o.step === 1 ? "در انتظار پرداخت" : o.step === 5 ? "تسویه‌شده" : "قفل در صندوق"})
                  </option>
                ))}
              </optgroup>
            )}
            {listings.length > 0 && (
              <optgroup label="➕ شروع خرید امن قطعه از ویترین">
                {listings.map((item) => {
                  const c = getCatalogObj(item);
                  return (
                    <option
                      key={item.listing_id}
                      value={`NEW_LISTING:${item.listing_id}`}
                    >
                      خرید امن: {c?.brand} {c?.model_name} ({Number(item.initial_price).toLocaleString("fa-IR")} ت)
                    </option>
                  );
                })}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون راست: وضعیت پرداخت بانکی، بارکد هوشمند و کد ترخیص */}
          <div className="lg:col-span-1 space-y-6">
            <div className="liquid-glass-dark rounded-3xl p-6 text-white space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <h3 className="font-extrabold text-emerald-400 flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4" /> صندوق امانی و درگاه بانکی
                </h3>
                <span className="font-mono text-xs bg-slate-800 text-cyan-300 px-2.5 py-0.5 rounded-md">
                  {activeOrder.order_id}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">قطعه انتخابی:</span>
                    <span className="font-extrabold text-sm text-white block">
                      {activeOrder.title}
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono mt-1 block">
                      کد قطعه: {activeOrder.tracking_code}
                    </span>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl shrink-0" title="اسکن جهت مشاهده شناسنامه قطعه">
                    <QRCodeSVG value={qrUrl} size={54} />
                  </div>
                </div>

                {/* فاکتور مالی */}
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>مبلغ توافقی قطعه:</span>
                    <span className="font-bold">{activeOrder.price.toLocaleString("fa-IR")} تومان</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>کارمزد تضمین امانی (۳٪):</span>
                    <span>{activeOrder.escrow_fee.toLocaleString("fa-IR")} تومان</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-400 text-sm pt-2 border-t border-slate-800">
                    <span>مبلغ قابل پرداخت در درگاه:</span>
                    <span>
                      {(activeOrder.price + activeOrder.escrow_fee).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>

                {/* وضعیت ۱: هنوز پرداخت بانکی انجام نشده است */}
                {activeOrder.step === 1 && (
                  <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-300 font-extrabold text-xs">
                        وضعیت: در انتظار پرداخت خریدار
                      </span>
                      <CreditCard className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      با کلیک روی دکمه زیر، به درگاه بانکی شاپرک متصل شده و وجه در حساب امانی پلتفرم قفل می‌گردد.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowGateway(true)}
                      className="w-full bg-gradient-to-l from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>اتصال به درگاه پرداخت امن شاپرک</span>
                    </button>
                  </div>
                )}

                {/* وضعیت ۲ تا ۴: پرداخت انجام شده و پول در صندوق قفل است */}
                {activeOrder.step >= 2 && activeOrder.step < 5 && (
                  <div className="space-y-3">
                    <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-emerald-300 font-extrabold">
                        <span>✅ پرداخت‌شده در درگاه امانی</span>
                        <span className="font-mono text-[11px]">{activeOrder.payment_ref || "SHP-88492011"}</span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        پول شما در صندوق امانی قفل است. کد ۶ رقمی ترخیص زیر فقط پس از تحویل و رضایت کامل شما فعال می‌شود:
                      </p>
                    </div>

                    <div className="bg-amber-500/15 border border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] text-amber-200">
                          کد ۶ رقمی ترخیص وجه شما:
                        </span>
                        <span className="font-mono font-extrabold text-base text-amber-400 tracking-widest">
                          {activeOrder.release_code}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReleaseInput(activeOrder.release_code)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                      >
                        درج خودکار کد
                      </button>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                        <input
                          type="text"
                          placeholder="ورود کد ۶ رقمی ترخیص"
                          value={releaseInput}
                          onChange={(e) => setReleaseInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-600 rounded-xl pr-9 pl-3 py-2.5 text-sm font-mono text-center tracking-widest text-amber-400 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleReleaseFunds}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-lg transition"
                      >
                        تایید سلامت کالا و آزادسازی وجه به فروشنده
                      </button>
                    </div>
                  </div>
                )}

                {/* وضعیت ۵: تسویه نهایی */}
                {activeOrder.step === 5 && (
                  <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 p-4 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                    <p className="text-sm font-extrabold">معامله با موفقیت تسویه شد</p>
                    <p className="text-[11px] text-emerald-200">
                      وجه قفل‌شده با کد پیگیری {activeOrder.payment_ref || "SHP-99201"} به حساب فروشنده واریز گردید.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ستون چپ: اتاق مذاکره و چانه‌زنی */}
          <div className="lg:col-span-2 liquid-glass rounded-3xl p-6 flex flex-col h-[560px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-600" />
                اتاق مذاکره و چانه‌زنی قیمت ({activeOrder.title})
              </h3>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                تحت نظارت داور فنی پلتفرم
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "BUYER" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm ${
                      msg.sender === "BUYER"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : msg.sender === "SYSTEM"
                        ? "bg-amber-50 border border-amber-200 text-amber-900 w-full text-center font-bold"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {msg.type === "OFFER" ? (
                      <div className="flex items-center gap-2 font-extrabold text-amber-400">
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-3 pt-3 border-t border-slate-200/80">
              <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 p-2.5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 px-1">
                  پیشنهاد قیمت توافقی جدید:
                </span>
                <input
                  type="number"
                  placeholder="مبلغ جدید به تومان (مثلاً 11500000)"
                  value={discountOffer}
                  onChange={(e) => setDiscountOffer(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleSendOffer}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition"
                >
                  ثبت و بروزرسانی مبلغ درگاه
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="پیام به فروشنده یا داور مرکز تست..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* مودال شبیه‌ساز درگاه پرداخت الکترونیک شاپرک / زرین‌پال */}
      {showGateway && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-l from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="font-extrabold text-sm">درگاه پرداخت اینترنتی شاپرک</h4>
                  <p className="text-[10px] text-slate-300">حساب واسط امانی پلتفرم هاردینو ( زرین‌پال )</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGateway(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteBankPayment} className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900">مبلغ قابل پرداخت:</span>
                <span className="font-extrabold text-base text-emerald-700">
                  {(activeOrder.price + activeOrder.escrow_fee).toLocaleString("fa-IR")} تومان
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شماره کارت ۱۶ رقمی:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-center text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره شناسایی دوم (CVV2):
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    value={cvv2}
                    onChange={(e) => setCvv2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-center text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاریخ انقضا:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    defaultValue="06 / 05"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-center text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رمز دوم اینترنتی (پویا):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    dir="ltr"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="رمز ۶ رقمی"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-center text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setOtp(String(Math.floor(100000 + Math.random() * 900000)))}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shrink-0"
                  >
                    درخواست رمز پویا
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={paying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl text-xs shadow-lg transition"
                >
                  {paying ? "در حال ارتباط با شاپرک..." : "پرداخت و قفل وجه در حساب امانی"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGateway(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
