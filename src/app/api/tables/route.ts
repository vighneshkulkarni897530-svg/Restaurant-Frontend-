import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json({ success: true, tables: store.tables });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getServerStore();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const tableNumber = body.tableNumber || `${store.tables.length + 1}`.padStart(2, '0');
    const newTable = {
      id: `tbl_${Date.now()}`,
      tableNumber,
      capacity: parseInt(body.capacity) || 4,
      section: body.section || 'Main Dining Hall',
      qrToken: `tbl_palms_${tableNumber.toLowerCase().replace(/\s+/g, '_')}_${randomSuffix}`,
      status: body.status || 'ACTIVE',
    };
    store.tables.push(newTable);
    return NextResponse.json({ success: true, table: newTable, message: 'Table created successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
