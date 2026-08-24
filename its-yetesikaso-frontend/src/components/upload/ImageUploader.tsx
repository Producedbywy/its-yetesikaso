"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Cropper from "react-easy-crop"

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

type Area = {
  width: number
  height: number
  x: number
  y: number
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", reject)

    image.src = url
  })
}

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  fileType: string
): Promise<File> {
  const image = await createImage(imageSrc)

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Could not create image editor")
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      resolve,
      fileType === "image/png"
        ? "image/png"
        : "image/jpeg",
      0.92
    )
  })

  if (!blob) {
    throw new Error("Could not process image")
  }

  const extension =
    fileType === "image/png"
      ? "png"
      : "jpg"

  return new File(
    [blob],
    `listing-image-${Date.now()}.${extension}`,
    {
      type:
        fileType === "image/png"
          ? "image/png"
          : "image/jpeg",
    }
  )
}

export default function ImageUploader({
  onChange,
  single = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [previews, setPreviews] = useState<Preview[]>([])
  const [error, setError] = useState<string | null>(null)

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingImage, setEditingImage] = useState<string | null>(null)

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  })

  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null)

  const [processing, setProcessing] = useState(false)

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

    if (validFiles.length === 0) {
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

    if (single) {
      const previousPreview = previews[0]

      if (previousPreview) {
        URL.revokeObjectURL(previousPreview.url)
      }

      setPreviews(newPreviews)

      if (inputRef.current) {
        inputRef.current.value = ""
      }

openEditor(newPreviews[0], 0)

      return
    }

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

    // Automatically open the first newly added image.
    openEditor(
      newPreviews[0],
      previews.length
    )
  }

  function openEditor(
    preview: Preview,
    index: number
  ) {
    setEditingIndex(index)
    setEditingImage(preview.url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  function closeEditor() {
    setEditingIndex(null)
    setEditingImage(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels)
    },
    []
  )

  async function applyCrop() {
    if (
      editingIndex === null ||
      !editingImage ||
      !croppedAreaPixels
    ) {
      return
    }

    try {
      setProcessing(true)
      setError(null)

      const originalFile =
        previews[editingIndex]?.file

      if (!originalFile) {
        throw new Error("Image not found")
      }

      const croppedFile = await getCroppedImage(
        editingImage,
        croppedAreaPixels,
        originalFile.type
      )

      const newUrl = URL.createObjectURL(croppedFile)

      setPreviews((current) => {
        const next = [...current]

        if (next[editingIndex]) {
          URL.revokeObjectURL(
            next[editingIndex].url
          )

          next[editingIndex] = {
            file: croppedFile,
            url: newUrl,
          }
        }

        return next
      })

      const nextFiles = previews.map(
        (preview, index) =>
          index === editingIndex
            ? croppedFile
            : preview.file
      )

      onChange(nextFiles)

      closeEditor()
    } catch (err) {
      console.error(err)

      setError(
        "We couldn't process this image. Please try again."
      )
    } finally {
      setProcessing(false)
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

    if (editingIndex === index) {
      closeEditor()
    }

    setError(null)
  }

  useEffect(() => {
  return () => {
    previews.forEach((preview) => {
      URL.revokeObjectURL(preview.url)
    })
  }
  // Only clean up when the component itself unmounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openEditor(preview, index)
                  }
                  className="flex-1 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-black shadow transition hover:bg-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeFile(index)
                  }
                  className="rounded-lg bg-black/70 px-3 py-2 text-xs font-medium text-white transition hover:bg-black/90"
                >
                  Remove
                </button>
              </div>
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

      {/* IMAGE EDITOR */}
      {editingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[var(--card)] shadow-2xl">
            <div className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Adjust image
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Drag the image to reposition it and use
                  the slider to zoom.
                </p>
              </div>

              <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-black sm:h-[440px]">
                <Cropper
                  image={editingImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Zoom</span>
                  <span className="text-[var(--muted)]">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) =>
                    setZoom(
                      Number(event.target.value)
                    )
                  }
                  className="w-full accent-lime-400"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={processing}
                  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 font-medium transition hover:bg-[var(--background)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={applyCrop}
                  disabled={
                    processing ||
                    !croppedAreaPixels
                  }
                  className="flex-1 rounded-xl bg-lime-400 px-4 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : "Save Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}