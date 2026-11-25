import Link from "next/link";
import { ArrowRight, BadgeCheck, Cpu, Lock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "درباره ما | هاردینو",
  description: "معرفی پلتفرم معاملات امن سخت‌افزار کارکرده هاردینو",
};

export default function AboutPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی هاردینو</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <Link href="/terms" className="hover:text-white transition">قوانین و بازگشت وجه</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-white transition">سوالات متداول</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition">تماس با ما</Link>
          </nav>
        </div>

        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            معرفی پلتفرم هاردینو
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            هاردینو؛ مرجع تخصصی معاملات امن سخت‌افزار کارکرده
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-8">
            بازار خرید و فروش قطعات کامپیوتر کارکرده همواره یکی از پرچالش‌ترین بخش‌های بازار فناوری بوده است. خریداران هنگام تهیه قطعاتی مانند کارت گرافیک، پردازنده، مادربرد یا حافظه‌های ذخیره‌سازی، با نگرانی‌هایی نظیر سابقه استفاده سنگین، تعمیرات پنهان، افت عملکرد یا عدم تطابق قطعه ارسالی روبه‌رو هستند. از سوی دیگر، فروشندگان واقعی نیز برای اثبات سلامت قطعه خود و فروش آن به ارزش واقعی، با بی‌اعتمادی خریداران و چانه‌زنی‌های فرسایشی دست‌وپنجه نرم می‌کنند.
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-8">
            پلتفرم <strong className="text-white">هاردینو</strong> (hardino-market.ir) با هدف ایجاد یک بازارگاه تخصصی، شفاف و قانون‌مند برای معاملات قطعات کارکرده کامپیوتر شکل گرفته است تا ریسک معامله را برای هر دو طرف به حداقل برساند.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <BadgeCheck className="w-7 h-7 text-amber-400" />
            <h2 className="font-bold text-base text-white">شناسنامه سلامت دیجیتال</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-7">
              وضعیت فنی قطعات بر اساس شاخص‌های واقعی (دما، پایداری تحت فشار، سلامت حافظه و اصالت فیزیکی) بررسی و در قالب یک شناسنامه دیجیتال یکتا ثبت می‌شود تا خریدار با دید دقیق انتخاب کند.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <Lock className="w-7 h-7 text-emerald-400" />
            <h2 className="font-bold text-base text-white">پرداخت امانی و مهلت تست</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-7">
              مبلغ سفارش تا پایان فرآیند تحویل و آزمایش قطعه نزد پلتفرم به امانت می‌ماند. خریدار پس از تحویل کالا ۴۸ ساعت فرصت تست دارد و تنها پس از تایید سلامت، وجه برای فروشنده آزاد می‌شود.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <Cpu className="w-7 h-7 text-sky-400" />
            <h2 className="font-bold text-base text-white">سیستم‌ساز هوشمند</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-7">
              ابزار سیستم‌ساز هاردینو به خریداران کمک می‌کند پیش از نهایی کردن سفارش، از همخوانی کامل قطعات با یکدیگر (از جمله توان منبع تغذیه و عدم ایجاد گلوگاه) مطمئن شوند.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-l from-slate-900 to-[#0F172A] border border-amber-400/25 p-6 space-y-2">
          <h2 className="text-lg font-extrabold text-amber-300">مأموریت ما</h2>
          <p className="text-sm text-slate-300 leading-7">
            هدف ما در هاردینو این است که تجربه خرید و فروش سخت‌افزار کارکرده در ایران، از نظر شفافیت، امنیت مالی و اطمینان فنی، هم‌تراز با خرید کالای آکبند باشد.
          </p>
        </div>
      </div>
    </div>
  );
}
