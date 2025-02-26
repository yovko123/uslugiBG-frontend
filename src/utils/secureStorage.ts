import CryptoJS from 'crypto-js';

// Get encryption key from environment or generate one
const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY || 'uslugiBG-secure-storage-key';

// Encrypt data before storing
const encrypt = (data: any): string => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), STORAGE_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

// Decrypt data after retrieval
const decrypt = <T>(encryptedData: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, STORAGE_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const encryptedValue = encrypt(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },
  
  getItem: <T>(key: string): T | null => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      return decrypt<T>(encryptedValue);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

export default secureStorage; 