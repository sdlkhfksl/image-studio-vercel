import React, { useState, useRef } from 'react';
import { getAllHistory, clearHistory, addHistory } from '../services/historyService';
import { getTags, saveTags } from '../services/historyService';
import { HistoryRecord } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 获取所有历史记录
      const historyRecords = await getAllHistory();
      // 获取所有标签
      const tags = await getTags();
      
      // 创建导出数据对象
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        historyRecords,
        tags
      };
      
      // 转换为 JSON 字符串
      const jsonData = JSON.stringify(exportData, null, 2);
      setExportData(jsonData);
    } catch (error) {
      console.error('导出失败:', error);
      setExportData('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // 验证数据格式
      if (!importedData.historyRecords || !Array.isArray(importedData.historyRecords)) {
        throw new Error('无效的数据格式：缺少历史记录');
      }

      // 清空现有数据
      await clearHistory();
      
      // 导入历史记录
      for (const record of importedData.historyRecords as HistoryRecord[]) {
        // 确保记录有正确的结构
        const cleanRecord: HistoryRecord = {
          id: record.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          mode: record.mode,
          prompt: record.prompt,
          thumbnail: record.thumbnail,
          timestamp: record.timestamp || Date.now(),
          // 可选字段
          ...(record.style && { style: record.style }),
          ...(record.model && { model: record.model }),
          ...(record.images && { images: record.images }),
          ...(record.videoUrl && { videoUrl: record.videoUrl }),
          ...(record.sourceImage && { sourceImage: record.sourceImage }),
          ...(record.cameraMovement && { cameraMovement: record.cameraMovement }),
          ...(record.numberOfImages && { numberOfImages: record.numberOfImages }),
          ...(record.aspectRatio && { aspectRatio: record.aspectRatio }),
          ...(record.comicStripNumImages && { comicStripNumImages: record.comicStripNumImages }),
          ...(record.comicStripPanelPrompts && { comicStripPanelPrompts: record.comicStripPanelPrompts }),
          ...(record.comicStripType && { comicStripType: record.comicStripType }),
          ...(record.tags && { tags: record.tags }),
          ...(record.selectedKeywords && { selectedKeywords: record.selectedKeywords }),
          ...(record.negativePrompt && { negativePrompt: record.negativePrompt }),
          ...(record.i2iMode && { i2iMode: record.i2iMode }),
          ...(record.inspirationNumImages && { inspirationNumImages: record.inspirationNumImages }),
          ...(record.inspirationAspectRatio && { inspirationAspectRatio: record.inspirationAspectRatio }),
          ...(record.inspirationStrength && { inspirationStrength: record.inspirationStrength }),
          ...(record.parentId && { parentId: record.parentId }),
          ...(record.videoScripts && { videoScripts: record.videoScripts }),
          ...(record.videoUrls && { videoUrls: record.videoUrls }),
          ...(record.transitionUrls && { transitionUrls: record.transitionUrls }),
          ...(record.transitionOption && { transitionOption: record.transitionOption }),
        };
        
        await addHistory(cleanRecord);
      }

      // 导入标签
      if (importedData.tags && Array.isArray(importedData.tags)) {
        await saveTags(importedData.tags);
      }

      setImportStatus({ success: true, message: `成功导入 ${importedData.historyRecords.length} 条记录` });
      onImportComplete();
    } catch (error) {
      console.error('导入失败:', error);
      setImportStatus({ success: false, message: '导入失败: ' + (error instanceof Error ? error.message : '未知错误') });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">数据导入/导出</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'export'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('export')}
          >
            导出数据
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === 'import'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('import')}
          >
            导入数据
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  导出说明
                </h3>
                <p className="text-blue-700 mt-2 text-sm">
                  导出功能将保存您所有的创作历史记录和标签。导出的文件为 JSON 格式，可以在其他设备上导入使用。
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在生成导出数据...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      生成导出数据
                    </>
                  )}
                </button>

                {exportData && !isExporting && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-slate-700">预览导出数据</h3>
                        <span className="text-xs text-slate-500">
                          {Math.ceil(new Blob([exportData]).size / 1024)} KB
                        </span>
                      </div>
                      <pre className="text-xs bg-white p-3 rounded border max-h-40 overflow-auto">
                        {exportData.substring(0, 500)}...
                      </pre>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      下载导出文件
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  导入说明
                </h3>
                <p className="text-amber-700 mt-2 text-sm">
                  导入功能将替换您当前的所有数据。请确保在导入前已备份重要数据。仅支持导入由本应用导出的 JSON 文件。
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                
                <button
                  onClick={triggerFileSelect}
                  disabled={isImporting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在导入数据...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 011.414 0L9 8.586V3a1 1 0 112 0v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      选择导入文件
                    </>
                  )}
                </button>

                {importStatus && (
                  <div className={`p-4 rounded-lg ${importStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`font-medium ${importStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                      {importStatus.message}
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-700 mb-2">导入注意事项</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>导入将清空当前所有数据并替换为导入的数据</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>请确保导入的文件是由本应用导出的 JSON 文件</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>导入过程可能需要一些时间，请耐心等待</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};