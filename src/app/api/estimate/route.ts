import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, model, basePrice, healthScore, ageYears, hasWarranty } = body;

    // ۱. فرمول پایه استهلاک بر اساس سن قطعه (هر سال ۱۰ تا ۱۵ درصد افت)
    const age = Number(ageYears) || 1;
    const depreciation = Math.max(0.4, 1 - (age * 0.12));

    // ۲. فاکتور سلامت تست و بنچمارک (بین ۰ تا ۱۰۰)
    const health = Number(healthScore) || 90;
    const healthFactor = health / 100;

    // ۳. فاکتور گارانتی (۸ درصد ارزش افزوده در صورت داشتن گارانتی معتبر)
    const warrantyBonus = hasWarranty ? 1.08 : 1.0;

    // محاسبه قیمت منصفانه تخمینی
    const rawPrice = Number(basePrice) || 10000000;
    const fairPrice = Math.round(rawPrice * depreciation * healthFactor * warrantyBonus);
    
    // بازه قیمت پیشنهادی کف و سقف
    const minPrice = Math.round(fairPrice * 0.93);
    const maxPrice = Math.round(fairPrice * 1.07);

    return NextResponse.json({
      success: true,
      engine: 'Next.js Native Serverless Engine',
      data: {
        fairPrice,
        minPrice,
        maxPrice,
        healthFactor: Math.round(healthFactor * 100),
        depreciationFactor: Math.round(depreciation * 100),
        statusText: 'تحلیل هوشمند با سرور اختصاصی فعال است'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطا در پردازش محاسبات' },
      { status: 500 }
    );
  }
}
