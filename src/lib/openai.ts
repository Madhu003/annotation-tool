import OpenAI from "openai"

export const getOpenAIClient = () => {
    const apiKey = localStorage.getItem("openai_api_key")
    if (!apiKey) {
        throw new Error("OpenAI API Key not found. Please set it in settings.")
    }
    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    })
}

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
}
