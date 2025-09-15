// components/History.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { HistoryRecord, AppMode, ImageStyle } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { StarIcon } from './icons/StarIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TagIcon } from './icons/TagIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CollectionIcon } from './icons/CollectionIcon';


interface HistoryProps {
  history: HistoryRecord[];
  onSelect: (item: HistoryRecord) => void;
  onClear: () => void;
  onRemove: (id: string, isGroup?: boolean) => void;
  onToggleFavorite: (id: string) => void;
  selectedId: string | null;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTagManager: (id: string, anchor: DOMRect) => void;
}

const modeMap: Record<AppMode, { icon: string; label: string, className: string }> = {
    'wiki': { icon: '💡', label: '图解百科', className: 'bg-indigo-200 text-indigo-700' },
    'comicStrip': { icon: '📖', label: '连环画本', className: 'bg-orange-200 text-orange-700' },
    'infiniteCanvas': { icon: '🌌', label: '无限画布', className: 'bg-yellow-200 text-yellow-700' },
    'textToImage': { icon: '✨', label: '以文生图', className: 'bg-teal-200 text-teal-700' },
    'imageToImage': { icon: '🖼️', label: '以图生图', className: 'bg-purple-200 text-purple-700' },
    'video': { icon: '🎬', label: '图生视频', className: 'bg-sky-200 text-sky-700' },
};

const ModeDisplay: React.FC<{ item: HistoryRecord; isGroupHeader?: boolean }> = ({ item, isGroupHeader = false }) => {
    const { mode, style, i2iMode } = item;
    
    const styleMap: Record<string, string> = {
        [ImageStyle.ILLUSTRATION]: '插画风',
        [ImageStyle.CLAY]: '粘土风',
        [ImageStyle.DOODLE]: '涂鸦风',
        [ImageStyle.CARTOON]: '卡通风',
        [ImageStyle.INK_WASH]: '水墨风',
        [ImageStyle.AMERICAN_COMIC]: '美漫风',
        [ImageStyle.WATERCOLOR]: '水彩风',
        [ImageStyle.PHOTOREALISTIC]: '写实风',
        [ImageStyle.JAPANESE_MANGA]: '日漫风',
        [ImageStyle.THREE_D_ANIMATION]: '3D动画风',
    };

    const i2iModeMap: Record<'edit' | 'inspiration', string> = {
        'edit': '编辑创作',
        'inspiration': '灵感启发',
    };

    const modeInfo = modeMap[mode];

    return (
        <>
            {modeInfo && (
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${modeInfo.className}`}>
                    {modeInfo.icon}
                    <span>{modeInfo.label}</span>
                </span>
            )}
            {item.comicStripType === 'video' && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-sky-200 text-sky-700">
                    🎬
                    <span>故事视频</span>
                </span>
            )}
            {!isGroupHeader && (
                <>
                    {/* Wiki or ComicStrip Style sub-label */}
                    {(mode === 'wiki' || (mode === 'comicStrip' && item.comicStripType === 'images')) && style && styleMap[style] && (
                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full">
                            {styleMap[style]}
                        </span>
                    )}
                    {/* ImageToImage sub-label */}
                    {mode === 'imageToImage' && i2iMode && i2iModeMap[i2iMode] && (
                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full">
                            {i2iModeMap[i2iMode]}
                        </span>
                    )}
                </>
            )}
        </>
    );
};

interface HistoryItemProps {
  item: HistoryRecord;
  isActive: boolean;
  isChild?: boolean;
  onSelect: (item: HistoryRecord) => void;
  onRemove: (id: string, isGroup?: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onOpenTagManager: (id: string, anchor: DOMRect) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, isActive, isChild = false, onSelect, onRemove, onToggleFavorite, onOpenTagManager }) => {
  const isFavorite = item.images?.some(img => img.isFavorite);
  return (
    <div
      className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
        isChild ? 'ml-0 sm:ml-10' : ''
      } ${
        isActive
          ? 'bg-indigo-50 border-indigo-300 shadow-md ring-2 ring-indigo-200'
          : 'bg-white border-slate-200'
      } ${!isActive ? 'hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm cursor-pointer' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => !isActive && onSelect(item)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isActive && onSelect(item)}
      aria-label={`View history for prompt: ${item.prompt}`}
    >
      <div className="w-24 h-16 bg-slate-200 rounded-md overflow-hidden flex-shrink-0 border border-slate-200" onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
        <img
          src={item.thumbnail}
          alt={`Preview for ${item.prompt}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-slate-800 truncate" title={item.prompt}>{item.prompt.length > 20 ? `${item.prompt.substring(0, 20)}...` : item.prompt}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
           <ModeDisplay item={item} />
           {item.tags?.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  <TagIcon className="w-3 h-3" />
                  <span>{tag}</span>
              </span>
           ))}
           <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center self-start sm:self-center ml-auto sm:ml-2">
          <button
              onClick={(e) => {
                  e.stopPropagation();
                  onOpenTagManager(item.id, e.currentTarget.getBoundingClientRect());
              }}
              className="p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
              aria-label={`管理标签: ${item.prompt}`}
              title="管理标签"
          >
            <TagIcon className="w-5 h-5" />
          </button>
          <button
              onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
              }}
              className={`p-2 rounded-full transition-all duration-200 ${
                  isFavorite
                  ? 'text-amber-400 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-amber-100'
              }`}
              aria-label={isFavorite ? `取消收藏: ${item.prompt}` : `收藏: ${item.prompt}`}
              title={isFavorite ? '取消收藏' : '收藏'}
          >
              <StarIcon filled={!!isFavorite} className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
                e.stopPropagation();
                if (isFavorite) {
                    if (window.confirm('该记录已收藏，您确定要删除吗？')) {
                        onRemove(item.id);
                    }
                } else {
                    onRemove(item.id);
                }
            }}
            className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            aria-label={`删除历史记录: ${item.prompt}`}
            title="删除"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};

const FilterButton: React.FC<{
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            isActive
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
        }`}
    >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
    </button>
);


export const History: React.FC<HistoryProps> = ({ 
    history, 
    onSelect, 
    onClear, 
    onRemove, 
    onToggleFavorite,
    selectedId,
    isLoading,
    searchQuery,
    onSearchChange,
    onOpenTagManager,
}) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeModeFilter, setActiveModeFilter] = useState<AppMode | 'all'>('all');

  useEffect(() => {
    setVisibleCount(10);
  }, [activeModeFilter, searchQuery]);

  const { visibleItems, totalFilteredCount } = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();

    const modeFilteredHistory = history.filter(item => 
        activeModeFilter === 'all' || item.mode === activeModeFilter
    );

    const groups: Record<string, HistoryRecord[]> = {};
    const childIds = new Set<string>();
    for (const item of modeFilteredHistory) {
        if (item.parentId) {
            if (!groups[item.parentId]) {
                groups[item.parentId] = [];
            }
            groups[item.parentId].push(item);
            childIds.add(item.id);
        }
    }

    const itemMatches = (i: HistoryRecord, query: string): boolean => {
        if (!query) return true;
        const promptMatch = i.prompt.toLowerCase().includes(query);
        const tagMatch = i.tags?.some(tag => tag.toLowerCase().includes(query));
        return promptMatch || tagMatch;
    };

    const searchFilteredItems: (HistoryRecord | {isGroup: true, parent: HistoryRecord, children: HistoryRecord[]})[] = [];
    
    for (const item of modeFilteredHistory) {
        if (childIds.has(item.id)) continue;

        const children = groups[item.id] || [];
        const groupMatchesQuery = itemMatches(item, lowercasedQuery) || children.some(c => itemMatches(c, lowercasedQuery));

        if (groupMatchesQuery) {
            if (children.length > 0) {
                searchFilteredItems.push({ isGroup: true, parent: item, children });
            } else {
                searchFilteredItems.push(item);
            }
        }
    }

    return {
      visibleItems: searchFilteredItems.slice(0, visibleCount),
      totalFilteredCount: searchFilteredItems.length
    };
  }, [history, searchQuery, visibleCount, activeModeFilter]);
  
  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const modeFilterOptions: {value: AppMode | 'all', label: string, icon?: string}[] = [
    { value: 'all', label: '全部' },
    ...Object.entries(modeMap).map(([key, {label, icon}]) => ({ value: key as AppMode, label, icon })),
  ];

  return (
    <section className="bg-slate-100 border-t border-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-700">生成历史</h2>
          <div className="w-full sm:w-auto flex items-center gap-4">
             <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="搜索提示词或标签..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
            <button
              onClick={onClear}
              disabled={isLoading}
              className="text-sm font-medium text-slate-500 hover:text-red-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline disabled:hover:text-slate-500 flex-shrink-0"
              aria-label="Clear all generation history"
            >
              清空历史
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 p-2 bg-slate-200/80 rounded-full">
            {modeFilterOptions.map(opt => (
                <FilterButton 
                    key={opt.value}
                    label={opt.label}
                    icon={opt.icon}
                    isActive={activeModeFilter === opt.value}
                    onClick={() => setActiveModeFilter(opt.value)}
                />
            ))}
        </div>

        <div className={`space-y-4 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          {visibleItems.map((itemOrGroup) => {
            if ('isGroup' in itemOrGroup) {
                const { parent, children } = itemOrGroup;
                const isExpanded = !!expandedGroups[parent.id];
                const allItemsInGroup = [parent, ...children];
                const latestTimestamp = Math.max(...allItemsInGroup.map(item => item.timestamp));
                const groupThumbnail = parent.sourceImage || parent.thumbnail;
                
                return (
                    <div key={parent.id} className="bg-white rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                        <div
                            className={`group flex items-center gap-4 p-4 cursor-pointer`}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleGroup(parent.id)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleGroup(parent.id)}
                        >
                            <div className="w-24 h-16 bg-slate-200 rounded-md overflow-hidden flex-shrink-0 border border-slate-200">
                                <img src={groupThumbnail} alt="Source" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-slate-800 flex items-center gap-2">
                                    <CollectionIcon className="w-5 h-5 text-indigo-500" />
                                    <span>创作系列 ({allItemsInGroup.length} 个)</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                   <ModeDisplay item={parent} isGroupHeader={true} />
                                   <span className="text-xs text-slate-400">{new Date(latestTimestamp).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center ml-auto">
                                <span className="text-sm text-slate-500 mr-2">{isExpanded ? '收起' : '展开'}</span>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const isGroupFavorited = allItemsInGroup.some(item => item.images?.some(img => img.isFavorite));
                                        if (isGroupFavorited) {
                                            if (window.confirm('该创作系列中包含已收藏的记录，您确定要删除整个系列吗？')) {
                                                onRemove(parent.id, true);
                                            }
                                        } else {
                                            if (window.confirm('您确定要删除整个创作系列吗？')) {
                                               onRemove(parent.id, true);
                                            }
                                        }
                                    }}
                                    className="ml-2 p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                    aria-label={`删除系列: ${parent.prompt}`}
                                    title="删除系列"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {isExpanded && (
                            <div className="p-4 border-t border-slate-200 space-y-3">
                                {allItemsInGroup.sort((a,b) => b.timestamp - a.timestamp).map(childItem => (
                                    <HistoryItem
                                        key={childItem.id}
                                        item={childItem}
                                        isActive={childItem.id === selectedId}
                                        isChild={true}
                                        onSelect={onSelect}
                                        onRemove={onRemove}
                                        onToggleFavorite={onToggleFavorite}
                                        onOpenTagManager={onOpenTagManager}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            // Standalone item
            return (
              <HistoryItem
                key={itemOrGroup.id}
                item={itemOrGroup}
                isActive={itemOrGroup.id === selectedId}
                onSelect={onSelect}
                onRemove={onRemove}
                onToggleFavorite={onToggleFavorite}
                onOpenTagManager={onOpenTagManager}
              />
            );
          })}
        </div>
        {totalFilteredCount === 0 && (
            <div className="text-center py-10">
                <p className="text-slate-500">{searchQuery || activeModeFilter !== 'all' ? '没有找到匹配的历史记录。' : '还没有历史记录。'}</p>
            </div>
        )}
        {totalFilteredCount > visibleCount && (
            <div className="mt-8 text-center">
                <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="px-6 py-2 bg-white border border-slate-300 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    加载更多
                </button>
            </div>
        )}
      </div>
    </section>
  );
};