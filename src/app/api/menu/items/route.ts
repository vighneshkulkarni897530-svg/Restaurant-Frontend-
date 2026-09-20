import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

const getBackendUrl = () => process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(req: Request) {
  const store = getServerStore();

  try {
    const urlObj = new URL(req.url);
    const backendRes = await fetch(`${getBackendUrl()}/api/menu/items${urlObj.search}`, {
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.items && Array.isArray(data.items)) {
        store.menuItems = data.items;
      }
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const search = searchParams.get('search')?.toLowerCase();
  const isVeg = searchParams.get('isVeg');
  const availableOnly = searchParams.get('availableOnly') === 'true';

  let items = [...store.menuItems];

  if (categoryId && categoryId !== 'all') {
    items = items.filter((it) => it.categoryId === categoryId);
  }

  if (isVeg !== null && isVeg !== undefined && isVeg !== '') {
    const isVegBool = isVeg === 'true';
    items = items.filter((it) => it.isVeg === isVegBool);
  }

  if (availableOnly) {
    items = items.filter((it) => it.isAvailable);
  }

  if (search) {
    items = items.filter(
      (it) =>
        it.name.toLowerCase().includes(search) ||
        it.description?.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ success: true, items, total: items.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getServerStore();

    try {
      const backendRes = await fetch(`${getBackendUrl()}/api/menu/items`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.item) {
          store.menuItems.push(data.item);
        }
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline
    }

    const catObj = store.categories.find((c) => c.id === body.categoryId) || store.categories[0];

    const newItem = {
      id: `item_${Date.now()}`,
      categoryId: body.categoryId || catObj?.id,
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price) || 0,
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg: body.isVeg !== undefined ? body.isVeg : true,
      isChefSpecial: body.isChefSpecial || false,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      spicyLevel: parseInt(body.spicyLevel) || 0,
      preparationTimeMin: parseInt(body.preparationTimeMin) || 15,
      calories: parseInt(body.calories) || 350,
      sortOrder: store.menuItems.length + 1,
      category: catObj,
    };

    store.menuItems.push(newItem);
    return NextResponse.json({ success: true, item: newItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
