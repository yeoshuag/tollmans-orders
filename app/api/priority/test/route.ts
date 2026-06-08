import { NextResponse } from 'next/server'

/**
 * GET /api/priority/test
 * בודק חיבור לPriority ומחזיר אבחון מפורט
 */
export async function GET() {
  const baseUrl = (process.env.PRIORITY_BASE_URL ?? '').replace(/\/$/, '')
  const user    = process.env.PRIORITY_API_USER ?? ''
  const pass    = process.env.PRIORITY_API_PASSWORD ?? ''

  if (!baseUrl || baseUrl.includes('YOUR-COMPANY')) {
    return NextResponse.json({
      status: 'not_configured',
      message: 'PRIORITY_BASE_URL לא מוגדר',
    })
  }

  const testUrl = `${baseUrl}/LOGPART?$top=1&$select=PARTNAME,PARTDES`
  const auth = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')

  try {
    const res = await fetch(testUrl, {
      headers: { Authorization: auth, Accept: 'application/json' },
      cache: 'no-store',
    })

    const text = await res.text()
    let body: any = null
    try { body = JSON.parse(text) } catch {}

    if (res.ok) {
      return NextResponse.json({
        status: 'ok',
        message: 'חיבור לPriority תקין ✓',
        url: testUrl,
        httpStatus: res.status,
        sample: body?.value?.[0] ?? body,
      })
    } else {
      return NextResponse.json({
        status: 'error',
        message: `Priority החזיר שגיאה: ${res.status} ${res.statusText}`,
        url: testUrl,
        httpStatus: res.status,
        body: text.slice(0, 500),
      }, { status: 200 }) // מחזיר 200 לנו כדי שהדפדפן יציג
    }
  } catch (err: any) {
    const cause = err.cause
    return NextResponse.json({
      status: 'network_error',
      message: `שגיאת רשת: ${err.message}`,
      cause: cause ? String(cause) : undefined,
      causeCode: cause?.code ?? undefined,
      causeMessage: cause?.message ?? undefined,
      url: testUrl,
    })
  }
}
