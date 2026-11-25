import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react";

export const metadata = {
  title: "سوالات متداول | هاردینو",
  description: "پاسخ به سوالات رایج درباره خرید امن، مهلت تست ۴۸ ساعته، شناسنامه سلامت و فروش قطعه در هاردینو",
};

const FAQS = [
  {
    q: "قفل پول (پرداخت امانی) دقیقاً چطوری کار می‌کنه و از کجا مطمئن باشم پولم امنه؟",
    a: "وقتی شما هزینه قطعه رو پرداخت می‌کنید، پول مستقیم به حساب فروشنده واریز نمی‌شه؛ بلکه پیش هاردینو امانت می‌مونه. فروشنده قطعه رو ارسال می‌کنه، شما تحویل می‌گیرید و روی سیستم خودتون تست می‌کنید. فقط وقتی مطمئن شدید قطعه سالمه و کد تایید ۶ رقمی رو زدید، پول برای فروشنده آزاد می‌شه.",
  },
  {
    q: "مهلت تست ۴۸ ساعته از چه لحظه‌ای شروع می‌شه؟",
    a: "زمان ارسال توی پست یا پیک جزو مهلت تست حساب نمی‌شه! ۴۸ ساعت دقیقاً از لحظه‌ای شروع می‌شه که بسته به دست شما می‌رسه (بر اساس ثبت تحویل در سامانه پستی یا پیک).",
  },
  {
    q: "چرا موقع باز کردن جعبه باید فیلم بگیرم؟",
    a: "این کار فقط برای حفظ حق خودتونه! چون قطعات کامپیوتر حساس هستند، داشتن یک ویدیوی کوتاه و بدون قطع شدن از لحظه باز کردن چسب جعبه تا دیدن ظاهر قطعه و سریال اون، خیال شما رو از بابت آسیب‌های احتمالی پست یا مغایرت کالا ۱۰۰٪ راحت می‌کنه و داوری رو ظرف چند ساعت به نفع شما تمام می‌کنه.",
  },
  {
    q: "اگر قطعه ایراد داشت و مرجوع شد، هزینه پست با کیه؟",
    a: "اگر فروشنده اطلاعات اشتباه داده باشه یا ایرادی رو پنهان کرده باشه، کل هزینه پست رفت‌وبرگشت به عهده فروشنده‌ست. اما اگر قطعه برگه سلامت هاردینو داشته و فروشنده همه‌چیز رو درست گفته باشه و یه ایراد پنهانی موقع کار کردن شما پیدا بشه، فروشنده جریمه نمی‌شه و خودِ هاردینو هزینه ارسال مرجوعی رو پرداخت می‌کنه.",
  },
  {
    q: "شناسنامه سلامت دیجیتال چیه و به چه دردی می‌خوره؟",
    a: "به جای اینکه فقط به حرف فروشنده اعتماد کنید، کارشناسان هاردینو قطعه رو زیر تست‌های سنگین دما، ولتاژ، پایداری و سلامت حافظه می‌برن. نتیجه این تست‌ها همراه با شماره سریال و کد هولوگرام توی یک برگه دیجیتال ثبت می‌شه که می‌تونید قبل از خرید همه‌چیزش رو ببینید.",
  },
  {
    q: "اگر قطعه سالم باشه ولی به سیستم من نخوره، می‌تونم پس بدم؟",
    a: "قطعه سالم به دلیل عدم سازگاری مرجوع نمی‌شه؛ به همین خاطر قبل از خرید حتماً از ابزار «سیستم‌ساز هوشمند» داخل سایت استفاده کنید تا مطمئن بشید پاور، مادربرد و کیستون با قطعه جدید کاملاً مچ هستن.",
  },
  {
    q: "به عنوان فروشنده، چقدر طول می‌کشه پول به حسابم بیاد؟",
    a: "به محض اینکه خریدار قطعه رو تحویل بگیره و کد تایید رو بزنه (یا ۴۸ ساعت مهلت تست بدون گزارش مشکل تموم بشه)، مبلغ معامله از طریق پایا/ساتنا به شماره شبایی که به نام خودتون ثبت کردید واریز می‌شه.",
  },
];

export default function FaqPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
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
            <Link href="/contact" className="hover:text-white transition">تماس با ما</Link>
          </nav>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
            <HelpCircle className="w-3.5 h-3.5" />
            راهنمای سریع خریدار و فروشنده
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">سوالات متداول</h1>
          <p className="text-sm text-slate-400">
            پاسخ شفاف و ساده به رایج‌ترین پرسش‌ها درباره نحوه کار هاردینو
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((item, index) => (
            <details
              key={index}
              open={index === 0}
              className="group rounded-2xl bg-slate-900 border border-slate-800 open:border-amber-400/40 p-5 transition"
            >
              <summary className="flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white cursor-pointer list-none">
                <span>{item.q}</span>
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 transition-transform group-open:rotate-180 group-open:text-amber-400" />
              </summary>
              <p className="mt-3 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-7">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs sm:text-sm text-slate-300">
            سوال دیگری دارید یا نیاز به راهنمایی قبل از خرید دارید؟
          </span>
          <Link
            href="/contact"
            className="rounded-xl bg-amber-400 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-300 transition"
          >
            ارتباط با پشتیبانی ۲۴ ساعته
          </Link>
        </div>
      </div>
    </div>
  );
}
