import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(req: Request) {
  const store = getServerStore();

  try {
    const backendRes = await fetch(`${getBackendUrl()}/api/tables`, {
      headers: {
        'Authorization': req.headers.get('authorization') || '',
      },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.tables && Array.isArray(data.tables)) {
        store.tables = data.tables;
      }
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  return NextResponse.json({ success: true, tables: store.tables });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getServerStore();

    try {
      const backendRes = await fetch(`${getBackendUrl()}/api/tables`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.table) {
          store.tables.push(data.table);
        }
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline
    }

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
