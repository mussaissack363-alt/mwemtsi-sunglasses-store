import { useState, useCallback } from 'react'

const STORAGE_KEY = 'onyx_products_v2'

const DEFAULT_PRODUCTS = {
  frame: [
    { id: 'f1', name: 'Kilimanjaro', price: '$85', color: '#3a3a3d' },
    { id: 'f2', name: 'Serengeti', price: '$92', color: '#5a4632' },
    { id: 'f3', name: 'Zanzibar', price: '$78', color: '#8a3b32' },
    { id: 'f4', name: 'Walnut Temple', price: '$28', color: '#7a5230' },
  ],
  lenses: [
    { id: 'l1', name: 'Clear UV400', price: '$25', color: '#cfd6da' },
    { id: 'l2', name: 'Amber Tint', price: '$32', color: '#b9863f' },
    { id: 'l3', name: 'Polarized Grey', price: '$40', color: '#4a4d52' },
  ],
  sunglasses: [
    { id: 's1', name: 'Serengeti Sun', price: '$65', color: '#2a2a2a' },
    { id: 's2', name: 'Zanzibar Sun', price: '$70', color: '#5a3a20' },
    { id: 's3', name: 'Kilimanjaro Sun', price: '$72', color: '#1e1e22' },
  ],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS))
}

export function useProducts() {
  const [products, setProducts] = useState(load)

  const save = useCallback((p) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  }, [])

  const removeProduct = useCallback((partId, productId) => {
    setProducts(prev => {
      const next = { ...prev, [partId]: prev[partId].filter(x => x.id !== productId) }
      save(next)
      return next
    })
  }, [save])

  const addProduct = useCallback((partId, product) => {
    setProducts(prev => {
      const next = { ...prev, [partId]: [...(prev[partId] || []), { ...product, id: 'p' + Date.now() }] }
      save(next)
      return next
    })
  }, [save])

  const updateProduct = useCallback((partId, productId, patch) => {
    setProducts(prev => {
      const next = {
        ...prev,
        [partId]: (prev[partId] || []).map(x => x.id === productId ? { ...x, ...patch, id: productId } : x),
      }
      save(next)
      return next
    })
  }, [save])

  return { products, removeProduct, addProduct, updateProduct }
}
