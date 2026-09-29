import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { validateFollonicaAddress, geocodeAddressOSM } from '@/lib/address-validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, zoneHint, performGeocode } = body;

    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json({
        isValid: false,
        isInFollonica: false,
        error: 'Indirizzo obbligatorio.'
      }, { status: 400 });
    }

    let result;
    if (performGeocode) {
      result = await geocodeAddressOSM(address);
    } else {
      result = validateFollonicaAddress(address, zoneHint);
    }

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('q') || '';
    const zoneHint = searchParams.get('zone') || undefined;

    const result = validateFollonicaAddress(address, zoneHint);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
