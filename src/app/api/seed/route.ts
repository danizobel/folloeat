import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { seedInitialData } from '@/lib/db';

export async function GET() {
  try {
    const result = await seedInitialData(true);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await seedInitialData(true);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
