"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  onChange: (files: File[]) => void
  single?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_IMAGES = 5

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

type Preview = {
  file: File
  url: string
}

export default function ImageUploader({
  onChange,
  single = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [previews, setPreviews] = useState<Preview[]>([])
  const [error, setError] = useState<string | null>(null)

  function addFiles(fileList: FileList | null) {
    setError(null)

    if (!fileList) return

    const selectedFiles = Array.from(fileList)

    const filesToAdd = single
      ? selectedFiles.slice(0, 1)
      : selectedFiles

    if (
      !single &&
      previews.length + filesToAdd.length > MAX_IMAGES
    ) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      )

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      return
    }

    const validFiles: File[] = []

    for (const file of filesToAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(
          "Please upload only PNG, JPG, or WEBP images."
        )

        if (inputRef.current) {
          inputRef.current.value = ""
        }

        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is larger than 5 MB.`)

        if (inputRef.current) {
          inputRef.current.value = ""
        }

        return
      }

      validFiles.push(file)
    }

    if (single) {
      const file = validFiles[0]

      if (!file) {
        if (inputRef.current) {
          inputRef.current.value = ""
        }

        return
      }

      const previousPreview = previews[0]

      if (previousPreview) {
        URL.revokeObjectURL(previousPreview.url)
      }

      const preview: Preview = {
        file,
        url: URL.createObjectURL(file),
      }

      setPreviews([preview])
      onChange([file])

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      return
    }

    const newPreviews = validFiles.map(
      (file): Preview => ({
        file,
        url: URL.createObjectURL(file),
      })
    )

    const nextPreviews = [
      ...previews,
      ...newPreviews,
    ]

    setPreviews(nextPreviews)

    onChange(
      nextPreviews.map(
        (preview) => preview.file
      )
    )

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  function removeFile(index: number) {
    const preview = previews[index]

    if (preview) {
      URL.revokeObjectURL(preview.url)
    }

    const nextPreviews = previews.filter(
      (_, currentIndex) => currentIndex !== index
    )

    setPreviews(nextPreviews)

    onChange(
      nextPreviews.map(
        (item) => item.file
      )
    )

    setError(null)
  }

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [])

  return (
    <div className="w-full">
      {previews.length > 0 && (
        <div
          className={
            single
              ? "space-y-3"
              : "grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="group relative overflow-hidden rounded-xl bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={`Listing image ${index + 1}`}
                className="aspect-[4/3] h-auto w-full object-cover"
              />

              {!single && index === 0 && (
                <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  Main image
                </div>
              )}

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white transition hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length <
        (single ? 1 : MAX_IMAGES) && (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-3 flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4 text-center transition hover:opacity-80"
        >
          <p className="text-sm font-medium">
            {single
              ? "Click to upload image"
              : previews.length === 0
                ? "Click to upload images"
                : "Add another image"}
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            {single
              ? "PNG, JPG, or WEBP · Max 5 MB"
              : "PNG, JPG, or WEBP · Max 5 MB each · Up to 5 images"}
          </p>

          {!single &&
            previews.length > 0 && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                {previews.length} of {MAX_IMAGES} images selected
              </p>
            )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={!single}
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files)
        }}
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}