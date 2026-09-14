import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json({ success: true, categories: store.categories });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getServerStore();
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
