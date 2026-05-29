"use client";
import { useState, useRef } from 'react';
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

interface AIPhotoCropperProps {
  onPhotoSelect: (file: File) => void;
  uploadCount: number;
}

export default function AIPhotoCropper({ onPhotoSelect, uploadCount }: AIPhotoCropperProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadCount >= 75) {
      alert('⚠️ আপনি ৭৫টি ছবি আপলোড করেছেন!\n\nসর্বোচ্চ ৮০টি ছবি আপলোড করা যাবে।\n\nYou have uploaded 75 photos! Maximum 80 photos allowed.');
    }

    if (uploadCount >= 80) {
      alert('❌ সর্বোচ্চ সীমা পৌঁছেছে!\n\n৮০টি ছবির বেশি আপলোড করা যাবে না।\n\nMaximum limit reached! Cannot upload more than 80 photos.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setSelectedImage(imageUrl);
      setCroppedImage('');
      detectAndCropFace(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const detectAndCropFace = async (imageUrl: string) => {
    setIsProcessing(true);

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE"
      });

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = async () => {
        const detections = faceDetector.detect(img);
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 500;
        canvas.height = 500;

        if (detections.detections.length > 0) {
          const detection = detections.detections[0];
          const face = detection.boundingBox;
          
          if (face) {
            // BoundingBox has: originX, originY, width, height
            const padding = 0.3;
            const paddedWidth = face.width * (1 + padding);
            const paddedHeight = face.height * (1 + padding);
            
            const x = Math.max(0, face.originX - (paddedWidth - face.width) / 2);
            const y = Math.max(0, face.originY - (paddedHeight - face.height) / 2);
            
            const cropWidth = Math.min(paddedWidth, img.width - x);
            const cropHeight = Math.min(paddedHeight, img.height - y);
            
            const size = Math.min(cropWidth, cropHeight);
            
            ctx.drawImage(
              img,
              x, y, size, size,
              0, 0, 500, 500
            );
          } else {
            // No face - center crop
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            
            ctx.drawImage(
              img,
              x, y, size, size,
              0, 0, 500, 500
            );
          }
        } else {
          // No face detected - center crop
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          
          ctx.drawImage(
            img,
            x, y, size, size,
            0, 0, 500, 500
          );
        }

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCroppedImage(croppedDataUrl);
        setIsProcessing(false);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
            onPhotoSelect(file);
          }
        }, 'image/jpeg', 0.9);
      };

      img.src = imageUrl;
    } catch (error) {
      console.error('Face detection error:', error);
      setIsProcessing(false);
      alert('Face detection failed. Please try another photo.');
    }
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      {!selectedImage ? (
        <label className="block cursor-pointer">
          <div className="border-4 border-dashed border-rose-300 rounded-2xl p-8 text-center hover:border-rose-500 transition bg-white">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              ছবি আপলোড করুন / Upload Photo
            </p>
            <p className="text-sm text-gray-500 mb-2">
              AI automatically crops to your face
            </p>
            <p className="text-xs text-orange-600 font-bold">
              {uploadCount}/80 photos uploaded
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          {isProcessing ? (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-lg font-bold text-blue-900">
                AI detecting face and cropping...
              </p>
            </div>
          ) : croppedImage ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
              <p className="text-sm font-bold text-green-900 mb-4 text-center">
                ✅ Photo ready! (500x500)
              </p>
              <img 
                src={croppedImage} 
                alt="Cropped preview" 
                className="w-64 h-64 mx-auto rounded-xl shadow-lg object-cover"
              />
              <div className="flex gap-3 mt-4">
                <label className="flex-1 cursor-pointer">
                  <div className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold text-center hover:bg-gray-200 transition">
                    Choose Different Photo
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}