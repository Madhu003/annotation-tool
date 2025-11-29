import { Slider } from "src/components/ui/slider"
import { Label } from "src/components/ui/label"
import { Button } from "src/components/ui/button"
import { Wand2 } from "lucide-react"

export interface EnhancementSettings {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
}

interface ImageEnhancerProps {
  settings: EnhancementSettings
  onChange: (settings: EnhancementSettings) => void
  onAutoEnhance: () => void
}

export function ImageEnhancer({ settings, onChange, onAutoEnhance }: ImageEnhancerProps) {
  const handleChange = (key: keyof EnhancementSettings, value: number) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Brightness</Label>
          <span className="text-xs text-muted-foreground">{settings.brightness.toFixed(2)}</span>
        </div>
        <Slider
          min={-1}
          max={1}
          step={0.05}
          value={[settings.brightness]}
          onValueChange={([v]) => handleChange("brightness", v)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Contrast</Label>
          <span className="text-xs text-muted-foreground">{settings.contrast.toFixed(2)}</span>
        </div>
        <Slider
          min={-1}
          max={1}
          step={0.05}
          value={[settings.contrast]}
          onValueChange={([v]) => handleChange("contrast", v)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Saturation</Label>
          <span className="text-xs text-muted-foreground">{settings.saturation.toFixed(2)}</span>
        </div>
        <Slider
          min={-1}
          max={1}
          step={0.05}
          value={[settings.saturation]}
          onValueChange={([v]) => handleChange("saturation", v)}
        />
      </div>

      {/* Sharpness might require a specific filter in Fabric or custom implementation */}
       <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Sharpness</Label>
          <span className="text-xs text-muted-foreground">{settings.sharpness.toFixed(2)}</span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={[settings.sharpness]}
          onValueChange={([v]) => handleChange("sharpness", v)}
        />
      </div>

      <Button className="w-full" onClick={onAutoEnhance}>
        <Wand2 className="mr-2 h-4 w-4" /> Auto Enhance
      </Button>
    </div>
  )
}
