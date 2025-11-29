import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { useNavigate } from "react-router-dom"
import { Plus, History } from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Annotation Tool AI</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered image annotation for OCR training.
            </p>
          </div>
          <Button onClick={() => navigate("/workspace")}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/workspace")}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                New Annotation
              </CardTitle>
              <CardDescription>
                Upload an image and start annotating with AI assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                Click to start
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Recent Projects
              </CardTitle>
              <CardDescription>
                Your recently worked on images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent projects found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
