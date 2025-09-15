
import React from 'react';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { promptCategories } from '../utils/promptUtils';

interface PromptBuilderProps {
  onToggleKeyword: (keyword: string) => void;
  selectedKeywords: string[];
  disabled: boolean;
}

const KeywordButton: React.FC<{
  label: string;
  value: string;
  onClick: (value: string) => void;
  disabled: boolean;
  isSelected: boolean;
}> = ({ label, value, onClick, disabled, isSelected }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        isSelected
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
    }`}
  >
    {label}
  </button>
);

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ onToggleKeyword, selectedKeywords, disabled }) => {
  return (
    <div className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-left space-y-4">
      <div className="flex items-center gap-2">
        <LightBulbIcon className="w-5 h-5 text-amber-500" />
        <h3 className="text-md font-semibold text-slate-700">灵感词库</h3>
        <span className="text-sm text-slate-500">(点击添加)</span>
      </div>

      {promptCategories.map((category) => (
        <div key={category.title} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="font-semibold text-slate-600 text-sm w-full sm:w-20 flex-shrink-0 text-left sm:text-right">
            {category.title}
          </span>
          <div className="flex flex-wrap gap-2">
            {category.keywords.map((keyword) => (
              <KeywordButton
                key={keyword.value}
                label={keyword.label}
                value={keyword.value}
                onClick={onToggleKeyword}
                disabled={disabled}
                isSelected={selectedKeywords.includes(keyword.value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
