import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "تماس با ما | هاردینو",
  description: "اطلاعات تماس، نشانی پستی و پشتیبانی ۲۴ ساعته پلتفرم هاردینو",
};

export default function ContactPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* نوار بازگشت و دسترسی سریع */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی هاردینو</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <Link href="/about" className="hover:text-white transition">درباره ما</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition">قوانین و بازگشت وجه</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-white transition">سوالات متداول</Link>
          </nav>
        </div>

        {/* هدر صفحه */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">تماس با پشتیبانی هاردینو</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            تیم پشتیبانی و کارشناسی فنی هاردینو به صورت شبانه‌روزی آماده پاسخگویی به سوالات، پیگیری سفارش‌ها و داوری معاملات شماست.
          </p>
        </div>

        {/* کارت‌های اطلاعات تماس */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">نشانی پستی</h2>
            <p className="text-sm text-slate-300 leading-7">
              استان مرکزی، شهرستان فراهان، شهر تلخاب، خیابان امام، کوچه چمران
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              کد پستی: <span className="font-bold text-slate-200 select-all">3957145883</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">تلفن تماس پشتیبانی</h2>
            <p className="text-sm text-slate-300">
              تماس مستقیم جهت پیگیری سفارش‌ها و مشاوره خرید و فروش:
            </p>
            <a
              href="tel:09965344598"
              dir="ltr"
              className="inline-block text-lg font-extrabold text-emerald-400 hover:text-emerald-300 transition pt-1"
            >
              0996 534 4598
            </a>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">پست الکترونیکی</h2>
            <p className="text-sm text-slate-300">
              ارتباط مستقیم جهت پشتیبانی، پیگیری سفارش‌ها و امور اداری:
            </p>
            <a
              href="mailto:hossein1410.t@gmail.com"
              dir="ltr"
              className="inline-block text-base sm:text-lg font-bold text-sky-400 hover:underline pt-1 select-all"
            >
              hossein1410.t@gmail.com
            </a>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">ساعات پاسخگویی</h2>
            <p className="text-sm text-slate-300 leading-7">
              پشتیبانی تلفنی و آنلاین هاردینو در <span className="text-white font-bold">تمامی روزهای هفته (۷ روز هفته) و به صورت ۲۴ ساعته</span> فعال است.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-amber-400/20 p-5 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            تمامی تراکنش‌های مالی در پلتفرم هاردینو صرفاً از طریق درگاه پرداخت امن داخل سایت انجام می‌شود. لطفاً از واریز وجه به صورت کارت‌به‌کارت خارج از فرآیند پرداخت امانی پلتفرم خودداری فرمایید.
          </p>
        </div>
      </div>
    </div>
  );
}
