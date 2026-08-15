'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getWardrobe } from '@/lib/memory'
import type { WardrobeItem } from '@/types'

const VTO_FEATURES: Record<string, string> = {
  clothing: 'cloth',
  outerwear: 'cloth',
  footwear: 'shoes',
  bag: 'bag',
  jewelry: '2d-vto/earring',
}

function StudioContent() {
  const params = useSearchParams()
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])
  const [selected, setSelected] = useState<WardrobeItem | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState('')
  const [selfieId, setSelfieId] = useState('')
  const [selfieError, setSelfieError] = useState('')
  const [selfieUploading, setSelfieUploading] = useState(false)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const w = getWardrobe()
    setWardrobe(w)
    const itemId = params.get('item')
    if (itemId) setSelected(w.find(i => i.id === itemId) ?? null)
    const storedId = localStorage.getItem('closetmind_selfie_id') || ''
    const storedUrl = localStorage.getItem('closetmind_selfie_url') || ''
    setSelfieId(storedId)
    setSelfiePreview(storedUrl)
  }, [params])

  async function uploadSelfie(file: File) {
    setSelfieFile(file)
    setSelfiePreview(URL.createObjectURL(file))
    setSelfieError('')
    setSelfieUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('feature', 'cloth')
      const res = await fetch('/api/vto/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.file_id) {
        setSelfieId(data.file_id)
        localStorage.setItem('closetmind_selfie_id', data.file_id)
        localStorage.setItem('closetmind_selfie_url', URL.createObjectURL(file))
      } else {
        setSelfieError(data.error || 'Upload failed — check API key in Vercel env vars')
      }
    } catch (e: unknown) {
      setSelfieError((e as Error).message)
    } finally {
      setSelfieUploading(false)
    }
  }

  async function runVTO() {
    if (!selfieId) { setError('Upload a selfie first'); return }
    if (!selected) { setError('Select an item first'); return }
    setLoading(true)
    setError('')
    setResult('')
    try {
      const feature = VTO_FEATURES[selected.category] || 'cloth'
      const res = await fetch('/api/vto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, selfie_id: selfieId, item_url: selected.imageUrl }),
      })
      const data = await res.json()
      if (data.url) setResult(data.url)
      else setError(data.error || 'VTO failed')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto border-b border-[#e8e4da]">
        <Link href="/" className="font-serif text-xl text-[#191919]">ContextMirror</Link>
        <div className="flex items-center gap-6 text-sm text-[#6b6b6b]">
          <Link href="/test-look" className="font-medium text-[#191919]">Test My Look</Link>
          <Link href="/dashboard" className="hover:text-[#191919]">← Wardrobe</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-[#191919] mb-2">AI Studio</h1>
        <p className="text-[#6b6b6b] text-sm mb-8">Upload your selfie, pick an item, see it on you today.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Selfie panel */}
          <div className="card p-5">
            <h3 className="font-medium text-[#191919] mb-3 text-sm">Your selfie</h3>
            <label className="block aspect-square rounded-lg border-2 border-dashed border-[#d4cfc4] hover:border-[#191919] transition-colors cursor-pointer overflow-hidden mb-3">
              {selfiePreview
                ? <img src={selfiePreview} alt="selfie" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#9e9a91]">
                    <span className="text-3xl">📸</span>
                    <span className="text-xs">Upload selfie</span>
                  </div>
              }
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadSelfie(f) }} />
            </label>
            {selfieId && <div className="text-[10px] text-[#50B33A]">✓ Ready for VTO</div>}
            {selfieUploading && <div className="text-[10px] text-[#9e9a91]">Uploading...</div>}
            {selfieError && <div className="text-[10px] text-red-500">{selfieError}</div>}
          </div>

          {/* Item selector */}
          <div className="card p-5">
            <h3 className="font-medium text-[#191919] mb-3 text-sm">Select item</h3>
            {selected && (
              <div className="mb-3 p-3 bg-[#f7f4ed] rounded-lg flex gap-3 items-center">
                <img src={selected.imageUrl} alt={selected.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <div className="text-sm font-medium text-[#191919]">{selected.name}</div>
                  <div className="text-xs text-[#9e9a91] capitalize">{selected.category}</div>
                </div>
                <button onClick={() => setSelected(null)} className="ml-auto text-[#9e9a91] hover:text-[#191919]">✕</button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {wardrobe.map(item => (
                <button key={item.id} onClick={() => setSelected(item)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selected?.id === item.id ? 'border-[#191919]' : 'border-transparent hover:border-[#d4cfc4]'}`}>
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Result panel */}
          <div className="card p-5">
            <h3 className="font-medium text-[#191919] mb-3 text-sm">VTO result</h3>
            <div className="aspect-square rounded-lg overflow-hidden bg-[#f7f4ed] border border-[#e8e4da] mb-3 flex items-center justify-center">
              {loading && (
                <div className="text-center text-[#9e9a91]">
                  <div className="text-2xl mb-2 animate-spin">✦</div>
                  <div className="text-xs">Rendering...</div>
                </div>
              )}
              {result && !loading && <img src={result} alt="VTO result" className="w-full h-full object-cover" />}
              {!result && !loading && (
                <div className="text-center text-[#9e9a91]">
                  <div className="text-3xl mb-2">✨</div>
                  <div className="text-xs">Result appears here</div>
                </div>
              )}
            </div>
            {error && <div className="text-xs text-red-500 mb-3">{error}</div>}
            {!selfieId && !selfieUploading && <div className="text-xs text-amber-600 mb-2">📸 Upload a selfie first</div>}
            {selfieId && !selected && <div className="text-xs text-amber-600 mb-2">👗 Select an item below</div>}
            <button
              onClick={runVTO}
              disabled={loading || selfieUploading}
              className="btn-primary w-full"
            >
              {selfieUploading ? 'Uploading selfie...' : loading ? 'Rendering...' : 'Try it on'}
            </button>
            {result && (
              <a href={result} download className="btn-secondary w-full mt-2 text-center block">
                Download
              </a>
            )}
          </div>
        </div>

        {/* Item grid for quick selection */}
        <div className="mt-8">
          <h2 className="font-serif text-xl text-[#191919] mb-4">Your wardrobe</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {wardrobe.map(item => (
              <button key={item.id} onClick={() => setSelected(item)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selected?.id === item.id ? 'border-[#191919]' : 'border-transparent hover:border-[#d4cfc4]'}`}>
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function StudioPage() {
  return <Suspense><StudioContent /></Suspense>
}
