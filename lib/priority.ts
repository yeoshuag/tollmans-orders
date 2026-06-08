/**
 * Priority REST API client
 * כל קריאה לPriority עוברת דרך פונקציות אלו בלבד
 * משתמש ב-undici עם agent מותאם כדי לעקוף בעיות SSL ארגוניות
 */
import { fetch as undiciFetch, Agent } from 'undici'

const BASE_URL = (process.env.PRIORITY_BASE_URL ?? '').replace(/\/$/, '') // הסר סלש אחרון
const USER     = process.env.PRIORITY_API_USER!
const PASSWORD = process.env.PRIORITY_API_PASSWORD!

// Agent עם rejectUnauthorized:false לשרתי Priority עם תעודות SSL פרטיות
const tlsAgent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
  headersTimeout: 30_000,
  bodyTimeout:    30_000,
  connectTimeout: 30_000,
})

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${USER}:${PASSWORD}`).toString('base64')
}

async function priorityFetch(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}/${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await undiciFetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
    },
    dispatcher: tlsAgent,
  } as any)

  if (!res.ok) {
    throw new Error(`Priority API error: ${res.status} ${res.statusText} — ${endpoint}`)
  }

  const data = await res.json() as any
  return data.value ?? data
}

// ────────────────────────────────────────────────────────
// פריטים (LOGPART)
// ────────────────────────────────────────────────────────
export async function fetchItems() {
  return priorityFetch('LOGPART', {
    $filter: "STATDES ne 'מבוטל'",
    $select: [
      'PARTNAME',      // מקט
      'PARTDES',       // תיאור
      'FAMILYDES',     // משפחת על (קטגוריה)
      'FAMILYDES2',    // משפחת מוצר (תת-קטגוריה)
      'SUPDES',        // ספק
      'MDANAME',       // דגם
      'SPEC1',         // מידות
      'SPEC2',         // חומר
      'COLOR',         // צבע
      'GWARNTY',       // אחריות
      'PRICE',         // מחיר BTP
      'PICTURE',       // URL תמונה
    ].join(','),
    $top: '500',
  })
}

// ────────────────────────────────────────────────────────
// מלאי לפי מחסן (WARHSBAL)
// ────────────────────────────────────────────────────────
export async function fetchInventory(partName?: string) {
  const filter = partName
    ? `PARTNAME eq '${partName}' and TBALANCE gt 0`
    : 'TBALANCE gt 0'

  return priorityFetch('WARHSBAL', {
    $filter: filter,
    $select: 'PARTNAME,WARHSNAME,TBALANCE',
    $top: '2000',
  })
}

// ────────────────────────────────────────────────────────
// לקוחות (CUSTOMERS)
// ────────────────────────────────────────────────────────
export async function fetchCustomers(search?: string) {
  const filter = search
    ? `contains(CUSTDES,'${search}') or contains(PHONE,'${search}') or CUSTNAME eq '${search}'`
    : undefined

  return priorityFetch('CUSTOMERS', {
    ...(filter ? { $filter: filter } : {}),
    $select: [
      'CUSTNAME',   // מספר לקוח
      'CUSTDES',    // שם לקוח
      'PHONE',      // טלפון
      'EMAIL',      // מייל
      'ADDRESS',    // כתובת
      'CITY',       // עיר
      'ZIP',        // מיקוד
      'TAXID',      // ת.ז. / ח.פ.
    ].join(','),
    $top: '100',
  })
}

// ────────────────────────────────────────────────────────
// הנחות (CPROF / CUSTPRICE)
// ────────────────────────────────────────────────────────
export async function fetchDiscounts() {
  return priorityFetch('CUSTPRICELIST', {
    $select: 'PARTNAME,CUSTNAME,SUPDES,FAMILYDES,DISCPERCENT,PRICELISTDES',
    $top: '1000',
  })
}
