'use client'
import { useState, useEffect } from 'react'
import type { StockItem } from '@/mock/items'

export function useItems() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/priority/items')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setItems(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { items, loading, error }
}

export function useCustomerSearch(query: string) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    setLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/priority/customers?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300) // debounce
    return () => clearTimeout(timer)
  }, [query])

  return { results, loading }
}
