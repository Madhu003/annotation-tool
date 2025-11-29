import { useMutation } from "@tanstack/react-query"
import { getOpenAIClient, fileToBase64 } from "src/lib/openai"

export interface DetectedBox {
    x1: number
    y1: number
    x2: number
    y2: number
    confidence: number
    text?: string
}

export function useAutoDetect() {
    return useMutation({
        mutationFn: async (imageFile: File) => {
            const openai = getOpenAIClient()
            const base64Image = await fileToBase64(imageFile)

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this image and return ONLY bounding boxes for all text regions. 
Format: JSON array of rectangles with x1,y1,x2,y2 coordinates (0-100% of image width/height).
Include confidence score (0-1) for each box.
Example: [{"x1":10,"y1":15,"x2":85,"y2":25,"confidence":0.95}]
Return ONLY the JSON array, no markdown formatting.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 1000,
            })

            const content = response.choices[0].message.content
            if (!content) throw new Error("No content returned from OpenAI")

            try {
                // Clean up markdown code blocks if present
                const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim()
                return JSON.parse(cleanContent) as DetectedBox[]
            } catch (e) {
                console.error("Failed to parse OpenAI response", content)
                throw new Error("Failed to parse detected text regions")
            }
        },
    })
}
