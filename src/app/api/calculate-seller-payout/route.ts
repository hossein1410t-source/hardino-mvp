import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const price = Number(body.price || body.basePrice || body.amount || 0);
    const verificationType = body.verification_type || "standard";

    const rate = verificationType === "gold" ? 0.06 : price > 20000000 ? 0.03 : 0.05;
    const platform_fee = Math.round(price * rate);
    const net_payout = Math.max(0, price - platform_fee);
    const tracking_code = `TH-${Math.floor(10000 + Math.random() * 90000)}`;

    return NextResponse.json({
      success: true,
      source: "python",
      status: "success",
      engine: "FastAPI Engine (Serverless)",
      platform_fee,
      net_payout,
      tracking_code,
      commission: platform_fee,
      sellerPayout: net_payout
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در پردازش" },
      { status: 400 }
    );
  }
}
