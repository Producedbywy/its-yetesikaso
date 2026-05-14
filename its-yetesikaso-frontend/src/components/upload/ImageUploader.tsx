"use client"

import { useRef, useState } from "react"

type Props = {
  value: File | null
  onChange: (file: File | null) => void
}

export default function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(file: File | null) {
    onChange(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  return (
    <div className="w-full">

      {/* DROP AREA */}
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-center hover:opacity-80 transition"
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="h-48 w-full rounded-xl object-cover"
          />
        ) : (
          <>
            <p className="text-sm font-medium">
              Click to upload image
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              PNG, JPG, WEBP
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFile(file)
        }}
      />

      {/* REMOVE BUTTON */}
      {preview && (
        <button
          type="button"
          onClick={() => handleFile(null)}
          className="mt-3 text-sm text-red-500"
        >
          Remove image
        </button>
      )}
    </div>
  )
}