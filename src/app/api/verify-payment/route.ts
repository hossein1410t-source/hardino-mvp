import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ success: true, status: "paid", message: "تراکنش اسکرو تایید شد." });
}
