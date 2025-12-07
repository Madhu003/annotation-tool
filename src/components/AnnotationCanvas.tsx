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
  zoom?: number
  aspectRatio?: number | 'original'
  selectedAnnotationIndex?: number | null
  onAnnotationSelect?: (index: number | null) => void
}

export function AnnotationCanvas({ 
  imageUrl, 
  className, 
  enhancementSettings, 
  annotations, 
  onAnnotationsChange,
  mode = 'select',
  zoom = 1,
  aspectRatio = 'original',
  selectedAnnotationIndex,
  onAnnotationSelect
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
  const [fabricImage, setFabricImage] = useState<fabric.FabricImage | null>(null)
  const isDrawingRef = useRef(false)
  const startPosRef = useRef<{x: number, y: number} | null>(null)
  const activeRectRef = useRef<fabric.Rect | null>(null)
  const annotationMapRef = useRef<Map<fabric.Rect, number>>(new Map())
  const textObjectsRef = useRef<Map<fabric.Rect, fabric.Text>>(new Map())
  const skipSyncRef = useRef(false)

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

  // Handle Zoom
  useEffect(() => {
    if (!fabricCanvas) return
    fabricCanvas.setZoom(zoom)
    fabricCanvas.requestRenderAll()
  }, [fabricCanvas, zoom])

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
  
  // Handle external selection (from sidebar)
  useEffect(() => {
    if (!fabricCanvas || selectedAnnotationIndex === undefined) return
    
    const rects = fabricCanvas.getObjects().filter(obj => obj.type === 'rect') as fabric.Rect[]
    const targetRect = rects.find(rect => annotationMapRef.current.get(rect) === selectedAnnotationIndex)
    
    if (targetRect && selectedAnnotationIndex !== null) {
      fabricCanvas.setActiveObject(targetRect)
      fabricCanvas.requestRenderAll()
    } else if (selectedAnnotationIndex === null) {
      fabricCanvas.discardActiveObject()
      fabricCanvas.requestRenderAll()
    }
  }, [fabricCanvas, selectedAnnotationIndex])

  // Load Image & Handle Resize/Aspect Ratio
  useEffect(() => {
    if (!fabricCanvas || !imageUrl || !containerRef.current) return

    const loadImage = async () => {
      try {
        // If image is already loaded and just aspect ratio changed, we might want to optimize
        // But for simplicity, let's reload/rescale
        
        let img = fabricImage
        if (!img) {
            img = await fabric.FabricImage.fromURL(imageUrl)
            setFabricImage(img)
            fabricCanvas.backgroundImage = img
        }
        
        const containerWidth = containerRef.current?.clientWidth || 800
        let containerHeight = containerRef.current?.clientHeight || 600

        // Adjust container height based on aspect ratio if needed
        // Note: We can't easily change the DOM container height from here without affecting layout
        // So we will fit the canvas WITHIN the available container space respecting the aspect ratio
        
        let targetWidth = containerWidth
        let targetHeight = containerHeight

        if (aspectRatio !== 'original') {
            // Force aspect ratio
            const ratio = aspectRatio as number
            // Try to fit width
            if (containerWidth / ratio <= containerHeight) {
                targetHeight = containerWidth / ratio
            } else {
                targetWidth = containerHeight * ratio
            }
        } else {
             // Original aspect ratio of image
             const ratio = img.width / img.height
             if (containerWidth / ratio <= containerHeight) {
                targetHeight = containerWidth / ratio
            } else {
                targetWidth = containerHeight * ratio
            }
        }

        fabricCanvas.setDimensions({
            width: targetWidth,
            height: targetHeight
        })

        // Scale image to fit the new canvas dimensions
        const scaleX = targetWidth / img.width
        const scaleY = targetHeight / img.height
        // We want 'contain'
        // Actually, if we set canvas to aspect ratio, we want 'fill' (which is same as contain here)
        
        img.scaleX = scaleX
        img.scaleY = scaleY
        img.left = 0
        img.top = 0
        
        fabricCanvas.renderAll()
        
      } catch (error) {
        console.error("Failed to load image", error)
      }
    }

    loadImage()
  }, [fabricCanvas, imageUrl, aspectRatio]) // Removed fabricImage from deps to avoid loop if we set it inside

  // Apply Filters
  useEffect(() => {
    if (!fabricCanvas || !fabricImage || !enhancementSettings) return

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

  // Helper function to create text label for a rectangle
  const createTextLabel = (rect: fabric.Rect, text: string | undefined): fabric.Text | null => {
    if (!text || text.trim() === '') return null
    
    const textObj = new fabric.Text(text, {
      left: (rect.left || 0) + 5,
      top: (rect.top || 0) - 20,
      fontSize: 14,
      fill: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 4,
      selectable: false,
      evented: false,
      fontFamily: 'Arial',
    })
    
    return textObj
  }

  // Helper function to update text label position
  const updateTextLabelPosition = (rect: fabric.Rect, textObj: fabric.Text) => {
    textObj.set({
      left: (rect.left || 0) + 5,
      top: (rect.top || 0) - 20,
    })
  }

  // Sync Annotations to Canvas (One-way sync from props to canvas)
  // We only sync when skipSyncRef is false (i.e., not during user interactions)
  useEffect(() => {
    if (!fabricCanvas || !annotations || !fabricImage) return
    if (skipSyncRef.current) return
    if (isDrawingRef.current) return

    const objects = fabricCanvas.getObjects()
    const rects = objects.filter(obj => obj.type === 'rect') as fabric.Rect[]
    const texts = objects.filter(obj => obj.type === 'text') as fabric.Text[]
    
    // Try to update existing rectangles and text labels instead of recreating
    // Only recreate if count doesn't match
    const needsFullRecreate = rects.length !== annotations.length
    
    if (!needsFullRecreate && rects.length > 0) {
      // Update existing rectangles and text labels
      let needsRecreate = false
      
      rects.forEach((rect, idx) => {
        const box = annotations[idx]
        if (!box) {
          needsRecreate = true
          return
        }
        
        const imgWidth = fabricImage.width || 0
        const imgHeight = fabricImage.height || 0
        const scaleX = fabricImage.scaleX || 1
        const scaleY = fabricImage.scaleY || 1
        
        const expectedLeft = (box.x1 / 100) * imgWidth * scaleX
        const expectedTop = (box.y1 / 100) * imgHeight * scaleY
        const expectedWidth = ((box.x2 - box.x1) / 100) * imgWidth * scaleX
        const expectedHeight = ((box.y2 - box.y1) / 100) * imgHeight * scaleY
        
        // Check if position changed significantly (more than 1 pixel)
        const posChanged = Math.abs((rect.left || 0) - expectedLeft) > 1 ||
                          Math.abs((rect.top || 0) - expectedTop) > 1 ||
                          Math.abs((rect.width || 0) * (rect.scaleX || 1) - expectedWidth) > 1 ||
                          Math.abs((rect.height || 0) * (rect.scaleY || 1) - expectedHeight) > 1
        
        if (posChanged) {
          needsRecreate = true
          return
        }
        
        // Update text label if text changed
        const textObj = textObjectsRef.current.get(rect)
        const currentText = box.text || ''
        const hasText = currentText.trim() !== ''
        
        if (hasText && !textObj) {
          // Need to add text label
          const newTextObj = createTextLabel(rect, currentText)
          if (newTextObj) {
            fabricCanvas.add(newTextObj)
            textObjectsRef.current.set(rect, newTextObj)
          }
        } else if (!hasText && textObj) {
          // Need to remove text label
          fabricCanvas.remove(textObj)
          textObjectsRef.current.delete(rect)
        } else if (hasText && textObj && textObj.text !== currentText) {
          // Update text content
          textObj.set('text', currentText)
          updateTextLabelPosition(rect, textObj)
        }
      })
      
      if (!needsRecreate) {
        fabricCanvas.requestRenderAll()
        return // Updated in place, no need to recreate
      }
    }
    
    // Full recreate if needed
    rects.forEach(r => {
      const textObj = textObjectsRef.current.get(r)
      if (textObj) {
        fabricCanvas.remove(textObj)
        textObjectsRef.current.delete(r)
      }
      fabricCanvas.remove(r)
      annotationMapRef.current.delete(r)
    })
    texts.forEach(t => fabricCanvas.remove(t))

    const imgWidth = fabricImage.width || 0
    const imgHeight = fabricImage.height || 0
    const scaleX = fabricImage.scaleX || 1
    const scaleY = fabricImage.scaleY || 1

    annotations.forEach((box, index) => {
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
            evented: mode === 'select',
        })
        
        // Store annotation index in rect
        ;(rect as any).annotationIndex = index
        annotationMapRef.current.set(rect, index)
        
        fabricCanvas.add(rect)
        
        // Add text label if exists
        if (box.text && box.text.trim() !== '') {
          const textObj = createTextLabel(rect, box.text)
          if (textObj) {
            fabricCanvas.add(textObj)
            textObjectsRef.current.set(rect, textObj)
          }
        }
    })

    fabricCanvas.requestRenderAll()

  }, [fabricCanvas, annotations, fabricImage, mode])

  // Handle Canvas Events (Drawing & Modification)
  useEffect(() => {
      if (!fabricCanvas) return

      const updateAnnotations = () => {
          if (!onAnnotationsChange || !fabricImage) return
          
          skipSyncRef.current = true
          
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

              // Get text from stored annotation or from text object
              const annotationIndex = annotationMapRef.current.get(rect)
              const existingText = annotationIndex !== undefined && annotations?.[annotationIndex]?.text
              
              return {
                  x1: Math.max(0, x1),
                  y1: Math.max(0, y1),
                  x2: Math.min(100, x2),
                  y2: Math.min(100, y2),
                  confidence: 1, // Manual annotations have 100% confidence
                  text: existingText || ''
              }
          })
          
          onAnnotationsChange(newAnnotations)
          
          // Reset skip sync after a short delay to allow state to update
          setTimeout(() => {
            skipSyncRef.current = false
          }, 100)
      }

      const handleMouseDown = (opt: any) => {
          if (mode !== 'draw') return
          
          // Don't draw if clicking on an existing rectangle
          if (opt.target && opt.target.type === 'rect') {
            return
          }
          
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
          if (isDrawingRef.current && activeRectRef.current) {
              const rect = activeRectRef.current
              
              // Only finalize if rectangle has meaningful size
              const width = (rect.width || 0) * (rect.scaleX || 1)
              const height = (rect.height || 0) * (rect.scaleY || 1)
              
              if (width > 5 && height > 5) {
                  // Make rectangle selectable and editable
                  rect.set({
                      selectable: mode === 'select',
                      evented: mode === 'select',
                  })
                  
                  // Assign annotation index
                  const newIndex = annotations?.length || 0
                  ;(rect as any).annotationIndex = newIndex
                  annotationMapRef.current.set(rect, newIndex)
                  
                  // Trigger update
                  updateAnnotations()
              } else {
                  // Remove tiny rectangles
                  fabricCanvas.remove(rect)
              }
              
              isDrawingRef.current = false
              activeRectRef.current = null
              startPosRef.current = null
          }
      }

      const handleObjectModified = (opt: any) => {
          const obj = opt.target
          if (obj && obj.type === 'rect') {
              // Update text label position when rect moves/resizes
              const textObj = textObjectsRef.current.get(obj as fabric.Rect)
              if (textObj) {
                  updateTextLabelPosition(obj as fabric.Rect, textObj)
                  fabricCanvas.requestRenderAll()
              }
              updateAnnotations()
          }
      }
      
      const handleSelectionCreated = (opt: any) => {
          const activeObject = opt.selected?.[0] || opt.target
          if (activeObject && activeObject.type === 'rect') {
              const index = annotationMapRef.current.get(activeObject as fabric.Rect)
              if (index !== undefined && onAnnotationSelect) {
                  onAnnotationSelect(index)
              }
          }
      }
      
      const handleSelectionCleared = () => {
          if (onAnnotationSelect) {
              onAnnotationSelect(null)
          }
      }
      
      // Handle Delete key
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.key === 'Delete' || e.key === 'Backspace') && mode === 'select') {
              const activeObjects = fabricCanvas.getActiveObjects()
              if (activeObjects.length > 0) {
                  activeObjects.forEach(obj => {
                      if (obj.type === 'rect') {
                          const textObj = textObjectsRef.current.get(obj as fabric.Rect)
                          if (textObj) {
                              fabricCanvas.remove(textObj)
                              textObjectsRef.current.delete(obj as fabric.Rect)
                          }
                          annotationMapRef.current.delete(obj as fabric.Rect)
                          fabricCanvas.remove(obj)
                      }
                  })
                  fabricCanvas.discardActiveObject()
                  updateAnnotations()
              }
          }
      }

      // Remove listeners to avoid duplicates
      fabricCanvas.off('mouse:down', handleMouseDown)
      fabricCanvas.off('mouse:move', handleMouseMove)
      fabricCanvas.off('mouse:up', handleMouseUp)
      fabricCanvas.off('object:modified', handleObjectModified)
      fabricCanvas.off('object:moving', handleObjectModified)
      fabricCanvas.off('object:scaling', handleObjectModified)
      fabricCanvas.off('selection:created', handleSelectionCreated)
      fabricCanvas.off('selection:updated', handleSelectionCreated)
      fabricCanvas.off('selection:cleared', handleSelectionCleared)

      // Add listeners
      fabricCanvas.on('mouse:down', handleMouseDown)
      fabricCanvas.on('mouse:move', handleMouseMove)
      fabricCanvas.on('mouse:up', handleMouseUp)
      fabricCanvas.on('object:modified', handleObjectModified)
      fabricCanvas.on('object:moving', handleObjectModified)
      fabricCanvas.on('object:scaling', handleObjectModified)
      fabricCanvas.on('selection:created', handleSelectionCreated)
      fabricCanvas.on('selection:updated', handleSelectionCreated)
      fabricCanvas.on('selection:cleared', handleSelectionCleared)
      
      window.addEventListener('keydown', handleKeyDown)

      return () => {
          fabricCanvas.off('mouse:down', handleMouseDown)
          fabricCanvas.off('mouse:move', handleMouseMove)
          fabricCanvas.off('mouse:up', handleMouseUp)
          fabricCanvas.off('object:modified', handleObjectModified)
          fabricCanvas.off('object:moving', handleObjectModified)
          fabricCanvas.off('object:scaling', handleObjectModified)
          fabricCanvas.off('selection:created', handleSelectionCreated)
          fabricCanvas.off('selection:updated', handleSelectionCreated)
          fabricCanvas.off('selection:cleared', handleSelectionCleared)
          window.removeEventListener('keydown', handleKeyDown)
      }
  }, [fabricCanvas, mode, fabricImage, onAnnotationsChange, annotations, onAnnotationSelect])

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
