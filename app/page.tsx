'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MOCK_ORDERS, type Order, type OrderStatus } from '@/mock/orders'
import { MOCK_AGENTS } from '@/mock/agents'
import { BRANCHES } from '@/mock/warehouses'
import { useUserStore } from '@/store/user'

const VAT = 0.18

function orderTotal(order: Order) {
  const disc = 1 - order.generalDiscountPct / 100
  const subtotal = order.subtotal * disc
  const ship = order.shippingIsPercent ? subtotal * (order.shippingAmount / 100) : order.shippingAmount
  return (subtotal + ship) * (1 + VAT)
}

function isExpiringSoon(order: Order) {
  if (!order.validUntil) return false
  const diff = (new Date(order.validUntil).getTime() - Date.now()) / 86400000
  return diff <= 14 && diff > 0
}

function isExpired(order: Order) {
  if (!order.validUntil) return false
  return new Date(order.validUntil) < new Date()
}

type QuickFilter = 'all' | 'draft' | 'quote' | 'order' | 'mine' | 'thisMonth' | 'expiringSoon'

function StatusBadge({ status }: { status: OrderStatus }) {
  if (status === 'טיוטה')
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F0F0F0] text-[#666]">טיוטה</span>
  if (status === 'הצעת מחיר')
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FFF3E0] text-[#E67E00] border border-[#FFD080]">הצעת מחיר</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">הזמנה</span>
}

export default function OrdersPage() {
  const { user } = useUserStore()
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter((o) => {
      const s = search.toLowerCase()
      if (s && !o.customerName.toLowerCase().includes(s) && !o.docNumber.includes(s) && !o.agentName.toLowerCase().includes(s)) return false
      if (agentFilter && o.agentId !== agentFilter) return false
      if (branchFilter && o.branchCode !== branchFilter) return false
      if (quickFilter === 'draft') return o.status === 'טיוטה'
      if (quickFilter === 'quote') return o.status === 'הצעת מחיר'
      if (quickFilter === 'order') return o.status === 'הזמנה'
      if (quickFilter === 'mine') return o.agentId === user?.agentId
      if (quickFilter === 'thisMonth') {
        const d = new Date(o.date); const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (quickFilter === 'expiringSoon') return isExpiringSoon(o)
      return true
    })
  }, [search, agentFilter, branchFilter, quickFilter, user])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = MOCK_ORDERS.filter((o) => {
      const d = new Date(o.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      drafts: MOCK_ORDERS.filter((o) => o.status === 'טיוטה').length,
      openQuotes: MOCK_ORDERS.filter((o) => o.status === 'הצעת מחיר' && !isExpired(o)).length,
      ordersThisMonth: thisMonth.filter((o) => o.status === 'הזמנה').length,
      totalThisMonth: thisMonth.filter((o) => o.status === 'הזמנה').reduce((s, o) => s + orderTotal(o), 0),
    }
  }, [])

  const qFilters: { key: QuickFilter; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'draft', label: 'טיוטות' },
    { key: 'quote', label: 'הצעות' },
    { key: 'order', label: 'הזמנות' },
    { key: 'mine', label: 'שלי בלבד' },
    { key: 'thisMonth', label: 'החודש' },
    { key: 'expiringSoon', label: '⚠ תוקף פג בקרוב' },
  ]

  return (
    <div className="p-6 max-w-screen-xl mx-auto">

      {/* Page title */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">הזמנות והצעות</h1>
        <Link
          href="/order/new"
          className="font-black text-sm uppercase tracking-wide px-5 py-2.5 rounded-lg transition-colors"
          style={{ background: '#F5E000', color: '#000' }}
        >
          + הזמנה / הצעה חדשה
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="טיוטות" value={stats.drafts} color="text-[#666]" />
        <StatCard label="הצעות פתוחות" value={stats.openQuotes} color="text-[#E67E00]" />
        <StatCard label="הזמנות החודש" value={stats.ordersThisMonth} color="text-[#2E7D32]" />
        <StatCard
          label='סה"כ החודש'
          value={stats.totalThisMonth.toLocaleString('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })}
          color="text-black"
          highlight
        />
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl mb-1 overflow-hidden">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-[#F0F0F0]">
          <input
            type="text"
            placeholder="חיפוש לפי לקוח / מסמך / סוכן..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-black transition-colors"
          />
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black transition-colors"
          >
            <option value="">כל הסוכנים</option>
            {MOCK_AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black transition-colors"
          >
            <option value="">כל הסניפים</option>
            {BRANCHES.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        {/* Quick filters */}
        <div className="px-4 py-2.5 flex flex-wrap gap-2 bg-[#FAFAFA]">
          {qFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setQuickFilter(f.key)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                quickFilter === f.key
                  ? 'bg-black text-[#F5E000]'
                  : 'bg-white text-[#666] border border-[#E0E0E0] hover:border-black hover:text-black'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black text-white">
                {['סטטוס', 'מסמך', 'לקוח', 'סוכן', 'סניף', 'תאריך', 'תוקף', 'סכום כולל', 'פעולות'].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-14 text-[#999]">
                    <div className="text-4xl mb-2">🔍</div>
                    לא נמצאו מסמכים
                  </td>
                </tr>
              )}
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                  onClick={() => { window.location.href = `/order/${order.id}` }}
                >
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-[#999]">{order.docNumber}</td>
                  <td className="px-4 py-3 font-semibold text-black">{order.customerName}</td>
                  <td className="px-4 py-3 text-[#666]">{order.agentName}</td>
                  <td className="px-4 py-3 text-[#666] text-xs">{order.branchName}</td>
                  <td className="px-4 py-3 text-[#666]">{new Date(order.date).toLocaleDateString('he-IL')}</td>
                  <td className="px-4 py-3">
                    {order.validUntil ? (
                      <span className={`text-sm ${isExpiringSoon(order) ? 'text-[#E67E00] font-semibold' : isExpired(order) ? 'text-red-500' : 'text-[#666]'}`}>
                        {isExpiringSoon(order) && '⚠ '}
                        {new Date(order.validUntil).toLocaleDateString('he-IL')}
                        {isExpired(order) && ' (פג)'}
                      </span>
                    ) : <span className="text-[#CCC]">—</span>}
                  </td>
                  <td className="px-4 py-3 font-bold text-black">
                    {order.currency}{orderTotal(order).toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/order/${order.id}`}
                        className="text-xs px-3 py-1.5 rounded border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors"
                      >
                        {order.status === 'הזמנה' ? 'צפייה' : 'עריכה'}
                      </Link>
                      <button className="text-xs px-3 py-1.5 rounded border-2 border-[#E0E0E0] text-[#666] font-semibold hover:border-black hover:text-black transition-colors">
                        שכפול
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-[#FAFAFA] border-t border-[#F0F0F0] text-xs text-[#999] font-medium">
          {filtered.length} מסמכים
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, highlight }: {
  label: string; value: string | number; color: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? 'bg-black border-black' : 'bg-white border-[#E0E0E0]'}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${highlight ? 'text-[#F5E000]' : 'text-[#999]'}`}>
        {label}
      </div>
      <div className={`text-2xl font-black ${highlight ? 'text-[#F5E000]' : color}`}>
        {value}
      </div>
    </div>
  )
}
