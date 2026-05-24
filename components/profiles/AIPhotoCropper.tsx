"use client";
import { useState, useRef } from "react";

interface AIPhotoCropperProps {
  onPhotoCropped?: (croppedImageBase64: string) => void;
}

export default function AIPhotoCropper({ onPhotoCropped }: AIPhotoCropperProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;
      setOriginalImage(base64Image);
      setError(null);
      
      await processImageWithAI(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const processImageWithAI = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const base64Data = imageData.split(',')[1];
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: `Analyze this image and detect the main face for a passport-style photo crop.
Return ONLY a JSON object with this exact format:
{
  "centerX": 0.5,
  "centerY": 0.3,
  "scale": 2.5
}
Where:
- centerX/centerY are the face center as fractions (0-1) of image width/height
- scale is how much to zoom (1.0 = no zoom, 2.0 = 2x zoom for close-up)
- For passport photos, aim for scale 2.5-4.0 to get a close headshot

Return ONLY the JSON, no other text.`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text;
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }
      
      const cropData = JSON.parse(jsonMatch[0]);
      await cropImage(imageData, cropData);
      
    } catch (err) {
      console.error('AI processing error:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cropImage = async (imageData: string, cropData: { centerX: number; centerY: number; scale: number }) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const targetWidth = 600;
        const targetHeight = 800;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const { centerX, centerY, scale } = cropData;
        
        const sourceWidth = img.width / scale;
        const sourceHeight = img.height / scale;
        
        const sourceX = Math.max(0, Math.min(img.width - sourceWidth, centerX * img.width - sourceWidth / 2));
        const sourceY = Math.max(0, Math.min(img.height - sourceHeight, centerY * img.height - sourceHeight / 2));
        
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );
        
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCroppedImage(croppedDataUrl);
        
        if (onPhotoCropped) {
          onPhotoCropped(croppedDataUrl);
        }
        
        resolve();
      };
      img.src = imageData;
    });
  };

  const handleReset = () => {
    setOriginalImage(null);
    setCroppedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      {isProcessing && (
        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-sm font-bold text-gray-700">🤖 AI is analyzing your photo...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {originalImage && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Original</p>
            <img src={originalImage} alt="Original" className="w-full rounded-xl border-2 border-gray-200" />
          </div>
        )}
        
        {croppedImage && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">AI Cropped (Passport Style)</p>
            <img src={croppedImage} alt="Cropped" className="w-full rounded-xl border-2 border-green-400" />
          </div>
        )}
      </div>

      {croppedImage && (
        <button
          onClick={handleReset}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
        >
          🔄 Upload Different Photo
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}