import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  itemTags: string[];
  anchorRect: DOMRect;
  onUpdateItemTags: (newTags: string[]) => void;
  onAddTag: (newTag: string) => void;
  onDeleteTag: (tagToDelete: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  isOpen,
  onClose,
  allTags,
  itemTags,
  anchorRect,
  onUpdateItemTags,
  onAddTag,
  onDeleteTag,
}) => {
  const [newTag, setNewTag] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999, opacity: 0 });

  useEffect(() => {
    if (isOpen && popoverRef.current && anchorRect) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const margin = 8;
      
      let top = anchorRect.bottom + margin;
      if (top + popoverRect.height > window.innerHeight - margin) {
        top = anchorRect.top - popoverRect.height - margin;
      }

      let left = anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2);
      left = Math.max(margin, Math.min(left, window.innerWidth - popoverRect.width - margin));

      setPosition({ top, left, opacity: 1 });
    }
  }, [isOpen, anchorRect]);

  const handleToggleTag = (tag: string) => {
    const newTags = itemTags.includes(tag)
      ? itemTags.filter(t => t !== tag)
      : [...itemTags, tag];
    onUpdateItemTags(newTags);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && trimmedTag.length <= 10 && !allTags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      handleToggleTag(trimmedTag);
      setNewTag('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={popoverRef}
        style={{ ...position, position: 'fixed', transition: 'opacity 0.1s ease-out' }}
        className="z-50 w-80 bg-slate-800 text-white rounded-xl shadow-2xl border border-slate-700 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-manager-title"
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 id="tag-manager-title" className="font-semibold">管理标签</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">&times;</button>
        </div>
        <div className="p-4 flex-grow max-h-60 overflow-y-auto">
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => {
                const isApplied = itemTags.includes(tag);
                return (
                  <div key={tag} className="flex items-center rounded-full bg-slate-700">
                    <button
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-l-full transition-colors ${
                        isApplied ? 'bg-indigo-600 text-white' : 'hover:bg-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                    <button
                      onClick={() => onDeleteTag(tag)}
                      title={`删除标签 "${tag}"`}
                      className="px-2 py-1 text-slate-400 hover:text-red-400 rounded-r-full hover:bg-slate-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center">还没有标签，请在下方添加。</p>
          )}
        </div>
        <div className="p-4 border-t border-slate-700">
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              maxLength={10}
              placeholder="添加新标签 (最多10个字)"
              className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-sm rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
              disabled={!newTag.trim() || newTag.trim().length > 10}
            >
              添加
            </button>
          </form>
        </div>
      </div>
    </>
  );
};