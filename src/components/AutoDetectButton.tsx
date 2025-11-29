import { Loader2, ScanSearch } from "lucide-react"
import { Button } from "src/components/ui/button"
import { useAutoDetect, type DetectedBox } from "src/hooks/useOpenAI"

interface AutoDetectButtonProps {
  imageFile: File | null
  onDetect: (boxes: DetectedBox[]) => void
}

export function AutoDetectButton({ imageFile, onDetect }: AutoDetectButtonProps) {
  const { mutate: detect, isPending } = useAutoDetect()

  const handleClick = () => {
    if (!imageFile) return

    detect(imageFile, {
      onSuccess: (data: DetectedBox[]) => {
        onDetect(data)
      },
      onError: (error: Error) => {
        console.error(error)
        alert("Failed to detect text: " + error.message)
      }
    })
  }

  return (
    <Button 
      onClick={handleClick} 
      disabled={!imageFile || isPending}
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ScanSearch className="mr-2 h-4 w-4" />
      )}
      {isPending ? "Detecting..." : "Auto-Detect Text"}
    </Button>
  )
}
