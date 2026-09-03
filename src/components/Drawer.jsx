import { useState, useCallback } from 'react'

const PART_LABELS = { frame: 'Frame', lenses: 'Lenses', sunglasses: 'Sunglasses' }

export default function Drawer({ activePart, onClose, products, onRemove, onAdd }) {
  const [adminMode, setAdminMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', price: '', color: '#c9a24a' })

  const isOpen = !!activePart
  const items = activePart ? (products[activePart] || []) : []

  const handleAdd = useCallback(() => {
    if (!addForm.name.trim()) return
    onAdd(activePart, { name: addForm.name.trim(), price: addForm.price.trim() || '—', color: addForm.color })
    setAddForm({ name: '', price: '', color: '#c9a24a' })
    setShowAddModal(false)
  }, [addForm, activePart, onAdd])

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[18] border-t border-onyx-line transition-all duration-[550ms] max-h-[44vh] ${
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

        {/* Product row */}
        <div className="flex gap-3.5 overflow-x-auto pb-1.5 px-6 max-sm:px-4 scroll-smooth" style={{ scrollSnapType: 'x proximity' }}>
          {items.map((p) => (
            <div key={p.id} className="product-card" role="listitem">
              {adminMode && (
                <button
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 border border-onyx-danger text-onyx-danger text-[11px] flex items-center justify-center cursor-pointer z-5 hover:bg-onyx-danger hover:text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); onRemove(activePart, p.id) }}
                  aria-label={`Remove ${p.name}`}
                >
                  ✕
                </button>
              )}
              <div className="h-24 w-full" style={{ background: p.color }} />
              <div className="p-2.5 px-3 pb-3">
                <p className="text-[12.5px] font-semibold m-0 text-onyx-text">{p.name}</p>
                <p className="text-xs text-onyx-accent mt-0.5 mb-0">{p.price}</p>
              </div>
            </div>
          ))}

          {adminMode && (
            <button
              className="flex-none w-[150px] h-[150px] border border-dashed border-onyx-line rounded-md flex items-center justify-center text-onyx-muted text-2xl cursor-pointer bg-transparent hover:border-onyx-accent hover:text-onyx-accent transition-colors"
              onClick={() => setShowAddModal(true)}
              aria-label="Add new product"
            >
              +
            </button>
          )}
        </div>

        {/* Admin toggle */}
        <div className="px-6 pt-2 pb-1 max-sm:px-4">
          <button
            className={`w-8 h-8 rounded-full border text-xs cursor-pointer flex items-center justify-center transition-colors ${
              adminMode
                ? 'border-onyx-accent text-onyx-accent bg-[#161209]'
                : 'border-onyx-line text-onyx-muted bg-transparent hover:border-onyx-accent hover:text-onyx-accent'
            }`}
            onClick={() => setAdminMode(!adminMode)}
            aria-label="Toggle admin mode"
            title="Admin"
          >
            ✎
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[17] bg-black/55"
          onClick={onClose}
        />
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-[40] flex items-center justify-center">
          <div className="bg-onyx-panel border border-onyx-line rounded-lg p-5 w-[280px] max-sm:w-[calc(100vw-32px)]">
            <h3 className="m-0 mb-3.5 text-sm font-medium text-onyx-text">Add product</h3>
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Name</label>
            <input
              className="w-full bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-[13px] focus:border-onyx-accent transition-colors"
              type="text"
              placeholder="e.g. Kilimanjaro Frame"
              value={addForm.name}
              onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
            />
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Price</label>
            <input
              className="w-full bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-[13px] focus:border-onyx-accent transition-colors"
              type="text"
              placeholder="e.g. $85"
              value={addForm.price}
              onChange={(e) => setAddForm(f => ({ ...f, price: e.target.value }))}
            />
            <label className="block text-[11px] text-onyx-muted mt-2.5 mb-1">Swatch color</label>
            <input
              className="w-full bg-onyx-surface border border-onyx-line text-onyx-text p-2 rounded text-[13px]"
              type="color"
              value={addForm.color}
              onChange={(e) => setAddForm(f => ({ ...f, color: e.target.value }))}
            />
            <div className="flex gap-2 mt-4.5">
              <button className="flex-1 py-2.5 rounded text-[12.5px] cursor-pointer border border-onyx-line bg-transparent text-onyx-muted hover:border-onyx-muted hover:text-onyx-text transition-colors" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded text-[12.5px] cursor-pointer border border-onyx-accent bg-onyx-accent text-[#181206] font-semibold hover:bg-[#d4ad55] active:bg-[#b8913f] transition-colors" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
