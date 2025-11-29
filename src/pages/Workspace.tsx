import { useState } from "react"
import { Button } from "src/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MousePointer2, Square, Trash2 } from "lucide-react"
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
    }
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
             <div className="relative h-full w-full overflow-hidden">
                <AnnotationCanvas 
                  imageUrl={imageUrl} 
                  enhancementSettings={enhancementSettings}
                  annotations={annotations}
                  onAnnotationsChange={setAnnotations}
                  mode={mode}
                />
             </div>
          ) : (
            <div className="w-full max-w-xl">
              <ImageUpload onUpload={handleUpload} />
            </div>
          )}
        </main>
        <aside className="w-80 border-l bg-muted/10 p-4">
          <div className="space-y-4">
            <h2 className="font-semibold">Annotations</h2>
            <div className="text-sm text-muted-foreground">
              {annotations.length === 0 ? "No annotations yet" : `${annotations.length} regions detected`}
            </div>
            {/* List of annotations could go here */}
          </div>
        </aside>
      </div>
    </div>
  )
}
