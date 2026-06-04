'use client'
import { useState, useMemo } from 'react'
import { MOCK_ITEMS, CATEGORIES, SUB_CATEGORIES, BRANDS, getNetPrice, type StockItem } from '@/mock/items'
import { WAREHOUSES } from '@/mock/warehouses'
import { useCartStore, type CartItem } from '@/store/cart'

export default function InventoryPage() {
  const addItem = useCartStore((s) => s.addItem)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subCategoryFilter, setSubCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outStock'>('all')
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [lightbox, setLightbox] = useState(false)

  const activeChips: { label: string; clear: () => void }[] = []
  if (search) activeChips.push({ label: `"${search}"`, clear: () => setSearch('') })
  if (categoryFilter) activeChips.push({ label: categoryFilter, clear: () => setCategoryFilter('') })
  if (subCategoryFilter) activeChips.push({ label: subCategoryFilter, clear: () => setSubCategoryFilter('') })
  if (brandFilter) activeChips.push({ label: brandFilter, clear: () => setBrandFilter('') })
  if (warehouseFilter) activeChips.push({ label: `מחסן: ${warehouseFilter}`, clear: () => setWarehouseFilter('') })
  if (stockFilter !== 'all') activeChips.push({ label: stockFilter === 'inStock' ? 'יש מלאי' : 'אין מלאי', clear: () => setStockFilter('all') })

  const clearAll = () => {
    setSearch(''); setCategoryFilter(''); setSubCategoryFilter('')
    setBrandFilter(''); setWarehouseFilter(''); setStockFilter('all')
  }

  const filtered = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      const s = search.toLowerCase()
      if (s && !item.code.toLowerCase().includes(s) && !item.name.toLowerCase().includes(s) && !item.model.toLowerCase().includes(s)) return false
      if (categoryFilter && item.category !== categoryFilter) return false
      if (subCategoryFilter && item.subCategory !== subCategoryFilter) return false
      if (brandFilter && item.brand !== brandFilter) return false
      if (warehouseFilter && (item.stock[warehouseFilter] ?? 0) <= 0) return false
      const total = Object.values(item.stock).reduce((a, b) => a + b, 0)
      if (stockFilter === 'inStock' && total <= 0) return false
      if (stockFilter === 'outStock' && total > 0) return false
      return true
    })
  }, [search, categoryFilter, subCategoryFilter, brandFilter, warehouseFilter, stockFilter])

  const handleAddToCart = () => {
    if (!selectedItem || !selectedWarehouse) return
    addItem({
      code: selectedItem.code, name: selectedItem.name,
      finish: selectedItem.color, location: '', warehouse: selectedWarehouse,
      source: 'מלאי', brand: selectedItem.brand, model: selectedItem.model,
      dimensions: selectedItem.dimensions, unitPrice: selectedItem.btpPrice,
      discountPct: selectedItem.discountPct, quantity: qty,
    })
    setSelectedItem(null); setSelectedWarehouse(null); setQty(1)
  }

  const totalStock = (item: StockItem) => Object.values(item.stock).reduce((a, b) => a + b, 0)

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page title */}
      <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-5">מלאי</h1>

      {/* Filters */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="חיפוש מקט / שם / דגם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-black transition-colors"
          />
          {[
            { label: 'קטגוריה', value: categoryFilter, set: setCategoryFilter, options: CATEGORIES },
            { label: 'תת-קטגוריה', value: subCategoryFilter, set: setSubCategoryFilter, options: SUB_CATEGORIES },
            { label: 'ספק', value: brandFilter, set: setBrandFilter, options: BRANDS },
          ].map((f) => (
            <select key={f.label} value={f.value} onChange={(e) => f.set(e.target.value)}
              className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black transition-colors">
              <option value="">{f.label}</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}
            className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black transition-colors">
            <option value="">כל המחסנים</option>
            {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as 'all' | 'inStock' | 'outStock')}
            className="border-2 border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black transition-colors">
            <option value="all">כל המלאי</option>
            <option value="inStock">יש מלאי</option>
            <option value="outStock">אין מלאי</option>
          </select>
          {activeChips.length > 0 && (
            <button onClick={clearAll}
              className="text-xs font-bold text-[#666] border-2 border-[#E0E0E0] hover:border-black hover:text-black px-3 py-2 rounded-lg transition-colors">
              × אפס סינון
            </button>
          )}
        </div>
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeChips.map((chip) => (
              <span key={chip.label} className="inline-flex items-center gap-1.5 bg-black text-white text-xs px-2.5 py-1 rounded font-semibold">
                {chip.label}
                <button onClick={chip.clear} className="text-[#F5E000] hover:text-white text-base leading-none">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">
        {/* Item list */}
        <div className="flex-1 min-w-0 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
            <span className="text-xs font-bold text-[#999] uppercase tracking-wide">{filtered.length} פריטים</span>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {filtered.length === 0 && (
              <div className="text-center py-14 text-[#999]">
                <div className="text-4xl mb-2">📦</div>
                לא נמצאו פריטים
              </div>
            )}
            {filtered.map((item) => {
              const net = getNetPrice(item)
              const total = totalStock(item)
              const isSelected = selectedItem?.code === item.code
              return (
                <div
                  key={item.code}
                  onClick={() => { setSelectedItem(item); setSelectedWarehouse(null); setQty(1) }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F5E000]/20 border-r-4 border-r-black' : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  <img src={item.imageUrl} alt={item.name} width={42} height={42} className="rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-black truncate">{item.name}</div>
                    <div className="text-xs text-[#999]">{item.brand} · {item.category}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {item.discountPct > 0 ? (
                      <>
                        <div className="text-xs text-[#CCC] line-through">₪{item.btpPrice.toLocaleString()}</div>
                        <div className="text-sm font-black text-[#2E7D32]">₪{net.toLocaleString()}</div>
                      </>
                    ) : (
                      <div className="text-sm font-bold">₪{item.btpPrice.toLocaleString()}</div>
                    )}
                    <div className={`text-xs mt-0.5 font-semibold ${total > 0 ? 'text-[#999]' : 'text-red-500'}`}>
                      {total > 0 ? `${total} יח׳` : 'אזל'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Details panel */}
        <div className="w-80 shrink-0 bg-white border border-[#E0E0E0] rounded-xl sticky top-20 overflow-hidden">
          {!selectedItem ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#999]">
              <div className="text-5xl mb-3 opacity-20">←</div>
              <div className="text-sm font-semibold">בחר פריט לצפייה בפרטים</div>
            </div>
          ) : (
            <>
              {/* Panel header — black strip */}
              <div className="bg-black px-4 py-3 flex items-center gap-3">
                <div
                  className="cursor-pointer rounded-lg overflow-hidden shrink-0"
                  onClick={() => setLightbox(true)}
                >
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} width={56} height={56} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm leading-tight truncate">{selectedItem.name}</div>
                  <div className="font-mono text-xs text-[#F5E000] mt-0.5">{selectedItem.code}</div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Category path */}
                <div className="text-xs text-[#999] font-medium">
                  {selectedItem.category} › {selectedItem.subCategory}
                </div>

                {/* Price */}
                <div className={`rounded-xl p-3 ${selectedItem.discountPct > 0 ? 'bg-[#E8F5E9]' : 'bg-[#F5F5F5]'}`}>
                  {selectedItem.discountPct > 0 ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[#999] line-through">₪{selectedItem.btpPrice.toLocaleString()}</div>
                        <div className="text-xl font-black text-[#2E7D32]">₪{getNetPrice(selectedItem).toLocaleString()}</div>
                      </div>
                      <span className="bg-black text-[#F5E000] text-xs font-black px-2 py-1 rounded">
                        −{selectedItem.discountPct}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-xl font-black text-black">₪{selectedItem.btpPrice.toLocaleString()}</div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  {[
                    ['ספק', selectedItem.brand],
                    ['דגם', selectedItem.model],
                    ['מידות', selectedItem.dimensions],
                    ['חומר', selectedItem.material],
                    ['צבע', selectedItem.color],
                    ['אחריות', selectedItem.warranty],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div className="text-[#999] font-semibold uppercase tracking-wide text-[10px]">{label}</div>
                      <div className="text-black font-medium">{val}</div>
                    </div>
                  ))}
                </div>

                {/* Warehouse grid */}
                <div>
                  <div className="text-xs font-bold text-black uppercase tracking-wide mb-2">מלאי לפי מחסן</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {WAREHOUSES.map((wh) => {
                      const q = selectedItem.stock[wh] ?? 0
                      const hasStock = q > 0
                      const isActive = selectedWarehouse === wh
                      return (
                        <button
                          key={wh}
                          disabled={!hasStock}
                          onClick={() => { setSelectedWarehouse(wh); setQty(1) }}
                          className={`text-xs p-1.5 rounded-lg text-center transition-all leading-tight font-semibold ${
                            isActive
                              ? 'bg-black text-[#F5E000]'
                              : hasStock
                              ? 'bg-[#F5F5F5] text-[#2E7D32] border-2 border-[#A5D6A7] hover:border-black hover:bg-[#F5E000]/20'
                              : 'bg-[#F5F5F5] text-[#CCC] cursor-not-allowed'
                          }`}
                        >
                          <div className="truncate text-[10px]">{wh}</div>
                          {hasStock && <div className="font-black">{q}</div>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Add to cart */}
                {selectedWarehouse && (
                  <div className="border-t border-[#F0F0F0] pt-3 space-y-2">
                    <div className="text-xs text-[#666] font-semibold">
                      מחסן: <span className="text-black">{selectedWarehouse}</span>
                      <span className="text-[#999] mr-1">(מקס׳ {selectedItem.stock[selectedWarehouse]})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-black uppercase tracking-wide">כמות</label>
                      <div className="flex items-center border-2 border-black rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 text-lg font-black hover:bg-[#F5E000] transition-colors"
                        >−</button>
                        <span className="w-10 text-center font-black text-sm">{qty}</span>
                        <button
                          onClick={() => setQty((q) => Math.min(selectedItem.stock[selectedWarehouse] ?? 1, q + 1))}
                          className="w-8 h-8 text-lg font-black hover:bg-[#F5E000] transition-colors"
                        >+</button>
                      </div>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-2.5 rounded-lg text-sm font-black uppercase tracking-wide transition-colors"
                      style={{ background: '#F5E000', color: '#000' }}
                    >
                      + הוסף להזמנה
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <img src={selectedItem.imageUrl} alt={selectedItem.name} className="max-w-sm max-h-96 rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}
