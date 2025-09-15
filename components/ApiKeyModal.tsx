import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    // Populate with existing key when modal opens
    if (isOpen) {
      // 如果currentApiKey为null，说明使用的是环境变量中的API Key，不显示在输入框中
      setKey(currentApiKey || '');
    }
  }, [isOpen, currentApiKey]);

  const handleSave = () => {
    if (key.trim()) {
      onSave(key);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    }, [onClose]);

  useEffect(() => {
    if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);


  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="api-key-modal-title" className="text-2xl font-bold">
            设置您的 Gemini API Key
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          为了使用本应用，您需要提供自己的 Google Gemini API Key。您可以在 Google AI Studio 免费获取。
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-700 mb-1">
              API Key
            </label>
            <input
              id="apiKeyInput"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请输入您的 API Key"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            点击这里获取您的 API Key ↗
          </a>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            保存并使用
          </button>
        </div>
      </div>
    </div>
  );
};