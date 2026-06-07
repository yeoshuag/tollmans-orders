import { NextResponse } from 'next/server'
import { fetchItems, fetchInventory } from '@/lib/priority'
import { MOCK_ITEMS } from '@/mock/items'

export async function GET() {
  // אם אין הגדרות Priority — מחזיר mock data
  if (!process.env.PRIORITY_BASE_URL || process.env.PRIORITY_BASE_URL.includes('YOUR-COMPANY')) {
    return NextResponse.json(MOCK_ITEMS)
  }

  try {
    const [items, inventory] = await Promise.all([
      fetchItems(),
      fetchInventory(),
    ])

    // מיפוי מלאי לפי מקט
    const stockMap: Record<string, Record<string, number>> = {}
    for (const row of inventory) {
      if (!stockMap[row.PARTNAME]) stockMap[row.PARTNAME] = {}
      stockMap[row.PARTNAME][row.WARHSNAME] = row.TBALANCE
    }

    // מיפוי לפורמט של האפליקציה
    const mapped = items.map((item: any) => ({
      code:        item.PARTNAME,
      name:        item.PARTDES,
      brand:       item.SUPDES ?? '',
      category:    item.FAMILYDES ?? 'כללי',
      subCategory: item.FAMILYDES2 ?? '',
      model:       item.MDANAME ?? '',
      dimensions:  item.SPEC1 ?? '',
      material:    item.SPEC2 ?? '',
      color:       item.COLOR ?? '',
      warranty:    item.GWARNTY ?? '',
      btpPrice:    item.PRICE ?? 0,
      discountPct: 0,   // יעודכן מרשימת הנחות
      discountType: '',
      stock:       stockMap[item.PARTNAME] ?? {},
      imageUrl:    item.PICTURE
        ? item.PICTURE
        : `https://placehold.co/76x76/E0E0E0/999999?text=${encodeURIComponent(item.PARTNAME)}`,
    }))

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error('Priority items error:', err.message)
    // fallback למock בשגיאה
    return NextResponse.json(MOCK_ITEMS)
  }
}
