import { useState, useCallback } from "react"
import { Upload } from "lucide-react"
import { cn } from "src/lib/utils"

interface ImageUploadProps {
  onUpload: (file: File) => void
  className?: string
}

export function ImageUpload({ onUpload, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        onUpload(file)
      }
    },
    [onUpload]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onUpload(file)
      }
    },
    [onUpload]
  )

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="rounded-full bg-muted p-4">
          <Upload className="h-8 w-8" />
        </div>
        <div className="text-lg font-medium">
          Drag & drop an image here, or click to select
        </div>
        <div className="text-sm">
          Supports JPG, PNG, WebP up to 10MB
        </div>
      </div>
    </div>
  )
}
