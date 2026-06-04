import { create } from 'zustand'

export interface CartItem {
  code: string
  name: string
  finish: string
  location: string
  warehouse: string
  source: 'מלאי' | 'תצוגה' | 'יבוא' | 'מלאי בדרך' | '29'
  brand: string
  model: string
  dimensions: string
  unitPrice: number
  discountPct: number
  quantity: number
  deliveryDate?: string
  notes?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (index: number) => void
  updateItem: (index: number, updates: Partial<CartItem>) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (index) =>
    set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
  updateItem: (index, updates) =>
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
}))
