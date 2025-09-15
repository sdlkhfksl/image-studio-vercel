

import React from 'react';
import { GeneratedImage } from '../types';
import { StarIcon } from './icons/StarIcon';
import { VideoPlayIcon } from './icons/VideoPlayIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { RedoIcon } from './icons/RedoIcon';

interface ImageCardProps {
  image: GeneratedImage;
  index: number;
  onImageClick: (index: number) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (index: number) => void;
  videoUrl?: string | null;
  isLoading?: boolean;
  progressText?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, index, onImageClick, onToggleFavorite, onEdit, videoUrl, isLoading, progressText }) => {
  const showLoading = isLoading;
  
  return (
    <div
      className="group relative aspect-video w-full bg-slate-200 rounded-2xl shadow-md overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer"
      onClick={() => onImageClick(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onImageClick(index)}
      aria-label={`View image ${image.id} in full screen`}
    >
      <img
        src={image.src}
        alt={`Generated card ${image.id}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
      
      {videoUrl && !showLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 transition-transform group-hover:scale-110">
            <VideoPlayIcon className="w-10 h-10 text-white" />
          </div>
        </div>
      )}

      {showLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-solid border-white border-r-transparent"></div>
              {isLoading && progressText && <p className="mt-2 text-sm font-semibold">生成中... {progressText}</p>}
          </div>
      )}
      
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index);
            }}
            title={'编辑画板'}
            className={'p-2 rounded-full backdrop-blur-md transition-colors bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50'}
            aria-label={'Edit this panel'}
          >
            <SparklesIcon className="w-5 h-5" />
          </button>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(image.id);
            }}
            title={image.isFavorite ? '取消收藏' : '收藏'}
            className={`p-2 rounded-full backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
              image.isFavorite
                ? 'bg-amber-400/80 text-white hover:bg-amber-500/80'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            aria-label={image.isFavorite ? 'Unfavorite this image' : 'Favorite this image'}
          >
            <StarIcon filled={!!image.isFavorite} className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
