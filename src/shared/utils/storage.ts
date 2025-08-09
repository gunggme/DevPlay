type StorageType = 'localStorage' | 'sessionStorage';

const getStorage = (type: StorageType): Storage | null => {
  try {
    const storage = type === 'localStorage' ? localStorage : sessionStorage;
    // Test if storage is available
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
};

export const storage = {
  get: <T = unknown>(key: string, type: StorageType = 'localStorage'): T | null => {
    try {
      const storage = getStorage(type);
      if (!storage) return null;
      
      const item = storage.getItem(key);
      if (item === null) return null;
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to get item from ${type}:`, error);
      return null;
    }
  },

  set: <T = unknown>(key: string, value: T, type: StorageType = 'localStorage'): boolean => {
    try {
      const storage = getStorage(type);
      if (!storage) return false;
      
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set item in ${type}:`, error);
      return false;
    }
  },

  remove: (key: string, type: StorageType = 'localStorage'): boolean => {
    try {
      const storage = getStorage(type);
      if (!storage) return false;
      
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from ${type}:`, error);
      return false;
    }
  },

  clear: (type: StorageType = 'localStorage'): boolean => {
    try {
      const storage = getStorage(type);
      if (!storage) return false;
      
      storage.clear();
      return true;
    } catch (error) {
      console.warn(`Failed to clear ${type}:`, error);
      return false;
    }
  },

  exists: (key: string, type: StorageType = 'localStorage'): boolean => {
    try {
      const storage = getStorage(type);
      if (!storage) return false;
      
      return storage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
};