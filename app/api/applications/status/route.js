import { NextResponse } from 'next/server';

export async function GET() {
  const open = process.env.APPLICATIONS_OPEN !== 'false';
  return NextResponse.json({ open });
}
