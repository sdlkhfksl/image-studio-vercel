
import React, { useState, useEffect, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  onPreviewClick?: (index: number) => void;
}

const MAX_FILES_DEFAULT = 5;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_FORMATS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};
const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_FORMATS);

interface FilePreview {
  id: string;
  url: string;
  name: string;
  size: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange, disabled = false, maxFiles = MAX_FILES_DEFAULT, onPreviewClick }) => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the files prop changes, create new preview URLs
    const newPreviews = files.map(file => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    
    setPreviews(newPreviews);

    // Cleanup blob URLs when the component unmounts or files change
    return () => {
      newPreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const processFiles = (newFiles: FileList | File[]) => {
    setError(null);
    const fileList = Array.from(newFiles);
    
    if (files.length + fileList.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 张图片。`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of fileList) {
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        setError(`不支持的文件格式: ${file.name}`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`文件大小不能超过 ${MAX_SIZE_MB}MB: ${file.name}`);
        return;
      }
      validFiles.push(file);
    }
    
    const updatedFiles = maxFiles === 1 ? validFiles.slice(0, 1) : [...files, ...validFiles];
    onFilesChange(updatedFiles);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const removeFile = (idToRemove: string) => {
    const fileIndex = previews.findIndex(p => p.id === idToRemove);
    if (fileIndex === -1) return;

    const newFiles = files.filter((_, index) => index !== fileIndex);
    onFilesChange(newFiles);
  };
  
  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full p-4 transition-colors duration-200 rounded-xl border-2 border-dashed
        ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}
        ${isDragActive ? 'border-indigo-500 bg-indigo-100' : 'border-slate-300'}`}
      >
        <input
            ref={inputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={ACCEPTED_MIME_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
            aria-label="File uploader"
        />
        {previews.length === 0 ? (
            <div 
                onClick={() => !disabled && inputRef.current?.click()}
                className="flex flex-col items-center justify-center text-slate-500 text-center py-8 cursor-pointer"
                role="button"
                tabIndex={0}
            >
                <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                <p className="font-semibold">点击或拖拽图片到这里上传</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
                <div 
                    key={preview.id} 
                    className={`relative group aspect-square bg-slate-100 rounded-lg overflow-hidden shadow-sm ${onPreviewClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onPreviewClick?.(index)}
                    role={onPreviewClick ? "button" : undefined}
                    tabIndex={onPreviewClick ? 0 : undefined}
                    onKeyDown={(e) => onPreviewClick && (e.key === 'Enter' || e.key === ' ') && onPreviewClick(index)}
                    aria-label={onPreviewClick ? `Preview uploaded image ${preview.name}` : undefined}
                >
                    <img src={preview.url} alt={`Preview of ${preview.name}`} className="w-full h-full object-cover"/>
                    {!disabled && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile(preview.id);
                            }}
                            className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5
                                    opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            aria-label={`Remove ${preview.name}`}
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate">
                        {preview.name}
                    </div>
                </div>
            ))}
            {files.length < maxFiles && !disabled && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    className="flex flex-col items-center justify-center aspect-square bg-transparent border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 hover:border-slate-400 transition-colors"
                    aria-label="Add more images"
                >
                    <PlusIcon className="w-8 h-8 mb-1" />
                    <span className="text-sm font-semibold">添加图片</span>
                </button>
            )}
            </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600 text-center" role="alert">{error}</p>}
      
      <p className="text-xs text-slate-500 mt-2 text-center">
        支持 JPG, PNG, GIF, WEBP (最多 {maxFiles} 张, 每张不超过 {MAX_SIZE_MB}MB)
      </p>
    </div>
  );
};