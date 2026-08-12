"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  onChange: (file: File | null) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

export default function ImageUploader({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function clearPreview() {
    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current)
      }

      return null
    })
  }

  function handleFile(file: File | null) {
    setError(null)

    if (!file) {
      clearPreview()
      onChange(null)

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.")
      onChange(null)

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5 MB.")
      onChange(null)

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      return
    }

    clearPreview()

    const url = URL.createObjectURL(file)

    setPreview(url)
    onChange(file)
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <div className="w-full">
      <div
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        className="cursor-pointer rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4 transition hover:opacity-80"
      >
        {preview ? (
          <div className="relative overflow-hidden rounded-xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Listing image preview"
              className="aspect-[4/3] h-auto w-full object-cover object-center"
            />

            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-4 py-3 text-center text-sm font-medium text-white">
              Click to replace image
            </div>
          </div>
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium">
              Click to upload image
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              PNG, JPG, or WEBP · Max 5 MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          handleFile(file)
        }}
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {preview && (
        <button
          type="button"
          onClick={() => handleFile(null)}
          className="mt-3 text-sm font-medium text-red-500 hover:text-red-600"
        >
          Remove image
        </button>
      )}
    </div>
  )
}