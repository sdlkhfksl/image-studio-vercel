
import React, { useState, useEffect } from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface ApiKeyEntry {
  id: string;
  key: string;
  name: string;
  isValid?: boolean;
  lastTested?: number;
}

interface MultiApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKeys: ApiKeyEntry[]) => void;
  currentApiKeys: ApiKeyEntry[];
}

export const MultiApiKeyManager: React.FC<MultiApiKeyManagerProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentApiKeys 
}) => {
  const [keys, setKeys] = useState<ApiKeyEntry[]>(currentApiKeys || []);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeys(currentApiKeys || []);
    }
  }, [isOpen, currentApiKeys]);

  const addNewKey = () => {
    setKeys([
      ...keys,
      {
        id: Date.now().toString(),
        key: '',
        name: `API Key ${keys.length + 1}`,
        isValid: undefined,
        lastTested: undefined
      }
    ]);
  };

  const removeKey = (id: string) => {
    setKeys(keys.filter(key => key.id !== id));
  };

  const updateKey = (id: string, field: keyof ApiKeyEntry, value: string) => {
    setKeys(keys.map(key => 
      key.id === id ? { ...key, [field]: value } : key
    ));
  };

  const testApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      // Simple test using the Gemini API models list endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      return response.ok;
    } catch (error) {
      console.error('API Key test failed:', error);
      return false;
    }
  };

  const testAllKeys = async () => {
    setIsTesting(true);
    try {
      const updatedKeys = [...keys];
      for (let i = 0; i < updatedKeys.length; i++) {
        if (updatedKeys[i].key.trim()) {
          const isValid = await testApiKey(updatedKeys[i].key);
          updatedKeys[i] = {
            ...updatedKeys[i],
            isValid,
            lastTested: Date.now()
          };
        }
      }
      setKeys(updatedKeys);
    } catch (error) {
      console.error('Error testing API keys:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    // Filter out empty keys
    const validKeys = keys.filter(key => key.key.trim() !== '');
    onSave(validKeys);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="multi-api-key-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-slate-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="multi-api-key-modal-title" className="text-2xl font-bold">
            管理多个 Gemini API Key
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
          您可以添加多个 Gemini API Key，系统将自动测试并使用有效的密钥。
        </p>

        <div className="space-y-4 mb-6">
          {keys.map((apiKeyEntry) => (
            <div key={apiKeyEntry.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    value={apiKeyEntry.name}
                    onChange={(e) => updateKey(apiKeyEntry.id, 'name', e.target.value)}
                    placeholder="API Key 名称"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeyEntry.key}
                    onChange={(e) => updateKey(apiKeyEntry.id, 'key', e.target.value)}
                    placeholder="请输入您的 API Key"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2">
                {apiKeyEntry.isValid !== undefined && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    apiKeyEntry.isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {apiKeyEntry.isValid ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeKey(apiKeyEntry.id)}
                  className="text-slate-500 hover:text-red-500 transition-colors"
                  aria-label="Remove API Key"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={addNewKey}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            添加 API Key
          </button>
          
          <button
            onClick={testAllKeys}
            disabled={isTesting}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                测试中...
              </>
            ) : (
              <>
                <KeyIcon className="w-4 h-4" />
                测试所有密钥
              </>
            )}
          </button>
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
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            保存并使用
          </button>
        </div>
      </div>
    </div>
  );
};
