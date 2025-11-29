import { useEffect, useRef, useState } from "react"
import * as fabric from "fabric" // Fabric v6
import { cn } from "src/lib/utils"
import type { EnhancementSettings } from "src/components/ImageEnhancer"
import type { DetectedBox } from "src/hooks/useOpenAI"

interface AnnotationCanvasProps {
  imageUrl: string | null
  className?: string
  enhancementSettings?: EnhancementSettings
  annotations?: DetectedBox[]
  onAnnotationsChange?: (annotations: DetectedBox[]) => void
  mode?: 'select' | 'draw'
}

export function AnnotationCanvas({ 
  imageUrl, 
  className, 
  enhancementSettings, 
  annotations, 
  onAnnotationsChange,
  mode = 'select' 
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
  const [fabricImage, setFabricImage] = useState<fabric.FabricImage | null>(null)
  const isDrawingRef = useRef(false)
  const startPosRef = useRef<{x: number, y: number} | null>(null)
  const activeRectRef = useRef<fabric.Rect | null>(null)

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: mode === 'select',
      uniformScaling: false,
    })

    setFabricCanvas(canvas)

    return () => {
      canvas.dispose()
    }
  }, [])

  // Update selection mode
  useEffect(() => {
    if (!fabricCanvas) return
    fabricCanvas.selection = mode === 'select'
    fabricCanvas.defaultCursor = mode === 'draw' ? 'crosshair' : 'default'
    fabricCanvas.hoverCursor = mode === 'draw' ? 'crosshair' : 'move'
    
    // Lock/Unlock objects based on mode
    fabricCanvas.getObjects().forEach(obj => {
        if (obj.type === 'rect') {
            obj.selectable = mode === 'select'
            obj.evented = mode === 'select'
        }
    })
    fabricCanvas.requestRenderAll()
  }, [fabricCanvas, mode])

  // Load Image
  useEffect(() => {
    if (!fabricCanvas || !imageUrl || !containerRef.current) return

    const loadImage = async () => {
      try {
        const img = await fabric.FabricImage.fromURL(imageUrl)
        
        // Calculate scale to fit container
        const containerWidth = containerRef.current?.clientWidth || 800
        const containerHeight = containerRef.current?.clientHeight || 600
        
        const scaleX = containerWidth / img.width
        const scaleY = containerHeight / img.height
        const scale = Math.min(scaleX, scaleY, 1) // Don't upscale if smaller

        img.scale(scale)
        
        fabricCanvas.setDimensions({
            width: img.width * scale,
            height: img.height * scale
        })
        
        fabricCanvas.backgroundImage = img
        setFabricImage(img)
        fabricCanvas.renderAll()
        
      } catch (error) {
        console.error("Failed to load image", error)
      }
    }

    loadImage()
  }, [fabricCanvas, imageUrl])

  // Apply Filters
  useEffect(() => {
    if (!fabricCanvas || !fabricImage || !enhancementSettings) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any[] = []

    if (enhancementSettings.brightness !== 0) {
      filters.push(new fabric.filters.Brightness({ brightness: enhancementSettings.brightness }))
    }
    if (enhancementSettings.contrast !== 0) {
      filters.push(new fabric.filters.Contrast({ contrast: enhancementSettings.contrast }))
    }
    if (enhancementSettings.saturation !== 0) {
      filters.push(new fabric.filters.Saturation({ saturation: enhancementSettings.saturation }))
    }

    fabricImage.filters = filters
    fabricImage.applyFilters()
    fabricCanvas.renderAll()

  }, [fabricCanvas, fabricImage, enhancementSettings])

  // Sync Annotations to Canvas (One-way sync from props to canvas)
  // We only do this when annotations prop changes significantly or on init
  // To avoid loops, we might need to be careful. 
  // For now, let's just render initial annotations or when they are replaced (e.g. auto-detect)
  useEffect(() => {
    if (!fabricCanvas || !annotations || !fabricImage) return

    // Check if we need to update. If canvas has same number of rects, maybe skip?
    // But annotations might have changed.
    // For simplicity, clear and redraw if the count differs or if it's a fresh load.
    // Real implementation would diff.
    
    // We'll clear all rects and re-add.
    const objects = fabricCanvas.getObjects()
    const rects = objects.filter(obj => obj.type === 'rect')
    
    // If we are currently drawing, don't interrupt?
    if (isDrawingRef.current) return

    // Remove existing rects
    rects.forEach(r => fabricCanvas.remove(r))

    const imgWidth = fabricImage.width || 0
    const imgHeight = fabricImage.height || 0
    const scaleX = fabricImage.scaleX || 1
    const scaleY = fabricImage.scaleY || 1

    annotations.forEach(box => {
        const left = (box.x1 / 100) * imgWidth * scaleX
        const top = (box.y1 / 100) * imgHeight * scaleY
        const width = ((box.x2 - box.x1) / 100) * imgWidth * scaleX
        const height = ((box.y2 - box.y1) / 100) * imgHeight * scaleY

        const rect = new fabric.Rect({
            left,
            top,
            width,
            height,
            fill: 'rgba(255, 0, 0, 0.2)',
            stroke: 'red',
            strokeWidth: 2,
            transparentCorners: false,
            cornerColor: 'blue',
            cornerStrokeColor: 'blue',
            borderColor: 'blue',
            selectable: mode === 'select',
            evented: mode === 'select'
        })
        
        fabricCanvas.add(rect)
    })

    fabricCanvas.requestRenderAll()

  }, [fabricCanvas, annotations, fabricImage, mode]) // Added mode to dependency to update selectability

  // Handle Canvas Events (Drawing & Modification)
  useEffect(() => {
      if (!fabricCanvas) return

      const updateAnnotations = () => {
          if (!onAnnotationsChange || !fabricImage) return
          
          const imgWidth = fabricImage.width || 1
          const imgHeight = fabricImage.height || 1
          const scaleX = fabricImage.scaleX || 1
          const scaleY = fabricImage.scaleY || 1

          const rects = fabricCanvas.getObjects().filter(obj => obj.type === 'rect') as fabric.Rect[]
          
          const newAnnotations: DetectedBox[] = rects.map(rect => {
              const left = rect.left || 0
              const top = rect.top || 0
              const width = (rect.width || 0) * (rect.scaleX || 1)
              const height = (rect.height || 0) * (rect.scaleY || 1)

              // Convert back to percentage
              const x1 = (left / (imgWidth * scaleX)) * 100
              const y1 = (top / (imgHeight * scaleY)) * 100
              const x2 = ((left + width) / (imgWidth * scaleX)) * 100
              const y2 = ((top + height) / (imgHeight * scaleY)) * 100

              return {
                  x1: Math.max(0, x1),
                  y1: Math.max(0, y1),
                  x2: Math.min(100, x2),
                  y2: Math.min(100, y2),
                  confidence: 1 // Manual annotations have 100% confidence
              }
          })
          
          onAnnotationsChange(newAnnotations)
      }

      const handleMouseDown = (opt: any) => {
          if (mode !== 'draw') return
          
          const pointer = fabricCanvas.getPointer(opt.e)
          isDrawingRef.current = true
          startPosRef.current = { x: pointer.x, y: pointer.y }
          
          const rect = new fabric.Rect({
              left: pointer.x,
              top: pointer.y,
              width: 0,
              height: 0,
              fill: 'rgba(255, 0, 0, 0.2)',
              stroke: 'red',
              strokeWidth: 2,
              selectable: false,
              evented: false
          })
          
          activeRectRef.current = rect
          fabricCanvas.add(rect)
      }

      const handleMouseMove = (opt: any) => {
          if (!isDrawingRef.current || !activeRectRef.current || !startPosRef.current) return
          
          const pointer = fabricCanvas.getPointer(opt.e)
          const startX = startPosRef.current.x
          const startY = startPosRef.current.y
          
          const width = Math.abs(pointer.x - startX)
          const height = Math.abs(pointer.y - startY)
          
          activeRectRef.current.set({
              left: Math.min(startX, pointer.x),
              top: Math.min(startY, pointer.y),
              width: width,
              height: height
          })
          
          fabricCanvas.requestRenderAll()
      }

      const handleMouseUp = () => {
          if (isDrawingRef.current) {
              isDrawingRef.current = false
              activeRectRef.current = null
              startPosRef.current = null
              
              // Trigger update
              updateAnnotations()
              
              // If we want to stay in draw mode, we can. 
              // Or switch to select. For now stay in draw.
          }
      }

      const handleObjectModified = () => {
          updateAnnotations()
      }
      
      // Remove listeners to avoid duplicates
      fabricCanvas.off('mouse:down', handleMouseDown)
      fabricCanvas.off('mouse:move', handleMouseMove)
      fabricCanvas.off('mouse:up', handleMouseUp)
      fabricCanvas.off('object:modified', handleObjectModified)
      fabricCanvas.off('object:moving', handleObjectModified)
      fabricCanvas.off('object:scaling', handleObjectModified)

      // Add listeners
      fabricCanvas.on('mouse:down', handleMouseDown)
      fabricCanvas.on('mouse:move', handleMouseMove)
      fabricCanvas.on('mouse:up', handleMouseUp)
      fabricCanvas.on('object:modified', handleObjectModified)
      fabricCanvas.on('object:moving', handleObjectModified)
      fabricCanvas.on('object:scaling', handleObjectModified)

      return () => {
          fabricCanvas.off('mouse:down', handleMouseDown)
          fabricCanvas.off('mouse:move', handleMouseMove)
          fabricCanvas.off('mouse:up', handleMouseUp)
          fabricCanvas.off('object:modified', handleObjectModified)
          fabricCanvas.off('object:moving', handleObjectModified)
          fabricCanvas.off('object:scaling', handleObjectModified)
      }
  }, [fabricCanvas, mode, fabricImage, onAnnotationsChange])

  // Handle Resize (Basic)
  useEffect(() => {
      if (!fabricCanvas || !containerRef.current) return;
      
      const resizeObserver = new ResizeObserver(() => {
          // Ideally we would resize the canvas and scale content here
          // For now, let's just ensure the container is tracked
      })
      
      resizeObserver.observe(containerRef.current)
      
      return () => resizeObserver.disconnect()
  }, [fabricCanvas])

  return (
    <div ref={containerRef} className={cn("relative h-full w-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900", className)}>
      <canvas ref={canvasRef} />
    </div>
  )
}
