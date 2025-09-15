
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { GeneratedImage } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { SwitchHorizontalIcon } from './icons/SwitchHorizontalIcon';

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}

interface ImagePreviewProps {
  images: GeneratedImage[] | null;
  currentIndex: number | null;
  onClose: () => void;
  onChange: (newIndex: number) => void;
  actions?: ActionButton[];
  sourceImageSrc?: string;
  isComparing?: boolean;
  onToggleCompare?: () => void;
  videoUrl?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, currentIndex, onClose, onChange, actions = [], sourceImageSrc, isComparing, onToggleCompare, videoUrl }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(currentIndex);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (currentIndex !== null) {
      // Prop has a value (opening or changing image), update the state.
      setActiveImageIndex(currentIndex);
      setIsExiting(false);
    } else if (activeImageIndex !== null) {
      // Prop is null (closing). Start exit animation.
      setIsExiting(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, activeImageIndex]);

  const handleClose = () => {
    onClose();
  };
  
  const handleAnimationEnd = () => {
    // When fade out animation ends, set index to null to unmount the component
    if (isExiting && currentIndex === null) {
      setActiveImageIndex(null);
      setIsExiting(false);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (currentIndex === null || !images) return;

    if (event.key === 'Escape') {
      onClose();
    }
    if (event.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        onChange(currentIndex - 1);
      }
    }
    if (event.key === 'ArrowRight') {
      if (currentIndex < images.length - 1) {
        onChange(currentIndex + 1);
      }
    }
  }, [currentIndex, images, onClose, onChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Use the current prop index if available, otherwise fallback to the
  // state index. This allows for the exit animation to complete while
  // instantly showing the image on open, fixing the flicker.
  const indexToRender = currentIndex ?? activeImageIndex;

  if (indexToRender === null || !images || !images[indexToRender]) {
    return null;
  }

  const currentImage = images[indexToRender];
  const canGoLeft = indexToRender > 0;
  const canGoRight = indexToRender < images.length - 1;
  const isClosing = isExiting && currentIndex === null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-4xl leading-none font-bold hover:text-gray-300 transition-colors z-20"
        aria-label="Close preview"
      >
        &times;
      </button>

      {/* Navigation - Left */}
      {canGoLeft && !isClosing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(indexToRender - 1);
          }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/30 text-white rounded-full backdrop-blur-md hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 z-20"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Image and actions container */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {videoUrl ? (
             <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                loop
                className="max-w-[85vw] max-h-[90vh] object-contain rounded-lg shadow-2xl bg-black"
                aria-label={`Video preview for ${currentImage.id}`}
             />
        ) : (
            <img
            src={isComparing && sourceImageSrc ? sourceImageSrc : currentImage.src}
            alt={`Enlarged view of ${currentImage.id}`}
            className="max-w-[85vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
        )}
       
        {onToggleCompare && sourceImageSrc && !isClosing && !videoUrl && (
            <button
                onClick={onToggleCompare}
                title={isComparing ? "显示生成图" : "对比原图"}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 z-30 ${
                    isComparing ? 'bg-indigo-500/80 text-white' : 'bg-black/30 text-white'
                }`}
                aria-label={isComparing ? "Show generated image" : "Compare with original image"}
            >
                <SwitchHorizontalIcon className="w-6 h-6" />
            </button>
        )}
        {actions.length > 0 && !isClosing && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={() => action.onClick()}
                    title={action.label}
                    className={`p-3 rounded-full backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                        action.isActive
                        ? 'bg-amber-400/80 text-white hover:bg-amber-500/80'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                    aria-label={action.label}
                >
                    {action.icon}
                </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation - Right */}
      {canGoRight && !isClosing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(indexToRender + 1);
          }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/30 text-white rounded-full backdrop-blur-md hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 z-20"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};