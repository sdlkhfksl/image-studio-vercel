
// services/multiApiKeyService.ts

export interface ApiKeyEntry {
  id: string;
  key: string;
  name: string;
  isValid?: boolean;
  lastTested?: number;
}

export class MultiApiKeyService {
  private static readonly STORAGE_KEY = 'gemini-api-keys';
  private static readonly ACTIVE_KEY_INDEX_KEY = 'gemini-active-api-key-index';

  /**
   * 获取所有存储的API密钥
   */
  static getAllApiKeys(): ApiKeyEntry[] {
    try {
      const keysJson = localStorage.getItem(this.STORAGE_KEY);
      return keysJson ? JSON.parse(keysJson) : [];
    } catch (error) {
      console.error('Failed to parse API keys from localStorage:', error);
      return [];
    }
  }

  /**
   * 保存API密钥列表到localStorage
   */
  static saveApiKeys(keys: ApiKeyEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save API keys to localStorage:', error);
    }
  }

  /**
   * 获取当前活动的API密钥索引
   */
  static getActiveKeyIndex(): number {
    try {
      const indexStr = localStorage.getItem(this.ACTIVE_KEY_INDEX_KEY);
      return indexStr ? parseInt(indexStr, 10) : 0;
    } catch (error) {
      console.error('Failed to parse active key index from localStorage:', error);
      return 0;
    }
  }

  /**
   * 设置当前活动的API密钥索引
   */
  static setActiveKeyIndex(index: number): void {
    try {
      localStorage.setItem(this.ACTIVE_KEY_INDEX_KEY, index.toString());
    } catch (error) {
      console.error('Failed to save active key index to localStorage:', error);
    }
  }

  /**
   * 获取当前活动的API密钥
   */
  static getActiveApiKey(): string | null {
    const keys = this.getAllApiKeys();
    if (keys.length === 0) return null;
    
    const activeIndex = this.getActiveKeyIndex();
    const activeKey = keys[activeIndex];
    
    return activeKey && activeKey.key ? activeKey.key : null;
  }

  /**
   * 添加新的API密钥
   */
  static addApiKey(key: ApiKeyEntry): void {
    const keys = this.getAllApiKeys();
    keys.push(key);
    this.saveApiKeys(keys);
  }

  /**
   * 更新API密钥
   */
  static updateApiKey(id: string, updatedKey: Partial<ApiKeyEntry>): void {
    const keys = this.getAllApiKeys();
    const index = keys.findIndex(k => k.id === id);
    if (index !== -1) {
      keys[index] = { ...keys[index], ...updatedKey };
      this.saveApiKeys(keys);
    }
  }

  /**
   * 删除API密钥
   */
  static removeApiKey(id: string): void {
    const keys = this.getAllApiKeys();
    const filteredKeys = keys.filter(k => k.id !== id);
    this.saveApiKeys(filteredKeys);
    
    // 如果删除的是当前活动的密钥，重置活动索引
    const activeIndex = this.getActiveKeyIndex();
    if (activeIndex >= filteredKeys.length) {
      this.setActiveKeyIndex(0);
    }
  }

  /**
   * 测试单个API密钥的有效性
   */
  static async testApiKey(apiKey: string): Promise<boolean> {
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
  }

  /**
   * 测试所有API密钥并更新其状态
   */
  static async testAllApiKeys(): Promise<ApiKeyEntry[]> {
    const keys = this.getAllApiKeys();
    const updatedKeys = [];

    for (const key of keys) {
      if (key.key.trim()) {
        const isValid = await this.testApiKey(key.key);
        updatedKeys.push({
          ...key,
          isValid,
          lastTested: Date.now()
        });
      } else {
        updatedKeys.push(key);
      }
    }

    this.saveApiKeys(updatedKeys);
    return updatedKeys;
  }

  /**
   * 获取下一个有效的API密钥（用于轮询）
   */
  static getNextValidApiKey(): string | null {
    const keys = this.getAllApiKeys();
    if (keys.length === 0) return null;
    
    let activeIndex = this.getActiveKeyIndex();
    
    // 尝试从当前索引开始查找有效的密钥
    for (let i = 0; i < keys.length; i++) {
      const index = (activeIndex + i) % keys.length;
      const key = keys[index];
      
      // 如果密钥未测试或测试有效，则返回
      if (key.isValid !== false && key.key) {
        // 更新活动索引
        if (index !== activeIndex) {
          this.setActiveKeyIndex(index);
        }
        return key.key;
      }
    }
    
    // 如果没有找到有效的密钥，返回null
    return null;
  }

  /**
   * 从环境变量获取API密钥（如果存在）
   */
  static getEnvApiKey(): string | null {
    return import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || null;
  }
}
