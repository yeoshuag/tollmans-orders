'use client'
import { useState } from 'react'
import { MOCK_AGENTS } from '@/mock/agents'
import { BRANDS, CATEGORIES, SUB_CATEGORIES } from '@/mock/items'
import type { OrderLine } from '@/mock/orders'

type CustomForm = {
  code: string; name: string; finish: string; location: string; warehouse: string
  brand: string; model: string; dimensions: string; unitPrice: number
  discountPct: number; quantity: number; catalogNumber: string; finishDetail: string
}

interface Props {
  onAdd: (line: OrderLine) => void
  onClose: () => void
}

const EMPTY = {
  code: '',
  name: '',
  finish: '',
  location: '',
  warehouse: '',
  brand: '',
  model: '',
  dimensions: '',
  unitPrice: 0,
  discountPct: 0,
  quantity: 1,
  catalogNumber: '',
  finishDetail: '',
}

export default function CustomItemModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState<CustomForm>({ ...EMPTY, model: '', dimensions: '', unitPrice: 0, discountPct: 0, quantity: 1, catalogNumber: '', finishDetail: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.brand.trim()) errs.brand = 'חובה'
    if (!form.name.trim()) errs.name = 'חובה'
    if (!form.unitPrice || form.unitPrice <= 0) errs.unitPrice = 'חובה'
    if (!form.quantity || form.quantity <= 0) errs.quantity = 'חובה'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    const line: OrderLine = {
      code: form.catalogNumber ? `29-${form.catalogNumber}` : `29-CUSTOM`,
      name: form.name,
      finish: form.finishDetail || form.finish,
      location: form.location,
      warehouse: '',
      source: '29',
      brand: form.brand,
      model: form.model,
      dimensions: form.dimensions,
      unitPrice: form.unitPrice,
      discountPct: form.discountPct,
      quantity: form.quantity,
    }
    onAdd(line)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e1db]">
          <div>
            <h2 className="text-base font-bold text-[#1a1a1a]">הוספת פריט מיוחד</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                מקור 29 — הזמנה מיוחדת
              </span>
              <span className="text-xs text-[#9e9890]">פריט שאינו במלאי / גימור מיוחד</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9e9890] hover:text-[#1a1a1a] text-2xl leading-none">×</button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Supplier & Catalog */}
          <div>
            <div className="text-xs font-semibold text-[#6b6560] uppercase tracking-wide mb-3">פרטי ספק</div>
            <div className="grid grid-cols-2 gap-4">
              <ModalField label="ספק / יצרן" required error={errors.brand}>
                <input
                  list="brands-list"
                  value={form.brand}
                  onChange={(e) => set('brand', e.target.value)}
                  placeholder="שם ספק..."
                  className={`field-input ${errors.brand ? 'border-red-400' : ''}`}
                />
                <datalist id="brands-list">
                  {BRANDS.map((b) => <option key={b} value={b} />)}
                </datalist>
              </ModalField>
              <ModalField label="מספר קטלוג ספק">
                <input
                  value={form.catalogNumber}
                  onChange={(e) => set('catalogNumber', e.target.value)}
                  placeholder="מס׳ קטלוג..."
                  className="field-input font-mono"
                />
              </ModalField>
            </div>
          </div>

          {/* Item Details */}
          <div>
            <div className="text-xs font-semibold text-[#6b6560] uppercase tracking-wide mb-3">פרטי פריט</div>
            <div className="grid grid-cols-2 gap-4">
              <ModalField label="שם הפריט" required error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="שם המוצר..."
                  className={`field-input ${errors.name ? 'border-red-400' : ''}`}
                />
              </ModalField>
              <ModalField label="דגם / מק״ט ספק">
                <input
                  value={form.model}
                  onChange={(e) => set('model', e.target.value)}
                  placeholder="מודל..."
                  className="field-input"
                />
              </ModalField>
              <ModalField label="תיאור גימור מפורט" colSpan>
                <textarea
                  value={form.finishDetail}
                  onChange={(e) => set('finishDetail', e.target.value)}
                  placeholder="תאר בדיוק: בד/עור/חומר, צבע, גוון, מרקם, מק׳׳ט בד..."
                  rows={3}
                  className="field-input resize-none"
                />
                <p className="text-xs text-[#9e9890] mt-1">
                  פרט ככל האפשר — הגימור יישלח לספק כהגדרת ההזמנה
                </p>
              </ModalField>
              <ModalField label="מידות">
                <input
                  value={form.dimensions}
                  onChange={(e) => set('dimensions', e.target.value)}
                  placeholder='למשל: 230×90×80 ס"מ'
                  className="field-input"
                />
              </ModalField>
              <ModalField label="מיקום בדירה">
                <input
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="סלון / חדר שינה..."
                  className="field-input"
                />
              </ModalField>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="text-xs font-semibold text-[#6b6560] uppercase tracking-wide mb-3">מחיר וכמות</div>
            <div className="grid grid-cols-3 gap-4">
              <ModalField label="מחיר BTP (₪)" required error={errors.unitPrice}>
                <input
                  type="number"
                  min={0}
                  value={form.unitPrice || ''}
                  onChange={(e) => set('unitPrice', Number(e.target.value))}
                  placeholder="0"
                  className={`field-input ${errors.unitPrice ? 'border-red-400' : ''}`}
                />
              </ModalField>
              <ModalField label="הנחה %">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPct || ''}
                  onChange={(e) => set('discountPct', Number(e.target.value))}
                  placeholder="0"
                  className="field-input"
                />
              </ModalField>
              <ModalField label="כמות" required error={errors.quantity}>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => set('quantity', Number(e.target.value))}
                  className={`field-input ${errors.quantity ? 'border-red-400' : ''}`}
                />
              </ModalField>
            </div>

            {/* Price preview */}
            {form.unitPrice > 0 && (
              <div className="mt-3 bg-[#f8f6f3] rounded-lg p-3 flex items-center gap-6 text-sm">
                {form.discountPct > 0 ? (
                  <>
                    <div>
                      <div className="text-xs text-[#9e9890]">מחיר BTP</div>
                      <div className="line-through text-[#9e9890]">₪{form.unitPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#9e9890]">מחיר נטו</div>
                      <div className="text-green-700 font-bold">
                        ₪{(form.unitPrice * (1 - form.discountPct / 100)).toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="text-xs text-[#9e9890]">מחיר BTP</div>
                    <div className="font-bold">₪{form.unitPrice.toLocaleString()}</div>
                  </div>
                )}
                <div className="mr-auto">
                  <div className="text-xs text-[#9e9890]">סה"כ שורה</div>
                  <div className="font-bold text-[#1a1a1a]">
                    ₪{(form.unitPrice * (1 - form.discountPct / 100) * form.quantity).toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex gap-2">
            <span className="text-base leading-none">⚠</span>
            <div>
              <strong>שים לב:</strong> פריט מקור 29 מחייב הזנת תאריך אספקה מיבוא בלשונית <em>הובלה והערות</em>.
              הפריט ייצא מלשונית הפריטים כשורה רגילה ויסומן <span className="font-mono bg-purple-100 text-purple-700 px-1 rounded">29</span>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e5e1db] bg-[#faf8f5] rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#e5e1db] rounded-lg text-[#6b6560] hover:bg-white transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleAdd}
            className="px-5 py-2 text-sm bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#2d2d2d] transition-colors flex items-center gap-2"
          >
            <span>✓</span> הוסף לטבלת הפריטים
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalField({ label, children, required, error, colSpan }: {
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
