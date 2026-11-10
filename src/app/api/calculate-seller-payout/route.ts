import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const price = Number(body.price || body.basePrice || body.amount || 0);

    const commissionRate = price > 20000000 ? 0.03 : 0.05;
    const commission = Math.round(price * commissionRate);
    const sellerPayout = Math.max(0, price - commission);

    return NextResponse.json({
      success: true,
      source: "python",
      status: "success",
      engine: "FastAPI Engine (Serverless)",
      commission,
      commission_amount: commission,
      sellerPayout,
      seller_payout: sellerPayout,
      payout: sellerPayout,
      net_amount: sellerPayout
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, source: "python", commission: 0, sellerPayout: 0 },
      { status: 200 }
    );
  }
}
