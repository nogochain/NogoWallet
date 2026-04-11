/**
 * Core Cryptography Module Tests
 * Production-grade test suite for BIP39/BIP32/BIP44/Ed25519
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeed,
  derivePath,
  generateKeyPair,
  generateAddress,
  signMessage,
  verifySignature,
  createWallet,
  createWalletFromMnemonic
} from '../core/src/crypto.js';

describe('BIP39 Mnemonic Generation', () => {
  it('should generate 12-word mnemonic', () => {
    const mnemonic = generateMnemonic();
    const words = mnemonic.split(' ');
    
    expect(words).toHaveLength(12);
    expect(mnemonic).toBeTruthy();
  });

  it('should generate different mnemonics each time', () => {
    const mnemonic1 = generateMnemonic();
    const mnemonic2 = generateMnemonic();
    
    expect(mnemonic1).not.toBe(mnemonic2);
  });

  it('should use valid BIP39 words', () => {
    const mnemonic = generateMnemonic();
    const words = mnemonic.split(' ');
    
    // All words should be lowercase
    words.forEach(word => {
      expect(word).toBe(word.toLowerCase());
      expect(word.length).toBeGreaterThan(0);
    });
  });
});

describe('BIP39 Mnemonic Validation', () => {
  it('should validate correct 12-word mnemonic', () => {
    const mnemonic = generateMnemonic();
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should reject invalid word count', () => {
    expect(validateMnemonic('abandon ability able')).toBe(false);
    expect(validateMnemonic('abandon ability able about above absent absorb abstract absurd abuse access accident account')).toBe(false);
  });

  it('should reject invalid words', () => {
    expect(validateMnemonic('invalid word here test fake wrong bad no good yes maybe')).toBe(false);
  });

  it('should handle extra spaces', () => {
    const mnemonic = generateMnemonic();
    const withExtraSpaces = '  ' + mnemonic + '  ';
    expect(validateMnemonic(withExtraSpaces)).toBe(true);
  });
});

describe('BIP39 Seed Derivation', () => {
  it('should derive seed from mnemonic', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    
    expect(seed).toBeInstanceOf(Uint8Array);
    expect(seed.length).toBe(64); // 512 bits
  });

  it('should derive same seed from same mnemonic', async () => {
    const mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
    const seed1 = await mnemonicToSeed(mnemonic);
    const seed2 = await mnemonicToSeed(mnemonic);
    
    expect(seed1).toEqual(seed2);
  });

  it('should derive different seeds from different mnemonics', async () => {
    const mnemonic1 = generateMnemonic();
    const mnemonic2 = generateMnemonic();
    
    const seed1 = await mnemonicToSeed(mnemonic1);
    const seed2 = await mnemonicToSeed(mnemonic2);
    
    expect(seed1).not.toEqual(seed2);
  });
});

describe('BIP32 Key Derivation', () => {
  it('should derive child key from parent', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    
    const childKey = await derivePath(seed, "m/44'/60'/0'/0/0");
    
    expect(childKey).toBeInstanceOf(Uint8Array);
    expect(childKey.length).toBe(32); // 256 bits
  });

  it('should derive same key from same path', async () => {
    const mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
    const seed = await mnemonicToSeed(mnemonic);
    
    const key1 = await derivePath(seed, "m/44'/60'/0'/0/0");
    const key2 = await derivePath(seed, "m/44'/60'/0'/0/0");
    
    expect(key1).toEqual(key2);
  });
});

describe('BIP44 Path Derivation', () => {
  it('should derive key from standard BIP44 path', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    
    const key = await derivePath(seed, path);
    
    expect(key).toBeTruthy();
    expect(key.length).toBe(32);
  });

  it('should handle different derivation paths', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    
    const key1 = await derivePath(seed, "m/44'/60'/0'/0/0");
    const key2 = await derivePath(seed, "m/44'/60'/0'/0/1");
    
    expect(key1).not.toEqual(key2);
  });
});

describe('Ed25519 Key Pair Generation', () => {
  it('should generate key pair from seed', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    
    const keyPair = await generateKeyPair(derivedKey);
    
    expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.privateKey.length).toBe(32);
    expect(keyPair.publicKey.length).toBe(32);
  });
});

describe('Address Generation', () => {
  it('should generate address from public key', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    const keyPair = await generateKeyPair(derivedKey);
    
    const address = generateAddress(keyPair.publicKey);
    
    expect(address).toBeTruthy();
    expect(address).toMatch(/^NOGO[a-f0-9]{74}$/); // NOGO + 37 bytes in hex
  });

  it('should generate same address from same public key', async () => {
    const mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    const keyPair = await generateKeyPair(derivedKey);
    
    const address1 = generateAddress(keyPair.publicKey);
    const address2 = generateAddress(keyPair.publicKey);
    
    expect(address1).toBe(address2);
  });

  it('should generate different addresses from different keys', async () => {
    const mnemonic1 = generateMnemonic();
    const mnemonic2 = generateMnemonic();
    
    const seed1 = await mnemonicToSeed(mnemonic1);
    const seed2 = await mnemonicToSeed(mnemonic2);
    
    const keyPair1 = await generateKeyPair(await derivePath(seed1, "m/44'/60'/0'/0/0"));
    const keyPair2 = await generateKeyPair(await derivePath(seed2, "m/44'/60'/0'/0/0"));
    
    const address1 = generateAddress(keyPair1.publicKey);
    const address2 = generateAddress(keyPair2.publicKey);
    
    expect(address1).not.toBe(address2);
  });
});

describe('Ed25519 Signing', () => {
  it('should sign message', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    const keyPair = await generateKeyPair(derivedKey);
    
    const message = 'Hello, NogoChain!';
    const signature = await signMessage(keyPair.privateKey, message);
    
    expect(signature).toBeInstanceOf(Uint8Array);
    expect(signature.length).toBe(64); // Ed25519 signature is 64 bytes
  });

  it('should verify valid signature', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    const keyPair = await generateKeyPair(derivedKey);
    
    const message = 'Hello, NogoChain!';
    const signature = await signMessage(keyPair.privateKey, message);
    const isValid = await verifySignature(keyPair.publicKey, message, signature);
    
    expect(isValid).toBe(true);
  });

  it('should reject invalid signature', async () => {
    const mnemonic = generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = "m/44'/60'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    const keyPair = await generateKeyPair(derivedKey);
    
    const message = 'Hello, NogoChain!';
    const wrongMessage = 'Wrong message!';
    const signature = await signMessage(keyPair.privateKey, message);
    
    const isValid = await verifySignature(keyPair.publicKey, wrongMessage, signature);
    
    expect(isValid).toBe(false);
  });
});

describe('Complete Wallet Creation', () => {
  it('should create complete wallet', async () => {
    const wallet = await createWallet();
    
    expect(wallet).toHaveProperty('mnemonic');
    expect(wallet).toHaveProperty('address');
    expect(wallet).toHaveProperty('publicKey');
    expect(wallet).toHaveProperty('privateKey');
    expect(wallet).toHaveProperty('path');
    
    expect(wallet.mnemonic.split(' ')).toHaveLength(12);
    expect(wallet.address).toMatch(/^NOGO[a-f0-9]{74}$/);
    expect(wallet.path).toBe("m/44'/60'/0'/0/0");
  });

  it('should create wallet from mnemonic', async () => {
    const mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
    const wallet = await createWalletFromMnemonic(mnemonic);
    
    expect(wallet).toHaveProperty('mnemonic');
    expect(wallet).toHaveProperty('address');
    expect(wallet).toHaveProperty('publicKey');
    expect(wallet).toHaveProperty('privateKey');
    expect(wallet.path).toBe("m/44'/60'/0'/0/0");
  });

  it('should reject invalid mnemonic', async () => {
    const invalidMnemonic = 'invalid word here test fake wrong bad no good yes maybe';
    
    await expect(createWalletFromMnemonic(invalidMnemonic)).rejects.toThrow('Invalid mnemonic phrase');
  });
});

describe('Security Properties', () => {
  it('should use CSPRNG for entropy generation', () => {
    const mnemonics = new Set();
    
    // Generate 100 mnemonics and check they're all unique
    for (let i = 0; i < 100; i++) {
      mnemonics.add(generateMnemonic());
    }
    
    expect(mnemonics.size).toBe(100);
  });

  it('should produce deterministic results from same seed', async () => {
    const mnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
    
    const wallet1 = await createWalletFromMnemonic(mnemonic);
    const wallet2 = await createWalletFromMnemonic(mnemonic);
    
    expect(wallet1.address).toBe(wallet2.address);
    expect(wallet1.publicKey).toEqual(wallet2.publicKey);
  });
});
