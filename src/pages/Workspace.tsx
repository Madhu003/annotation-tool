import { useState } from "react"
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MousePointer2, Square, Trash2, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react"
import { ImageUpload } from "src/components/ImageUpload"
import { AnnotationCanvas } from "src/components/AnnotationCanvas"
import { ImageEnhancer, type EnhancementSettings } from "src/components/ImageEnhancer"
import { SettingsDialog } from "src/components/SettingsDialog"
import { AutoDetectButton } from "src/components/AutoDetectButton"
import type { DetectedBox } from "src/hooks/useOpenAI"

export default function Workspace() {
  const navigate = useNavigate()
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [enhancementSettings, setEnhancementSettings] = useState<EnhancementSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0
  })
  const [annotations, setAnnotations] = useState<DetectedBox[]>([])
  const [mode, setMode] = useState<'select' | 'draw'>('select')
  const [zoom, setZoom] = useState(1)
  const [aspectRatio, setAspectRatio] = useState<number | 'original'>('original')
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number | null>(null)

  const handleUpload = (file: File) => {
    setImage(file)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const handleAutoEnhance = () => {
    setEnhancementSettings({
      brightness: 0.1,
      contrast: 0.1,
      saturation: 0.1,
      sharpness: 0.2
    })
  }

  const handleClearAnnotations = () => {
    if (confirm("Are you sure you want to delete all annotations?")) {
      setAnnotations([])
      setSelectedAnnotationIndex(null)
    }
  }
  
  const handleDeleteAnnotation = (index: number) => {
    const newAnnotations = annotations.filter((_, i) => i !== index)
    setAnnotations(newAnnotations)
    if (selectedAnnotationIndex === index) {
      setSelectedAnnotationIndex(null)
    } else if (selectedAnnotationIndex !== null && selectedAnnotationIndex > index) {
      setSelectedAnnotationIndex(selectedAnnotationIndex - 1)
    }
  }
  
  const handleTextChange = (index: number, text: string) => {
    const newAnnotations = [...annotations]
    newAnnotations[index] = { ...newAnnotations[index], text }
    setAnnotations(newAnnotations)
  }
  
  const handleAnnotationSelect = (index: number | null) => {
    setSelectedAnnotationIndex(index)
  }

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(annotations, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "annotations.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-lg font-semibold">Workspace</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={annotations.length === 0}>
                Export JSON
            </Button>
            <SettingsDialog />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r bg-muted/10 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-semibold">Tools</h2>
              <div className="flex gap-2">
                <Button 
                  variant={mode === 'select' ? "default" : "outline"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setMode('select')}
                >
                  <MousePointer2 className="mr-2 h-4 w-4" /> Select
                </Button>
                <Button 
                  variant={mode === 'draw' ? "default" : "outline"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setMode('draw')}
                >
                  <Square className="mr-2 h-4 w-4" /> Draw
                </Button>
              </div>
              
              <div className="flex items-center justify-between gap-2 p-2 border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(5, z + 0.1))}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setZoom(1)}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Aspect Ratio</label>
                <select 
                    className="w-full p-2 text-sm border rounded-md bg-background"
                    value={aspectRatio === 'original' ? 'original' : aspectRatio}
                    onChange={(e) => {
                        const val = e.target.value
                        setAspectRatio(val === 'original' ? 'original' : parseFloat(val))
                    }}
                >
                    <option value="original">Original</option>
                    <option value="1.777777">16:9</option>
                    <option value="1.333333">4:3</option>
                    <option value="1">1:1</option>
                </select>
              </div>

              <AutoDetectButton imageFile={image} onDetect={setAnnotations} />
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={handleClearAnnotations}
                disabled={annotations.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
              </Button>
            </div>
            <div className="space-y-4">
              <h2 className="font-semibold">Enhancement</h2>
              <ImageEnhancer 
                settings={enhancementSettings} 
                onChange={setEnhancementSettings}
                onAutoEnhance={handleAutoEnhance}
              />
            </div>
          </div>
        </aside>
        <main className="flex-1 bg-muted/20 p-4 relative overflow-hidden flex items-center justify-center">
          {imageUrl ? (
             <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
                <AnnotationCanvas 
                  imageUrl={imageUrl} 
                  enhancementSettings={enhancementSettings}
                  annotations={annotations}
                  onAnnotationsChange={setAnnotations}
                  mode={mode}
                  zoom={zoom}
                  aspectRatio={aspectRatio}
                  selectedAnnotationIndex={selectedAnnotationIndex}
                  onAnnotationSelect={handleAnnotationSelect}
                />
             </div>
          ) : (
            <div className="w-full max-w-xl">
              <ImageUpload onUpload={handleUpload} />
            </div>
          )}
        </main>
        <aside className="w-80 border-l bg-muted/10 p-4 overflow-y-auto">
          <div className="space-y-4">
            <h2 className="font-semibold">Annotations</h2>
            <div className="text-sm text-muted-foreground">
              {annotations.length === 0 ? "No annotations yet" : `${annotations.length} region${annotations.length !== 1 ? 's' : ''} detected`}
            </div>
            
            {selectedAnnotationIndex !== null && annotations[selectedAnnotationIndex] && (
              <div className="space-y-2 p-3 border rounded-md bg-background">
                <Label htmlFor="annotation-text">Edit Label</Label>
                <Input
                  id="annotation-text"
                  value={annotations[selectedAnnotationIndex].text || ''}
                  onChange={(e) => handleTextChange(selectedAnnotationIndex, e.target.value)}
                  placeholder="Enter label text..."
                />
                <div className="text-xs text-muted-foreground">
                  Annotation #{selectedAnnotationIndex + 1}
                </div>
              </div>
            )}
            
            {annotations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">All Annotations</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {annotations.map((annotation, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedAnnotationIndex === index
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background hover:bg-muted/50'
                      }`}
                      onClick={() => handleAnnotationSelect(index)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Annotation #{index + 1}
                          </div>
                          <div className="text-sm">
                            {annotation.text ? (
                              <span className="font-medium">{annotation.text}</span>
                            ) : (
                              <span className="text-muted-foreground italic">No label</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round(annotation.x1)}%, {Math.round(annotation.y1)}% → {Math.round(annotation.x2)}%, {Math.round(annotation.y2)}%
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnnotation(index)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
