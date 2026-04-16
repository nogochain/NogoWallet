/**
 * Secure Storage Module - Platform Adapter
 * AES-256-GCM encryption with PBKDF2 key derivation
 */

import { sha256 } from '@noble/hashes/sha256';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { randomBytes } from '@noble/hashes/utils';

// Web Crypto API for AES-GCM encryption
const cryptoApi = window.crypto || window.msCrypto;

/**
 * Derive encryption key from password using PBKDF2
 * Production settings: 100,000 iterations, SHA-256
 */
export async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  const key = await cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  return key;
}

/**
 * Encrypt wallet data using AES-256-GCM
 * Only encrypts sensitive data (privateKey), keeps address/publicKey in plaintext
 */
export async function encryptWalletData(walletData, password) {
  const enc = new TextEncoder();
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  
  const key = await deriveKey(password, salt);
  
  // Only encrypt sensitive data
  const sensitiveData = {
    privateKey: walletData.privateKey,
    mnemonic: walletData.mnemonic
  };
  
  const encodedData = enc.encode(JSON.stringify(sensitiveData));
  const encrypted = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );
  
  // Return encrypted data with salt and IV, plus plaintext address/publicKey
  return {
    encrypted: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    version: 1,
    address: walletData.address,
    publicKey: walletData.publicKey // Already Base64 encoded
  };
}

/**
 * Decrypt wallet data using AES-256-GCM
 */
export async function decryptWalletData(encryptedData, password) {
  try {
    // Check if you are in the Tauri environment
    const isTauri = window.__TAURI__ !== undefined;
    
    if (isTauri) {
      console.log('Using Tauri backend for decryption');
      // Convert the field names to ensure they match the `EncryptedWallet` struct in the Rust backend
      const tauriEncryptedData = {
        encrypted: encryptedData.encrypted,
        salt: encryptedData.salt,
        iv: encryptedData.iv,
        version: encryptedData.version || 1,
        address: encryptedData.address,
        public_key: encryptedData.publicKey 
      };
      console.log('Converted encrypted data for Tauri:', tauriEncryptedData);
      
      // Decrypting using the Tauri backend
      const { invoke } = await import('@tauri-apps/api');
      const decrypted = await invoke('decrypt_wallet_data', {
        encryptedData: tauriEncryptedData,
        password
      });
      console.log('Tauri decryption result:', decrypted);
      
      // Convert back to camelCase
      return {
        address: decrypted.address,
        publicKey: decrypted.publicKey,
        privateKey: decrypted.privateKey,
        mnemonic: decrypted.mnemonic,
        encrypted: decrypted.encrypted
      };
    } else {
      console.log('Using Web Crypto API for decryption');
      // Decrypting using the Web Crypto API
      const enc = new TextEncoder();
      const dec = new TextDecoder();
      
      if (!encryptedData.encrypted || !encryptedData.salt || !encryptedData.iv) {
        throw new Error('Invalid encrypted wallet data structure');
      }
      
      const salt = base64ToUint8Array(encryptedData.salt);
      const iv = base64ToUint8Array(encryptedData.iv);
      const encrypted = base64ToUint8Array(encryptedData.encrypted);
      
      const key = await deriveKey(password, salt);
      
      const decrypted = await cryptoApi.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );
      
      const sensitiveData = JSON.parse(dec.decode(decrypted));
      
      return {
        address: encryptedData.address,
        publicKey: encryptedData.publicKey,
        privateKey: sensitiveData.privateKey,
        mnemonic: sensitiveData.mnemonic,
        encrypted: true
      };
    }
  } catch (e) {
    console.error('Decryption error:', e);
    if (e.name === 'InvalidAccessError' || e.name === 'OperationFailed' || e.message.includes('Wrong password')) {
      throw new Error('Wrong password or corrupted data');
    }
    throw new Error(`Decryption failed: ${e.message}`);
  }
}

/**
 * Web Adapter: Store encrypted wallet in IndexedDB
 */
export class WebStorageAdapter {
  constructor(dbName = 'NogoWallet', storeName = 'wallets') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }
  
  async init() {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'address' });
        }
      };
    });
  }
  
  async saveWallet(walletData, password) {
    await this.init();
    
    const encrypted = await encryptWalletData(walletData, password);
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put({
        address: encrypted.address,
        data: encrypted,
        createdAt: Date.now()
      });
      
      request.onsuccess = () => resolve(encrypted);
      request.onerror = () => reject(request.error);
    });
  }
  
  async loadWallet(address, password) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(address);
      
      request.onsuccess = async () => {
        if (!request.result) {
          reject(new Error('Wallet not found'));
          return;
        }
        
        try {
          const decrypted = await decryptWalletData(request.result.data, password);
          resolve(decrypted);
        } catch (e) {
          reject(e);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  async listWallets() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const wallets = request.result.map(w => ({
          address: w.address,
          createdAt: w.createdAt
        }));
        resolve(wallets);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteWallet(address) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(address);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Tauri Adapter: Store encrypted wallet via Rust backend
 * Uses Tauri invoke API to communicate with Rust commands
 */
export class TauriStorageAdapter {
  constructor() {
    this.invoke = null;
    this.loadTauriApi();
  }
  
  async loadTauriApi() {
    try {
      const { invoke } = await import('@tauri-apps/api/tauri');
      this.invoke = invoke;
    } catch (e) {
      console.warn('Tauri API not available, running in web mode');
    }
  }
  
  async saveWallet(walletData, password) {
    if (!this.invoke) {
      throw new Error('Tauri API not available');
    }
    
    const encrypted = await encryptWalletData(walletData, password);
    
    await this.invoke('save_wallet', {
      address: encrypted.address,
      data: JSON.stringify(encrypted)
    });
    
    return encrypted;
  }
  
  async loadWallet(address, password) {
    if (!this.invoke) {
      throw new Error('Tauri API not available');
    }
    
    const dataStr = await this.invoke('load_wallet', { address });
    const encrypted = JSON.parse(dataStr);
    
    return await decryptWalletData(encrypted, password);
  }
  
  async listWallets() {
    if (!this.invoke) {
      throw new Error('Tauri API not available');
    }
    
    const wallets = await this.invoke('list_wallets');
    return wallets.map(w => ({
      address: w.address,
      createdAt: w.created_at
    }));
  }
  
  async deleteWallet(address) {
    if (!this.invoke) {
      throw new Error('Tauri API not available');
    }
    
    await this.invoke('delete_wallet', { address });
  }
}

/**
 * Utility functions
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Secure memory clearing
 * Overwrite sensitive data in memory before garbage collection
 */
export function secureClear(typedArray) {
  if (!typedArray || !typedArray.length) return;
  
  for (let i = 0; i < typedArray.length; i++) {
    typedArray[i] = 0;
  }
}

/**
 * Wallet Manager - High-level API
 */
export class WalletManager {
  constructor(adapter) {
    this.adapter = adapter || new WebStorageAdapter();
    this.currentWallet = null;
    this.isLocked = true;
  }
  
  async createWallet(password) {
    const { createWallet } = await import('@core/crypto.js');
    const wallet = await createWallet();
    
    await this.adapter.saveWallet(wallet, password);
    
    this.currentWallet = wallet;
    this.isLocked = false;
    
    return wallet;
  }
  
  async importWallet(mnemonicOrPrivateKey, password) {
    const { createWalletFromMnemonic } = await import('@core/crypto.js');
    
    // Check if it's a mnemonic or private key
    const words = mnemonicOrPrivateKey.trim().split(/\s+/);
    let wallet;
    
    if (words.length === 12) {
      wallet = await createWalletFromMnemonic(mnemonicOrPrivateKey);
    } else {
      throw new Error('Only mnemonic import is supported in this version');
    }
    
    await this.adapter.saveWallet(wallet, password);
    
    this.currentWallet = wallet;
    this.isLocked = false;
    
    return wallet;
  }
  
  async unlockWallet(address, password) {
    this.currentWallet = await this.adapter.loadWallet(address, password);
    this.isLocked = false;
    return this.currentWallet;
  }
  
  lockWallet() {
    if (this.currentWallet && this.currentWallet.privateKey) {
      secureClear(this.currentWallet.privateKey);
    }
    this.currentWallet = null;
    this.isLocked = true;
  }
  
  async listWallets() {
    return await this.adapter.listWallets();
  }
  
  async deleteWallet(address, password) {
    await this.unlockWallet(address, password);
    await this.adapter.deleteWallet(address);
    
    if (this.currentWallet && this.currentWallet.address === address) {
      this.lockWallet();
    }
  }
  
  getCurrentWallet() {
    if (this.isLocked || !this.currentWallet) {
      throw new Error('Wallet is locked');
    }
    
    return {
      address: this.currentWallet.address,
      publicKey: this.currentWallet.publicKey
    };
  }
}
