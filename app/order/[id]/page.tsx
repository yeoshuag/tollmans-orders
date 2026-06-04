'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MOCK_ORDERS, type Order, type OrderLine } from '@/mock/orders'
import { MOCK_CUSTOMERS, type Customer } from '@/mock/customers'
import { BRANCHES } from '@/mock/warehouses'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import CustomItemModal from '@/components/CustomItemModal'

const VAT = 0.18
const EXCHANGE_RATES: Record<string, number> = { '₪': 1, '€': 3.9, '$': 3.65 }

type Tab = 'items' | 'customer' | 'delivery'
type Status = 'טיוטה' | 'הצעת מחיר' | 'הזמנה'
type Currency = '₪' | '€' | '$'

function genDocNumber(branchCode: string) {
  const year = String(new Date().getFullYear()).slice(2)
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, '0')
  return `${year}${branchCode}${seq}`
}

const DELIVERY_TYPES = [
  'הובלה והרכבה ע"י טולמנס',
  'איסוף עצמי מהמחסן',
  'איסוף עצמי מהחנות',
  'הובלה חיצונית',
  'פרויקט',
]

const PAYMENT_TERMS = [
  'תשלום מלא במעמד ההזמנה',
  '50% בהזמנה 50% עם הגעה למחסן',
  '25% בהזמנה 25% תוך שבועיים 45% עם הגעה 5% לאחר אספקה',
  'דחוי לתאריך',
]

export default function OrderPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUserStore()
  const { items: cartItems, clearCart } = useCartStore()

  const isNew = params.id === 'new'
  const existingOrder = isNew ? null : MOCK_ORDERS.find((o) => o.id === params.id) ?? null

  const [tab, setTab] = useState<Tab>('items')
  const [status, setStatus] = useState<Status>(existingOrder?.status as Status ?? 'טיוטה')
  const [docNumber] = useState(existingOrder?.docNumber ?? genDocNumber(user?.branchCode ?? '330'))
  const [currency, setCurrency] = useState<Currency>(existingOrder?.currency as Currency ?? '₪')
  const [lines, setLines] = useState<OrderLine[]>(() => {
    if (existingOrder) return existingOrder.lines
    return cartItems.map((ci) => ({
      code: ci.code,
      name: ci.name,
      finish: ci.finish,
      location: ci.location,
      warehouse: ci.warehouse,
      source: ci.source,
      brand: ci.brand,
      model: ci.model,
      dimensions: ci.dimensions,
      unitPrice: ci.unitPrice,
      discountPct: ci.discountPct,
      quantity: ci.quantity,
      deliveryDate: ci.deliveryDate,
      notes: ci.notes,
    }))
  })
  const [generalDiscountPct, setGeneralDiscountPct] = useState(existingOrder?.generalDiscountPct ?? 0)
  const [shippingAmount, setShippingAmount] = useState(existingOrder?.shippingAmount ?? 0)
  const [shippingIsPercent, setShippingIsPercent] = useState(existingOrder?.shippingIsPercent ?? false)
  const [paymentTerms, setPaymentTerms] = useState(existingOrder?.paymentTerms ?? PAYMENT_TERMS[0])

  // Customer fields
  const [customerType, setCustomerType] = useState<'פרטי' | 'עסקי'>('פרטי')
  const [localOrTourist, setLocalOrTourist] = useState<'מקומי' | 'תייר'>('מקומי')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [phone2, setPhone2] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [zip, setZip] = useState('')
  const [floor, setFloor] = useState('')
  const [apartment, setApartment] = useState('')
  const [elevator, setElevator] = useState(false)
  const [architect, setArchitect] = useState('')
  const [architectCode, setArchitectCode] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  // Delivery fields
  const [deliveryType, setDeliveryType] = useState(existingOrder?.deliveryType ?? DELIVERY_TYPES[0])
  const [pickupBranch, setPickupBranch] = useState(existingOrder?.pickupBranch ?? '')
  const [stockDeliveryDate, setStockDeliveryDate] = useState(existingOrder?.stockDeliveryDate ?? '')
  const [importDeliveryDate, setImportDeliveryDate] = useState(existingOrder?.importDeliveryDate ?? '')
  const [splitDelivery, setSplitDelivery] = useState(existingOrder?.splitDelivery ?? false)
  const [distributionNotes, setDistributionNotes] = useState(existingOrder?.distributionNotes ?? '')
  const [notesToCustomer, setNotesToCustomer] = useState(existingOrder?.notesToCustomer ?? '')
  const [internalNotes, setInternalNotes] = useState(existingOrder?.internalNotes ?? '')
  const [officeNotes, setOfficeNotes] = useState(existingOrder?.officeNotes ?? '')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [showCustomItemModal, setShowCustomItemModal] = useState(false)

  useEffect(() => {
    if (isNew && cartItems.length > 0) {
      setLines(cartItems.map((ci) => ({
        code: ci.code, name: ci.name, finish: ci.finish, location: ci.location,
        warehouse: ci.warehouse, source: ci.source, brand: ci.brand, model: ci.model,
        dimensions: ci.dimensions, unitPrice: ci.unitPrice, discountPct: ci.discountPct,
        quantity: ci.quantity,
      })))
    }
  }, [])

  const totals = useMemo(() => {
    const rate = EXCHANGE_RATES[currency]
    const linesTotal = lines.reduce((sum, l) => {
      return sum + (l.unitPrice / rate) * l.quantity * (1 - l.discountPct / 100)
    }, 0)
    const afterGeneralDisc = linesTotal * (1 - generalDiscountPct / 100)
    const ship = shippingIsPercent
      ? afterGeneralDisc * (shippingAmount / 100)
      : shippingAmount / rate
    const subtotalPlusShip = afterGeneralDisc + ship
    const vat = subtotalPlusShip * VAT
    const total = subtotalPlusShip + vat
    return { linesTotal, afterGeneralDisc, ship, vat, total }
  }, [lines, generalDiscountPct, shippingAmount, shippingIsPercent, currency])

  const hasStockLines = lines.some((l) => l.source === 'מלאי' || l.source === 'תצוגה')
  const hasImportLines = lines.some((l) => l.source === 'יבוא' || l.source === 'מלאי בדרך' || l.source === '29')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!phone) errs.phone = 'טלפון נייד חובה'
    if (localOrTourist === 'מקומי' && customerType === 'פרטי' && !idNumber) errs.idNumber = 'ת.ז. חובה'
    if (customerType === 'עסקי' && !companyNumber) errs.companyNumber = 'מספר חברה חובה'
    if (deliveryType === 'איסוף עצמי מהמחסן' && !pickupBranch) errs.pickupBranch = 'יש לבחור סניף לאיסוף'
    if (hasStockLines && !stockDeliveryDate) errs.stockDeliveryDate = 'תאריך אספקה ממלאי חובה'
    if (hasImportLines && !importDeliveryDate) errs.importDeliveryDate = 'תאריך אספקה מיבוא חובה'
    if (splitDelivery && !distributionNotes) errs.distributionNotes = 'הערות להפצה חובה'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = (newStatus?: Status) => {
    if (!validate()) {
      const firstErrTab = errors.phone || errors.idNumber || errors.companyNumber ? 'customer' : 'delivery'
      setTab(firstErrTab)
      return
    }
    if (newStatus) setStatus(newStatus)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateLine = (i: number, field: keyof OrderLine, val: string | number) => {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l))
  }

  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i))

  const isReadOnly = status === 'הזמנה' && !isNew

  const statusBadge = {
    טיוטה: 'bg-[#F0F0F0] text-[#666] border border-[#D0D0D0]',
    'הצעת מחיר': 'bg-[#FFF3E0] text-[#E67E00] border border-[#FFD080]',
    הזמנה: 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]',
  }[status]

  const paymentWarning = useMemo(() => {
    const total = totals.total * EXCHANGE_RATES[currency]
    if (total < 5000) return 'סכום ההזמנה מתחת ל-5,000₪ — תשלום מלא חובה'
    if (hasStockLines) return 'פריטי מלאי/תצוגה קיימים — תשלום מלא חובה'
    if (total >= 5000 && paymentTerms === 'תשלום מלא במעמד ההזמנה') return null
    return null
  }, [totals, currency, hasStockLines, paymentTerms])

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold text-[#999] hover:text-black uppercase tracking-wide transition-colors"
          >
            ← חזרה
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                {isNew ? 'הזמנה / הצעה חדשה' : `מסמך ${docNumber}`}
              </h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusBadge}`}>{status}</span>
              {saved && (
                <span className="text-xs font-black text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">✓ נשמר</span>
              )}
            </div>
            <div className="text-xs text-[#999] font-medium mt-0.5">
              {user?.branchName} · {user?.agentName} · {new Date().toLocaleDateString('he-IL')}
            </div>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              className="border-2 border-black text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
            >
              שמור טיוטה
            </button>
            <button
              onClick={() => handleSave(status === 'טיוטה' ? 'הצעת מחיר' : 'הזמנה')}
              className="px-5 py-2 rounded-lg text-sm font-black uppercase tracking-wide transition-colors"
              style={{ background: '#F5E000', color: '#000' }}
            >
              {status === 'טיוטה' ? 'שלח להצעת מחיר ←' : 'שלח להזמנה ←'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#E0E0E0] mb-5">
        {([['items', 'פריטים'], ['customer', 'לקוח'], ['delivery', 'הובלה והערות']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-black uppercase tracking-wide border-b-2 -mb-0.5 transition-colors ${
              tab === key
                ? 'border-black text-black'
                : 'border-transparent text-[#999] hover:text-black'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Items */}
      {tab === 'items' && (
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-[#e5e1db] shadow-sm overflow-hidden mb-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8f6f3] border-b border-[#e5e1db]">
                    <tr>
                      {['מקט', 'תיאור / גימור', 'מיקום', 'מחסן', 'מקור', 'מחיר יח׳', 'כמות', 'הנחה%', 'סה"כ', ''].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-right text-xs font-semibold text-[#6b6560] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece6]">
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-[#9e9890]">
                          אין פריטים — הוסף מהמלאי
                        </td>
                      </tr>
                    )}
                    {lines.map((line, i) => {
                      const rate = EXCHANGE_RATES[currency]
                      const lineTotal = (line.unitPrice / rate) * line.quantity * (1 - line.discountPct / 100)
                      return (
                        <tr key={i} className="hover:bg-[#faf8f5]">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              {line.source === '29' && (
                                <span className="font-mono text-xs bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">29</span>
                              )}
                              <span className="font-mono text-xs text-[#9e9890]">{line.code}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              disabled={isReadOnly}
                              value={line.finish || line.name}
                              onChange={(e) => updateLine(i, 'finish', e.target.value)}
                              className="w-full text-sm bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-[#c8a97e] rounded px-1 disabled:cursor-default"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              disabled={isReadOnly}
                              value={line.location}
                              onChange={(e) => updateLine(i, 'location', e.target.value)}
                              placeholder="מיקום..."
                              className="w-24 text-sm bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-[#c8a97e] rounded px-1 text-[#6b6560] disabled:cursor-default"
                            />
                          </td>
                          <td className="px-3 py-2 text-xs text-[#6b6560] whitespace-nowrap">{line.warehouse}</td>
                          <td className="px-3 py-2">
                            <select
                              disabled={isReadOnly}
                              value={line.source}
                              onChange={(e) => updateLine(i, 'source', e.target.value)}
                              className="text-xs border border-[#e5e1db] rounded px-1 py-0.5 bg-white disabled:cursor-default"
                            >
                              {['מלאי', 'תצוגה', 'יבוא', 'מלאי בדרך', '29'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              disabled={isReadOnly}
                              value={line.unitPrice}
                              onChange={(e) => updateLine(i, 'unitPrice', Number(e.target.value))}
                              className="w-20 text-sm bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-[#c8a97e] rounded px-1 text-left disabled:cursor-default"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              disabled={isReadOnly}
                              min={1}
                              value={line.quantity}
                              onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                              className="w-12 text-sm bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-[#c8a97e] rounded px-1 text-center disabled:cursor-default"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              disabled={isReadOnly}
                              min={0}
                              max={100}
                              value={line.discountPct}
                              onChange={(e) => updateLine(i, 'discountPct', Number(e.target.value))}
                              className="w-12 text-sm bg-transparent border-0 focus:outline-none focus:bg-white focus:border focus:border-[#c8a97e] rounded px-1 text-center disabled:cursor-default"
                            />
                          </td>
                          <td className="px-3 py-2 font-medium text-sm whitespace-nowrap">
                            {currency}{lineTotal.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-3 py-2">
                            {!isReadOnly && (
                              <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {!isReadOnly && (
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-2 border-2 border-black text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
                >
                  + הוסף פריטים ממסך המלאי
                </Link>
                <button
                  onClick={() => setShowCustomItemModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors border-2 border-[#5E35B1] text-[#5E35B1] hover:bg-[#5E35B1] hover:text-white uppercase tracking-wide"
                >
                  <span className="font-mono text-xs bg-[#EDE7F6] text-[#5E35B1] px-1.5 py-0.5 rounded font-black">29</span>
                  פריט מיוחד / גימור מותאם
                </button>
              </div>
            )}
          </div>

          {/* Summary card */}
          <div className="w-72 shrink-0 space-y-3">
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              {/* Card header */}
              <div className="bg-black px-4 py-3 flex items-center justify-between">
                <div className="text-white font-black text-sm uppercase tracking-wide">סיכום</div>
                <div className="flex items-center gap-1">
                  {(['₪', '€', '$'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`w-7 h-7 text-xs rounded font-black transition-colors ${
                        currency === c ? 'bg-[#F5E000] text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#666]">
                  <span>סה"כ פריטים</span>
                  <span className="font-semibold">{currency}{totals.linesTotal.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-[#666]">
                  <span>הנחה כללית</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min={0} max={100} value={generalDiscountPct}
                      onChange={(e) => setGeneralDiscountPct(Number(e.target.value))}
                      disabled={isReadOnly}
                      className="w-12 text-sm border-2 border-[#E0E0E0] rounded px-1 py-0.5 text-center focus:outline-none focus:border-black disabled:bg-transparent font-semibold"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between text-[#666]">
                  <span>סיכום ביניים</span>
                  <span className="font-semibold">{currency}{totals.afterGeneralDisc.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-[#666]">
                  <span>הובלה</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShippingIsPercent(!shippingIsPercent)}
                      className="text-xs px-1.5 py-0.5 rounded border-2 border-[#E0E0E0] text-[#666] hover:border-black font-bold"
                    >
                      {shippingIsPercent ? '%' : '₪'}
                    </button>
                    <input
                      type="number" min={0} value={shippingAmount}
                      onChange={(e) => setShippingAmount(Number(e.target.value))}
                      disabled={isReadOnly}
                      className="w-16 text-sm border-2 border-[#E0E0E0] rounded px-1 py-0.5 text-center focus:outline-none focus:border-black disabled:bg-transparent font-semibold"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[#666]">
                  <span>מע"מ 18%</span>
                  <span className="font-semibold">{currency}{totals.vat.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between font-black text-base border-t-2 border-black pt-2 mt-2 text-black">
                  <span>סה"כ לתשלום</span>
                  <span>{currency}{totals.total.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="px-4 pb-4 border-t border-[#F0F0F0] pt-3">
                <label className="text-xs font-bold text-black uppercase tracking-wide mb-1.5 block">תנאי תשלום</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full text-xs border-2 border-[#E0E0E0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-black disabled:cursor-default"
                >
                  {PAYMENT_TERMS.map((p) => <option key={p}>{p}</option>)}
                </select>
                {paymentWarning && (
                  <div className="mt-2 text-xs text-[#E67E00] bg-[#FFF3E0] border border-[#FFD080] rounded-lg p-2 font-semibold">
                    ⚠ {paymentWarning}
                  </div>
                )}
              </div>
            </div>

            {/* Quick customer card */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              <div className="bg-black px-4 py-2.5">
                <div className="text-white font-black text-xs uppercase tracking-wide">לקוח</div>
              </div>
              <div className="p-4">
                <input
                  type="text"
                  placeholder="חיפוש לפי ת.ז. / טלפון / שם..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    const match = MOCK_CUSTOMERS.find(
                      (c) => c.idNumber.includes(e.target.value) || c.phone.includes(e.target.value) ||
                        `${c.firstName} ${c.lastName}`.toLowerCase().includes(e.target.value.toLowerCase())
                    )
                    if (match) {
                      setFirstName(match.firstName); setLastName(match.lastName)
                      setIdNumber(match.idNumber ?? ''); setPhone(match.phone)
                      setEmail(match.email); setCity(match.city); setAddress(match.address)
                      setCustomerType(match.customerType); setLocalOrTourist(match.localOrTourist)
                      if (match.companyName) setCompanyName(match.companyName)
                      if (match.companyNumber) setCompanyNumber(match.companyNumber)
                    }
                  }}
                  className="w-full text-sm border-2 border-[#E0E0E0] rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-black transition-colors"
                />
                {firstName && (
                  <div className="text-sm bg-[#F5E000]/20 rounded-lg p-2 mb-2">
                    <div className="font-black text-black">{firstName} {lastName}</div>
                    <div className="text-xs text-[#666] font-medium">{phone} · {city}</div>
                  </div>
                )}
                <button onClick={() => setTab('customer')} className="text-xs font-bold text-black hover:underline uppercase tracking-wide">
                  פרטים נוספים ←
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Customer */}
      {tab === 'customer' && (
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <Field label="סוג לקוח" required>
              <select value={customerType} onChange={(e) => setCustomerType(e.target.value as 'פרטי' | 'עסקי')} disabled={isReadOnly}
                className="field-input">
                <option>פרטי</option><option>עסקי</option>
              </select>
            </Field>
            <Field label="מקומי / תייר" required>
              <select value={localOrTourist} onChange={(e) => setLocalOrTourist(e.target.value as 'מקומי' | 'תייר')} disabled={isReadOnly}
                className="field-input">
                <option>מקומי</option><option>תייר</option>
              </select>
            </Field>
            <Field label="שם פרטי">
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="שם משפחה">
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            {customerType === 'עסקי' && (
              <Field label="שם חברה / פרויקט" colSpan>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={isReadOnly} className="field-input" />
              </Field>
            )}
            {localOrTourist === 'מקומי' && customerType !== 'עסקי' && (
              <Field label="ת.ז. לקוח" required error={errors.idNumber}>
                <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} disabled={isReadOnly} className={`field-input ${errors.idNumber ? 'border-red-400' : ''}`} />
              </Field>
            )}
            {customerType === 'עסקי' && (
              <Field label="מספר חברה" required error={errors.companyNumber}>
                <input value={companyNumber} onChange={(e) => setCompanyNumber(e.target.value)} disabled={isReadOnly} className={`field-input ${errors.companyNumber ? 'border-red-400' : ''}`} />
              </Field>
            )}
            <Field label="טלפון נייד" required error={errors.phone}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isReadOnly} className={`field-input ${errors.phone ? 'border-red-400' : ''}`} />
            </Field>
            <Field label="טלפון 2">
              <input value={phone2} onChange={(e) => setPhone2(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="דואל" colSpan>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="עיר">
              <input value={city} onChange={(e) => setCity(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="כתובת">
              <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="מיקוד">
              <input value={zip} onChange={(e) => setZip(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="קומה">
              <input value={floor} onChange={(e) => setFloor(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="דירה">
              <input value={apartment} onChange={(e) => setApartment(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="מעלית">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={elevator} onChange={(e) => setElevator(e.target.checked)} disabled={isReadOnly} className="w-4 h-4" />
                יש מעלית
              </label>
            </Field>
            <Field label="אדריכל">
              <input value={architect} onChange={(e) => setArchitect(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="קוד אדריכל">
              <input value={architectCode} onChange={(e) => setArchitectCode(e.target.value)} disabled={isReadOnly} className="field-input" />
            </Field>
            <Field label="הערות לקוח" colSpan>
              <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} disabled={isReadOnly} rows={3} className="field-input resize-none" />
            </Field>
          </div>
        </div>
      )}

      {/* Tab: Delivery */}
      {tab === 'delivery' && (
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <Field label="סוג הובלה" required colSpan>
              <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} disabled={isReadOnly} className="field-input">
                {DELIVERY_TYPES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            {(deliveryType === 'איסוף עצמי מהמחסן' || deliveryType === 'איסוף עצמי מהחנות') && (
              <Field label="סניף לאיסוף" required error={errors.pickupBranch} colSpan>
                <select value={pickupBranch} onChange={(e) => setPickupBranch(e.target.value)} disabled={isReadOnly} className={`field-input ${errors.pickupBranch ? 'border-red-400' : ''}`}>
                  <option value="">בחר סניף...</option>
                  {BRANCHES.map((b) => <option key={b.code} value={b.code}>{b.code} — {b.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="הובלה" colSpan>
              <div className="flex items-center gap-2">
                <button onClick={() => setShippingIsPercent(!shippingIsPercent)} className="text-xs px-2 py-1 border border-[#e5e1db] rounded text-[#6b6560] hover:bg-[#f8f6f3]">
                  {shippingIsPercent ? '%' : '₪ סכום'}
                </button>
                <input type="number" min={0} value={shippingAmount} onChange={(e) => setShippingAmount(Number(e.target.value))}
                  disabled={isReadOnly} className="field-input w-32" />
              </div>
            </Field>
            {hasStockLines && (
              <Field label="ת. אספקה ממלאי" required error={errors.stockDeliveryDate}>
                <input type="date" value={stockDeliveryDate} onChange={(e) => setStockDeliveryDate(e.target.value)}
                  disabled={isReadOnly} className={`field-input ${errors.stockDeliveryDate ? 'border-red-400' : ''}`} />
              </Field>
            )}
            {hasImportLines && (
              <Field label="ת. אספקה מיבוא" required error={errors.importDeliveryDate}>
                <input type="date" value={importDeliveryDate} onChange={(e) => setImportDeliveryDate(e.target.value)}
                  disabled={isReadOnly} className={`field-input ${errors.importDeliveryDate ? 'border-red-400' : ''}`} />
              </Field>
            )}
            <Field label="פיצול אספקה" colSpan>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitDelivery} onChange={(e) => setSplitDelivery(e.target.checked)} disabled={isReadOnly} className="w-4 h-4" />
                פצל את האספקה
              </label>
            </Field>
            {splitDelivery && (
              <Field label="הערות להפצה" required error={errors.distributionNotes} colSpan>
                <textarea value={distributionNotes} onChange={(e) => setDistributionNotes(e.target.value)}
                  disabled={isReadOnly} rows={2} className={`field-input resize-none ${errors.distributionNotes ? 'border-red-400' : ''}`} />
              </Field>
            )}
            <Field label="הערות ללקוח" colSpan>
              <textarea value={notesToCustomer} onChange={(e) => setNotesToCustomer(e.target.value)}
                disabled={isReadOnly} rows={3} className="field-input resize-none" placeholder="מופיע במסמך ללקוח" />
            </Field>
            <Field label="הערות פנימיות" colSpan>
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)}
                disabled={isReadOnly} rows={2} className="field-input resize-none" placeholder="לא מופיע ללקוח" />
            </Field>
            <Field label="הערות משרד" colSpan>
              <textarea value={officeNotes} onChange={(e) => setOfficeNotes(e.target.value)}
                disabled={isReadOnly} rows={2} className="field-input resize-none" />
            </Field>
          </div>
        </div>
      )}

      {/* Custom Item Modal */}
      {showCustomItemModal && (
        <CustomItemModal
          onAdd={(line) => setLines((prev) => [...prev, line])}
          onClose={() => setShowCustomItemModal(false)}
        />
      )}
    </div>
  )
}

function Field({ label, children, required, error, colSpan }: {
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  colSpan?: boolean
}) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-[#6b6560] mb-1.5">
        {label}{required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
