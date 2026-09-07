import { useState, useCallback } from 'react'

const PART_LABELS = { frame: 'Frame', lenses: 'Lenses', sunglasses: 'Sunglasses' }

// Admin PIN — client-side only, NOT real security (matches original site)
const ADMIN_PIN = '2580'

const EMPTY_FORM = { name: '', price: '', color: '#c9a24a', image: '' }

export default function Drawer({ activePart, onClose, products, onRemove, onAdd, onUpdate }) {
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // product being edited, null = adding
  const [form, setForm] = useState(EMPTY_FORM)

  const isOpen = !!activePart
  const items = activePart ? (products[activePart] || []) : []

  const handleAdminToggle = useCallback(() => {
    if (adminMode) {
      setAdminMode(false)
      return
    }
    if (!adminUnlocked) {
      setPin('')
      setPinError(false)
      setShowPinModal(true)
      return
    }
    setAdminMode(true)
  }, [adminMode, adminUnlocked])

  const handlePinSubmit = useCallback(() => {
    if (pin === ADMIN_PIN) {
      setAdminUnlocked(true)
      setAdminMode(true)
      setShowPinModal(false)
      setPin('')
      setPinError(false)
    } else {
      setPinError(true)
    }
  }, [pin])

  const openAdd = useCallback(() => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }, [])

  const openEdit = useCallback((p) => {
    setEditing(p)
    setForm({ name: p.name, price: p.price, color: p.color, image: p.image || '' })
    setShowModal(true)
  }, [])

  /* Read an uploaded photo, downscale it, and store it as a compact data URL */
  const handleImageFile = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 320
        let { width, height } = img
        if (width > max || height > max) {
          const ratio = Math.min(max / width, max / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        setForm(f => ({ ...f, image: canvas.toDataURL('image/jpeg', 0.85) }))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!form.name.trim()) return
    const payload = { name: form.name.trim(), price: form.price.trim() || '—', color: form.color, image: form.image }
    if (editing) {
      onUpdate(activePart, editing.id, payload)
    } else {
      onAdd(activePart, payload)
    }
    setForm(EMPTY_FORM)
    setShowModal(false)
    setEditing(null)
  }, [form, editing, activePart, onUpdate, onAdd])

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[18] border-t border-onyx-line transition-all duration-[550ms] max-h-[44vh] max-sm:max-h-[52vh] ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #0a0a0b 24px, #0a0a0b 100%)',
          transitionTimingFunction: 'cubic-bezier(.22,.9,.3,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-baseline justify-between mb-3.5 px-6 pt-5 pb-0 max-sm:px-4">
          <div>
            <p className="text-xl font-semibold tracking-tight m-0 text-onyx-text">
              {PART_LABELS[activePart] || activePart}
            </p>
            <p className="text-[11px] text-onyx-muted mt-0.5 mb-0 tracking-wide">
              {activePart === 'sunglasses' ? 'Scroll to explore our sun collection' : 'Tap a piece to shop it'}
            </p>
          </div>
          <button
            className="btn-ghost px-4 py-2 text-[11.5px] rounded-full"
            onClick={onClose}
          >
            ← Back to full view
          </button>
        </div>

        {/* Product row — extra bottom padding on phones so the cards clear the
            floating admin (bottom-left) and WhatsApp (bottom-right) buttons */}
        <div className="flex gap-3.5 overflow-x-auto pb-1.5 px-6 max-sm:px-4 max-sm:pb-14 scroll-smooth" style={{ scrollSnapType: 'x proximity' }}>
          {items.map((p) => (
            <div
              key={p.id}
              className={`product-card ${adminMode ? 'cursor-pointer' : ''}`}
              role="listitem"
              title={adminMode ? 'Click to edit' : undefined}
              onClick={adminMode ? () => openEdit(p) : undefined}
            >
              {adminMode && (
                <>
                  <button
                    className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 border border-onyx-accent text-onyx-accent text-[11px] flex items-center justify-center cursor-pointer z-5 hover:bg-onyx-accent hover:text-[#181206] transition-colors"
                    onClick={(e) => { e.stopPropagation(); openEdit(p) }}
                    aria-label={`Edit ${p.name}`}
                    title="Edit product"
                  >
                    ✎
                  </button>
                  <button
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 border border-onyx-danger text-onyx-danger text-[11px] flex items-center justify-center cursor-pointer z-5 hover:bg-onyx-danger hover:text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); onRemove(activePart, p.id) }}
                    aria-label={`Remove ${p.name}`}
                    title="Remove product"
                  >
                    ✕
                  </button>
                </>
              )}
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-24 w-full object-cover block" />
              ) : (
                <div className="h-24 w-full" style={{ background: p.color }} />
              )}
              <div className="p-2.5 px-3 pb-3">
                <p className="text-[12.5px] font-semibold m-0 text-onyx-text">{p.name}</p>
                <p className="text-xs text-onyx-accent mt-0.5 mb-0">{p.price}</p>
              </div>
            </div>
          ))}

          {adminMode && (
            <button
              className="flex-none w-[150px] h-[150px] border border-dashed border-onyx-line rounded-md flex items-center justify-center text-onyx-muted text-2xl cursor-pointer bg-transparent hover:border-onyx-accent hover:text-onyx-accent transition-colors"
              onClick={openAdd}
              aria-label="Add new product"
            >
              +
            </button>
          )}
        </div>

      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[17] bg-black/55"
          onClick={onClose}
        />
      )}

      {/* Floating admin button — always visible, bottom-left (matches original site) */}
      <button
        className={`fixed left-6 bottom-6 z-20 w-[34px] h-[34px] rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
          adminMode
            ? 'border-onyx-accent text-onyx-accent bg-[#161209]'
            : 'border-onyx-line text-onyx-muted bg-transparent hover:border-onyx-accent hover:text-onyx-accent'
        }`}
        onClick={handleAdminToggle}
        aria-label="Toggle admin mode"
        title={adminUnlocked ? 'Toggle admin mode' : 'Unlock admin mode'}
      >
        ✎
      </button>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 z-[40] flex items-center justify-center">
          <div className="bg-onyx-panel border border-onyx-line rounded-lg p-5 w-[280px] max-sm:w-[calc(100vw-32px)] text-center">
            <h3 className="m-0 mb-1 text-sm font-medium text-onyx-text">Admin PIN</h3>
            <p className="text-[11px] text-onyx-muted mt-0 mb-3">Enter the PIN to unlock editing</p>
            <input
              className="w-full text-center tracking-[0.3em] bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-base focus:border-onyx-accent transition-colors"
              type="password"
              maxLength="6"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit() }}
              autoFocus
            />
            {pinError && (
              <p className="text-[11px] text-onyx-danger mt-2 mb-0">Wrong PIN, try again</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-2.5 rounded text-[12.5px] cursor-pointer border border-onyx-line bg-transparent text-onyx-muted hover:border-onyx-muted hover:text-onyx-text transition-colors"
                onClick={() => setShowPinModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded text-[12.5px] cursor-pointer border border-onyx-accent bg-onyx-accent text-[#181206] font-semibold hover:bg-[#d4ad55] active:bg-[#b8913f] transition-colors"
                onClick={handlePinSubmit}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-[40] flex items-center justify-center">
          <div className="bg-onyx-panel border border-onyx-line rounded-lg p-5 w-[280px] max-sm:w-[calc(100vw-32px)]">
            <h3 className="m-0 mb-3.5 text-sm font-medium text-onyx-text">
              {editing ? 'Edit product' : 'Add product'}
            </h3>
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Name</label>
            <input
              className="w-full bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-[13px] focus:border-onyx-accent transition-colors"
              type="text"
              placeholder="e.g. Kilimanjaro Frame"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Price</label>
            <input
              className="w-full bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-[13px] focus:border-onyx-accent transition-colors"
              type="text"
              placeholder="e.g. $85"
              value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
            />
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Swatch color</label>
            <input
              className="w-full bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-[13px]"
              type="color"
              value={form.color}
              onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
            />
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Photo (optional)</label>
            <div className="flex items-center gap-2.5">
              {form.image ? (
                <img src={form.image} alt="Preview" className="w-12 h-12 rounded object-cover block border border-onyx-line" />
              ) : (
                <div className="w-12 h-12 rounded border border-dashed border-onyx-line flex items-center justify-center text-onyx-muted text-[10px]">none</div>
              )}
              <label className="btn-ghost px-3 py-2 text-[11.5px] rounded-full cursor-pointer inline-block">
                {form.image ? 'Change photo' : 'Upload photo'}
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = '' }}
                />
              </label>
              {form.image && (
                <button
                  className="btn-ghost px-3 py-2 text-[11.5px] rounded-full"
                  onClick={() => setForm(f => ({ ...f, image: '' }))}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-4.5">
              <button className="flex-1 py-2.5 rounded text-[12.5px] cursor-pointer border border-onyx-line bg-transparent text-onyx-muted hover:border-onyx-muted hover:text-onyx-text transition-colors" onClick={() => { setShowModal(false); setEditing(null) }}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded text-[12.5px] cursor-pointer border border-onyx-accent bg-onyx-accent text-[#181206] font-semibold hover:bg-[#d4ad55] active:bg-[#b8913f] transition-colors" onClick={handleSubmit}>
                {editing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}