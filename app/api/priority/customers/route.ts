import { NextRequest, NextResponse } from 'next/server'
import { fetchCustomers } from '@/lib/priority'
import { MOCK_CUSTOMERS } from '@/mock/customers'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('q') ?? undefined

  if (!process.env.PRIORITY_BASE_URL || process.env.PRIORITY_BASE_URL.includes('YOUR-COMPANY')) {
    const filtered = search
      ? MOCK_CUSTOMERS.filter((c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          c.idNumber.includes(search)
        )
      : MOCK_CUSTOMERS
    return NextResponse.json(filtered)
  }

  try {
    const customers = await fetchCustomers(search)

    const mapped = customers.map((c: any) => ({
      id:             c.CUSTNAME,
      idNumber:       c.TAXID ?? '',
      firstName:      c.CUSTDES?.split(' ')[0] ?? '',
      lastName:       c.CUSTDES?.split(' ').slice(1).join(' ') ?? '',
      fullName:       c.CUSTDES ?? '',
      phone:          c.PHONE ?? '',
      email:          c.EMAIL ?? '',
      city:           c.CITY ?? '',
      address:        c.ADDRESS ?? '',
      zip:            c.ZIP ?? '',
      customerType:   'פרטי' as const,
      localOrTourist: 'מקומי' as const,
    }))

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error('Priority customers error:', err.message)
    return NextResponse.json(MOCK_CUSTOMERS)
  }
}
