"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver"; // Install with: npm install file-saver
import { UploadedImage } from "./new-proptery-form";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: UploadedImage[];
  initialIndex?: number;
}

export default function ImageModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomLevel(1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex].url);
      const blob = await response.blob();
      saveAs(
        blob,
        images[currentIndex].name || `property-image-${currentIndex + 1}.jpg`
      );
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
            onClick={goToNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Image Counter */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            transform: `scale(${zoomLevel})`,
            transition: "transform 0.2s ease",
            maxWidth: "90%",
            maxHeight: "90%",
          }}
        >
          <img
            src={images[currentIndex].url}
            alt={
              images[currentIndex].name || `Property image ${currentIndex + 1}`
            }
            className="max-w-full max-h-[80vh] object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-4 py-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>

          <span className="text-white text-sm w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/30" />

        {/* Download Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 gap-2"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        {/* Image Info */}
        <div className="text-white text-sm px-4">
          {images[currentIndex].name || `Image ${currentIndex + 1}`}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center">
          <div className="flex gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full overflow-x-auto max-w-[80%]">
            {images.map((image, index) => (
              <button
                key={index}
                className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-white ring-2 ring-white/30"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-white/50"
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoomLevel(1);
                }}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
