'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Photo' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setError(''); setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) onChange(data.url)
    else setError(data.error || 'Upload failed')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label className="text-sm font-medium text-[#4A4A4A] block mb-1.5">{label}</label>

      {/* Preview */}
      {value && (
        <div className="relative w-full h-36 mb-2 rounded overflow-hidden bg-[#F9F7F5] border border-[#E0DCD9]">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <button onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full text-xs flex items-center justify-center text-[#4A4A4A] hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Remove image">✕</button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()} onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#E0DCD9] rounded p-5 text-center cursor-pointer hover:border-[#D4A898] transition-colors"
        style={{ backgroundColor: '#F9F7F5' }}>
        {uploading ? (
          <p className="text-sm text-[#4A4A4A]/50">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-[#4A4A4A]/60">Drop image here or <span className="text-[#D4A898] underline">browse</span></p>
            <p className="text-xs text-[#4A4A4A]/35 mt-1">JPEG, PNG, WebP — max 5 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>

      {/* URL fallback */}
      <div className="mt-2">
        <input type="text" placeholder="Or paste image URL…" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-[#E0DCD9] rounded-[4px] text-sm text-[#4A4A4A] bg-white focus:outline-none focus:border-[#D4A898]" />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
