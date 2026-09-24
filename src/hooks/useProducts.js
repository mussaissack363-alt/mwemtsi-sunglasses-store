import { useState, useEffect, useCallback } from 'react'
import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs
} from 'firebase/firestore'
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'

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

/* Upload a base64 image to Firebase Storage, return the download URL */
async function uploadImage(id, base64DataUrl) {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) return base64DataUrl
  const storageRef = ref(storage, `products/${id}`)
  await uploadString(storageRef, base64DataUrl, 'data_url')
  return getDownloadURL(storageRef)
}

async function deleteImage(id) {
  try { await deleteObject(ref(storage, `products/${id}`)) } catch {}
}

export function useProducts() {
  const [products, setProducts] = useState({ frame: [], lenses: [], sunglasses: [] })
  const [seeded, setSeeded] = useState(false)

  /* Real-time listener across all three part collections */
  useEffect(() => {
    const parts = ['frame', 'lenses', 'sunglasses']
    const unsubs = parts.map((part) =>
      onSnapshot(
        collection(db, 'products', part, 'items'),
        (snap) => {
          const items = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
          setProducts((prev) => ({ ...prev, [part]: items }))
        },
        (err) => console.warn('Firestore listener error:', err.message)
      )
    )
    return () => unsubs.forEach((u) => u())
  }, [])

  /* Seed defaults on first load if Firestore is empty */
  useEffect(() => {
    if (seeded) return
    const parts = ['frame', 'lenses', 'sunglasses']
    Promise.all(
      parts.map((part) =>
        getDocs(collection(db, 'products', part, 'items'))
          .then((snap) => ({ part, empty: snap.empty }))
          .catch(() => ({ part, empty: false })) // don't seed if we can't read
      )
    ).then((results) => {
      const writes = []
      results.forEach(({ part, empty }) => {
        if (empty) {
          DEFAULT_PRODUCTS[part].forEach((p) => {
            writes.push(
              setDoc(doc(db, 'products', part, 'items', p.id), {
                name: p.name, price: p.price, color: p.color, image: p.image || '',
                createdAt: serverTimestamp(),
              }).catch(() => {})
            )
          })
        }
      })
      return Promise.all(writes)
    }).then(() => setSeeded(true)).catch(() => setSeeded(true))
  }, [seeded])

  const removeProduct = useCallback(async (partId, productId) => {
    await deleteDoc(doc(db, 'products', partId, 'items', productId))
    await deleteImage(productId)
  }, [])

  const addProduct = useCallback(async (partId, product) => {
    const id = 'p' + Date.now()
    const imageUrl = await uploadImage(id, product.image)
    await setDoc(doc(db, 'products', partId, 'items', id), {
      name: product.name, price: product.price, color: product.color,
      image: imageUrl || '',
      createdAt: serverTimestamp(),
    })
  }, [])

  const updateProduct = useCallback(async (partId, productId, patch) => {
    const imageUrl = patch.image?.startsWith('data:')
      ? await uploadImage(productId, patch.image)
      : patch.image
    await updateDoc(doc(db, 'products', partId, 'items', productId), {
      name: patch.name, price: patch.price, color: patch.color,
      image: imageUrl || '',
    })
  }, [])

  return { products, removeProduct, addProduct, updateProduct }
}
