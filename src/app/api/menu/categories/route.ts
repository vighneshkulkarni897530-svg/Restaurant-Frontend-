import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(req: Request) {
  const store = getServerStore();

  try {
    const urlObj = new URL(req.url);
    const backendRes = await fetch(`${getBackendUrl()}/api/menu/categories${urlObj.search}`, {
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.categories && Array.isArray(data.categories)) {
        store.categories = data.categories;
      }
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  return NextResponse.json({ success: true, categories: store.categories });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getServerStore();

    try {
      const backendRes = await fetch(`${getBackendUrl()}/api/menu/categories`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.category) {
          store.categories.push(data.category);
        }
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline
    }

    const newCat = {
      id: `cat_${Date.now()}`,
      name: body.name,
      slug: body.slug || (body.name || '').toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      icon: body.icon || 'UtensilsCrossed',
      sortOrder: parseInt(body.sortOrder) || store.categories.length + 1,
      isActive: true,
      _count: { menuItems: 0 },
    };
    store.categories.push(newCat);
    return NextResponse.json({ success: true, category: newCat });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
