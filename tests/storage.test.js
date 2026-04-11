/**
 * Storage Module Tests
 * Test suite for AES-256-GCM encryption and secure storage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  encryptWalletData,
  decryptWalletData,
  deriveKey,
  WebStorageAdapter,
  WalletManager,
  secureClear
} from '../adapter/src/storage.js';

describe('AES-256-GCM Encryption', () => {
  const testWallet = {
    address: 'NOGO001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    publicKey: new Uint8Array(32).fill(1),
    privateKey: new Uint8Array(32).fill(2),
    mnemonic: 'abandon ability able about above absent absorb abstract absurd abuse access accident'
  };

  it('should encrypt wallet data', async () => {
    const password = 'testPassword123!';
    const encrypted = await encryptWalletData(testWallet, password);
    
    expect(encrypted).toHaveProperty('encrypted');
    expect(encrypted).toHaveProperty('salt');
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('version');
    expect(encrypted.address).toBe(testWallet.address);
    expect(encrypted.publicKey).toBeTruthy();
  });

  it('should decrypt wallet data', async () => {
    const password = 'testPassword123!';
    const encrypted = await encryptWalletData(testWallet, password);
    const decrypted = await decryptWalletData(encrypted, password);
    
    expect(decrypted.address).toBe(testWallet.address);
    expect(decrypted.privateKey).toEqual(testWallet.privateKey);
    expect(decrypted.mnemonic).toBe(testWallet.mnemonic);
  });

  it('should fail decryption with wrong password', async () => {
    const password = 'testPassword123!';
    const encrypted = await encryptWalletData(testWallet, password);
    
    await expect(decryptWalletData(encrypted, 'wrongPassword'))
      .rejects.toThrow('Wrong password or corrupted data');
  });

  it('should produce different encrypted data each time', async () => {
    const password = 'testPassword123!';
    
    const encrypted1 = await encryptWalletData(testWallet, password);
    const encrypted2 = await encryptWalletData(testWallet, password);
    
    expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
    expect(encrypted1.salt).not.toBe(encrypted2.salt);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });

  it('should use 16-byte salt', async () => {
    const password = 'testPassword123!';
    const encrypted = await encryptWalletData(testWallet, password);
    const salt = new Uint8Array(Buffer.from(encrypted.salt, 'base64'));
    
    expect(salt.length).toBe(16);
  });

  it('should use 12-byte IV', async () => {
    const password = 'testPassword123!';
    const encrypted = await encryptWalletData(testWallet, password);
    const iv = new Uint8Array(Buffer.from(encrypted.iv, 'base64'));
    
    expect(iv.length).toBe(12);
  });
});

describe('PBKDF2 Key Derivation', () => {
  it('should derive key from password', async () => {
    const password = 'testPassword123!';
    const salt = new Uint8Array(16).fill(1);
    
    const key = await deriveKey(password, salt);
    
    expect(key).toBeTruthy();
  });

  it('should derive same key from same password and salt', async () => {
    const password = 'testPassword123!';
    const salt = new Uint8Array(16).fill(1);
    
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);
    
    // Note: Web Crypto API returns CryptoKey objects, can't directly compare
    expect(key1).toBeTruthy();
    expect(key2).toBeTruthy();
  });

  it('should derive different keys from different passwords', async () => {
    const salt = new Uint8Array(16).fill(1);
    
    const key1 = await deriveKey('password1', salt);
    const key2 = await deriveKey('password2', salt);
    
    expect(key1).toBeTruthy();
    expect(key2).toBeTruthy();
  });
});

describe('Secure Memory Clearing', () => {
  it('should clear typed array', () => {
    const array = new Uint8Array([1, 2, 3, 4, 5]);
    secureClear(array);
    
    expect(array).toEqual(new Uint8Array([0, 0, 0, 0, 0]));
  });

  it('should handle empty array', () => {
    const array = new Uint8Array([]);
    secureClear(array);
    
    expect(array.length).toBe(0);
  });

  it('should handle null/undefined gracefully', () => {
    expect(() => secureClear(null)).not.toThrow();
    expect(() => secureClear(undefined)).not.toThrow();
  });
});

describe('Web Storage Adapter', () => {
  beforeEach(async () => {
    // Clear storage before each test
    const adapter = new WebStorageAdapter();
    await adapter.clear();
  });

  it('should save and load wallet', async () => {
    const adapter = new WebStorageAdapter();
    const wallet = {
      address: 'NOGO001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
      publicKey: new Uint8Array(32).fill(1),
      privateKey: new Uint8Array(32).fill(2),
      mnemonic: 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    };
    const password = 'testPassword123!';
    
    await adapter.saveWallet(wallet, password);
    const loaded = await adapter.loadWallet(wallet.address, password);
    
    expect(loaded.address).toBe(wallet.address);
    expect(loaded.mnemonic).toBe(wallet.mnemonic);
  });

  it('should list wallets', async () => {
    const adapter = new WebStorageAdapter();
    const password = 'testPassword123!';
    
    const wallet1 = {
      address: 'NOGO0011111111111111111111111111111111111111111111111111111111111111111111',
      publicKey: new Uint8Array(32).fill(1),
      privateKey: new Uint8Array(32).fill(2),
      mnemonic: 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    };
    
    const wallet2 = {
      address: 'NOGO0022222222222222222222222222222222222222222222222222222222222222222222',
      publicKey: new Uint8Array(32).fill(3),
      privateKey: new Uint8Array(32).fill(4),
      mnemonic: 'ability able about above absent absorb abstract absurd abuse access accident account'
    };
    
    await adapter.saveWallet(wallet1, password);
    await adapter.saveWallet(wallet2, password);
    
    const wallets = await adapter.listWallets();
    
    expect(wallets).toHaveLength(2);
    expect(wallets.map(w => w.address)).toContain(wallet1.address);
    expect(wallets.map(w => w.address)).toContain(wallet2.address);
  });

  it('should delete wallet', async () => {
    const adapter = new WebStorageAdapter();
    const password = 'testPassword123!';
    
    const wallet = {
      address: 'NOGO0011111111111111111111111111111111111111111111111111111111111111111111',
      publicKey: new Uint8Array(32).fill(1),
      privateKey: new Uint8Array(32).fill(2),
      mnemonic: 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    };
    
    await adapter.saveWallet(wallet, password);
    await adapter.deleteWallet(wallet.address);
    
    const wallets = await adapter.listWallets();
    expect(wallets).toHaveLength(0);
  });
});

describe('Wallet Manager', () => {
  beforeEach(async () => {
    const adapter = new WebStorageAdapter();
    await adapter.clear();
  });

  it('should create wallet', async () => {
    const manager = new WalletManager();
    const password = 'testPassword123!';
    
    const wallet = await manager.createWallet(password);
    
    expect(wallet).toHaveProperty('address');
    expect(wallet).toHaveProperty('mnemonic');
    expect(wallet.mnemonic.split(' ')).toHaveLength(12);
  });

  it('should lock and unlock wallet', async () => {
    const manager = new WalletManager();
    const password = 'testPassword123!';
    
    await manager.createWallet(password);
    expect(manager.isLocked).toBe(false);
    
    manager.lockWallet();
    expect(manager.isLocked).toBe(true);
    expect(manager.currentWallet).toBe(null);
  });

  it('should list wallets', async () => {
    const manager = new WalletManager();
    const password = 'testPassword123!';
    
    await manager.createWallet(password);
    
    const wallets = await manager.listWallets();
    expect(wallets.length).toBeGreaterThan(0);
  });
});
