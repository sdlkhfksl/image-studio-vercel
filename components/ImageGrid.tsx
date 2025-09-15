

import React from 'react';
import { GeneratedImage } from '../types';
import { ImageCard } from './ImageCard';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageClick: (index: number) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (index: number) => void;
  videoUrls?: (string | null)[];
  videoGenerationProgress?: { current: number; total: number } | null;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick, onToggleFavorite, onEdit, videoUrls, videoGenerationProgress }) => {
  // If there is only one image, display it centered to provide a better layout
  // when the AI returns fewer images than expected.
  if (images.length === 1) {
    const isVideoLoading = videoGenerationProgress?.total === 1 && videoGenerationProgress?.current === 0;
    return (
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
          <ImageCard 
            image={images[0]} 
            index={0} 
            onImageClick={onImageClick} 
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            videoUrl={videoUrls?.[0]}
            isLoading={isVideoLoading}
            progressText={isVideoLoading ? `1/1` : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
      {images.map((image, index) => {
        const isVideoLoading = videoGenerationProgress?.current === index;
        return (
          <ImageCard 
            key={image.id} 
            image={image} 
            index={index} 
            onImageClick={onImageClick}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            videoUrl={videoUrls?.[index]}
            isLoading={isVideoLoading}
            progressText={isVideoLoading ? `${videoGenerationProgress!.current + 1}/${videoGenerationProgress!.total}` : undefined}
          />
        )
      })}
    </div>
  );
};
