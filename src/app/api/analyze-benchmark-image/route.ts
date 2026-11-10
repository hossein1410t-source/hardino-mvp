import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({
    success: true,
    score: 94,
    health: "عالی",
    tempMax: 68,
    passBenchmark: true
  });
}
