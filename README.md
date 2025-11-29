# AI-Powered Annotation Tool
![Hero](https://placehold.co/1200x600/png?text=AI+Annotation+Tool+Demo)

A modern, production-ready image annotation tool built with **React 18**, **TypeScript**, **Tailwind CSS**, and **OpenAI Vision API**. Designed for generating high-quality OCR training data with AI assistance.

## 🚀 Features

- **AI Auto-Detection**: Automatically detect text regions using OpenAI GPT-4o Vision.
- **Smart Image Enhancement**: Adjust brightness, contrast, and saturation to improve OCR accuracy.
- **Professional Workspace**:
  - Drag & Drop image upload.
  - Pan & Zoom canvas (powered by Fabric.js).
  - Manual annotation tools (Draw, Select, Edit, Delete).
- **Export Ready**: Download annotations in standard JSON format.
- **Responsive Design**: Fully responsive UI built with Shadcn UI and Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React 18, Create React App, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **State Management**: React Query (TanStack Query), React Hooks
- **Canvas Engine**: Fabric.js (v6)
- **AI Integration**: OpenAI API (GPT-4o)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/annotation-tool.git
   cd annotation-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Configuration

To use the AI features, you need an OpenAI API Key.
1. Click the **Settings** icon in the top right corner of the Workspace.
2. Enter your OpenAI API Key.
3. The key is stored securely in your browser's `localStorage`.

## 📄 License

MIT License.
