// components/profiles/AIPhotoCropper.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

interface AIPhotoCropperProps {
  onPhotoSelect: (file: File, croppedDataUrl: string) => void;
  uploadCount: number;
}

export default function AIPhotoCropper({ onPhotoSelect, uploadCount }: AIPhotoCropperProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize MediaPipe Face Detector
  useEffect(() => {
    const initializeFaceDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "IMAGE"
        });
        
        setFaceDetector(detector);
      } catch (error) {
        console.error("Failed to initialize face detector:", error);
      }
    };

    initializeFaceDetector();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if approaching 80 photo limit
    if (uploadCount >= 80) {
      alert('⚠️ আপনি ৮০টি ছবি আপলোড করেছেন! আর আপলোড করতে পারবেন না।\n(You have reached the 80 photo limit!)');
      return;
    }

    if (uploadCount >= 75) {
      alert(`⚠️ সতর্কতা: আপনি ${uploadCount}/80 ছবি আপলোড করেছেন!\n(Warning: You have uploaded ${uploadCount}/80 photos!)`);
    }

    setOriginalFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string;
      setSelectedImage(imageDataUrl);

      // Detect face and auto-crop
      await detectAndCropFace(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const detectAndCropFace = async (imageDataUrl: string) => {
    if (!faceDetector || !canvasRef.current || !imageRef.current) {
      // Fallback to center crop if face detection unavailable
      performCenterCrop(imageDataUrl);
      return;
    }

    try {
      const img = new Image();
      img.onload = async () => {
        imageRef.current!.src = img.src;
        
        // Detect faces
        const detections = faceDetector.detect(img);
        
        if (detections.detections.length > 0) {
          // Use first detected face
          const face = detections.detections[0].boundingBox;
          
          // Add padding around face (30% extra)
          const padding = 0.3;
          const paddedWidth = face.width * (1 + padding);
          const paddedHeight = face.height * (1 + padding);
          
          // Center the padded area on the face
          const x = Math.max(0, face.originX - (paddedWidth - face.width) / 2);
          const y = Math.max(0, face.originY - (paddedHeight - face.height) / 2);
          
          // Make it square (use larger dimension)
          const size = Math.max(paddedWidth, paddedHeight);
          
          // Adjust to keep within image bounds
          const adjustedX = Math.min(x, img.width - size);
          const adjustedY = Math.min(y, img.height - size);
          const adjustedSize = Math.min(size, img.width - adjustedX, img.height - adjustedY);
          
          setCropArea({
            x: adjustedX,
            y: adjustedY,
            width: adjustedSize,
            height: adjustedSize
          });
          
          performCrop(img, adjustedX, adjustedY, adjustedSize, adjustedSize);
        } else {
          // No face detected, use center crop
          performCenterCrop(imageDataUrl);
        }
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error("Face detection error:", error);
      performCenterCrop(imageDataUrl);
    } finally {
      setIsProcessing(false);
    }
  };

  const performCenterCrop = (imageDataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      setCropArea({ x, y, width: size, height: size });
      performCrop(img, x, y, size, size);
      setIsProcessing(false);
    };
    img.src = imageDataUrl;
  };

  const performCrop = (img: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to 500x500 for profile photo
    canvas.width = 500;
    canvas.height = 500;

    // Draw cropped area
    ctx.drawImage(
      img,
      x, y, width, height,
      0, 0, 500, 500
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCroppedImage(croppedDataUrl);
  };

  const handleConfirm = () => {
    if (croppedImage && originalFile) {
      // Convert data URL to File
      fetch(croppedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], originalFile.name, { type: 'image/jpeg' });
          onPhotoSelect(file, croppedImage);
          
          // Reset
          setSelectedImage(null);
          setCroppedImage(null);
          setOriginalFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        });
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setCroppedImage(null);
    setOriginalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />
      <img ref={imageRef} className="hidden" alt="" />
      
      {!selectedImage ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-rose-300 rounded-lg cursor-pointer hover:border-rose-400 bg-rose-50/50"
          >
            <div className="text-center p-4">
              <svg className="w-12 h-12 mx-auto mb-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-lg font-semibold text-gray-700 mb-2">ছবি আপলোড করুন</p>
              <p className="text-sm text-gray-500">AI স্বয়ংক্রিয়ভাবে আপনার মুখ সনাক্ত করবে</p>
              {uploadCount > 0 && (
                <p className="text-xs text-rose-600 mt-2">
                  আপলোড হয়েছে: {uploadCount}/80
                </p>
              )}
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
              <p className="text-gray-600">মুখ সনাক্ত করা হচ্ছে...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-gray-700">মূল ছবি</p>
                  <img src={selectedImage} alt="Original" className="w-full rounded-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-gray-700">প্রোফাইল ছবি (500x500)</p>
                  {croppedImage && (
                    <img src={croppedImage} alt="Cropped" className="w-full rounded-lg border-2 border-rose-300" />
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  আবার তুলুন
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}