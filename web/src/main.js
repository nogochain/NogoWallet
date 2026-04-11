/**
 * NogoWallet Main Application
 * Production-grade cross-platform wallet
 */

// Debug: check if script loaded
console.log('[NogoWallet] Main script loaded');

// Simple translation function for English-only version
// Returns the key itself as all keys are in English
function t(key) {
  const translations = {
    // Node status
    'node.status.checking': 'Checking...',
    'node.status.connected': 'Connected',
    'node.status.disconnected': 'Disconnected',
    'node.selector.switch': '🔄 Switch',
    'node.selector.title': 'Select Node',
    'node.selector.local': '🏠 Local Node (localhost:8080)',
    'node.selector.main': '🌐 Main Node (main.nogochain.org)',
    'node.selector.wallet': '💼 Wallet Node (wallet.nogochain.org)',
    'node.selector.backup': '🔄 Backup Node (node.nogochain.org)',
    
    // Language
    'lang.zh': '中文',
    'lang.en': 'English',
    
    // Welcome
    'welcome.title': 'Secure, Decentralized Digital Asset Management',
    'welcome.subtitle': 'NogoChain Official Wallet - Supporting BIP39/BIP32/BIP44 standards, Ed25519 signature algorithm, AES-256-GCM encrypted storage',
    'welcome.create.title': 'Create New Wallet',
    'welcome.create.desc': 'Generate new mnemonic phrase and securely store your digital assets',
    'welcome.import.title': 'Import Wallet',
    'welcome.import.desc': 'Restore your existing wallet using mnemonic phrase or private key',
    
    // Create wallet
    'create.tab': 'Create Wallet',
    'create.back': 'Back to Welcome',
    'create.generate': '🎲 Generate Mnemonic',
    'create.backup.warning': '⚠️ Please backup your mnemonic phrase! This is the only way to recover your wallet.',
    'create.mnemonic.title': 'Mnemonic Phrase',
    'create.mnemonic.copy': '📋 Copy',
    'create.details.title': 'Wallet Details',
    'create.details.address': 'Address',
    'create.details.pubkey': 'Public Key',
    'create.details.privkey': 'Private Key',
    'create.privatekey.copy': '📋 Copy',
    'create.password.hint': '💡 Tip: You can set a password to encrypt wallet storage (optional)',
    'create.password.label1': 'Set Password',
    'create.password.label2': 'Confirm Password',
    'create.password.submit': '🔒 Encrypt & Save Wallet',
    'create.password.input': 'Please enter password',
    'create.password.error': 'Passwords do not match',
    'create.password.minlength': 'Password must be at least 8 characters',
    
    // Import wallet
    'import.tab': 'Import Wallet',
    'import.back': 'Back to Welcome',
    'import.mnemonic.label': 'Mnemonic Phrase',
    'import.privatekey.label': 'Private Key (Base64)',
    'import.btn': '📥 Import Wallet',
    
    // Wallet tabs
    'wallet.tab.send': 'Send',
    'wallet.tab.receive': 'Receive',
    'wallet.tab.transactions': 'Transactions',
    'wallet.tab.info': 'Info',
    'wallet.tab.reimport': 'Reimport',
    
    // Send
    'wallet.send.title': 'Send Transaction',
    'wallet.send.to': 'Recipient Address',
    'wallet.send.amount': 'Amount (NOGO)',
    'wallet.send.memo': 'Memo (Optional)',
    'wallet.send.btn': '🚀 Send Transaction',
    
    // Receive
    'wallet.receive.title': 'Receive NOGO',
    'wallet.receive.address': 'Receive Address',
    'wallet.receive.copy': '📋 Copy',
    
    // Transactions
    'wallet.transactions.title': 'Transaction History',
    'wallet.transactions.loading': 'Loading...',
    'wallet.transactions.empty': 'No transactions yet',
    
    // Info
    'wallet.info.title': 'Wallet Info',
    'wallet.info.address': 'Address',
    'wallet.info.pubkey': 'Public Key',
    'wallet.info.balance': 'Balance',
    'wallet.info.nonce': 'Nonce',
    
    // Reimport
    'wallet.reimport.title': 'Reimport Wallet',
    'wallet.reimport.btn': '🔄 Reimport',
    
    // Toast messages
    'toast.generating': 'Generating wallet...',
    'toast.generated': 'Wallet generated successfully!',
    'toast.generation.failed': 'Failed to generate wallet: ',
    'toast.encrypt.success': 'Wallet encrypted and saved successfully!',
    'toast.encrypt.failed': 'Failed to encrypt wallet: ',
    'toast.import.success': 'Wallet imported successfully!',
    'toast.import.success.encrypted': 'Wallet imported and encrypted successfully!',
    'toast.import.failed': 'Failed to import: ',
    'toast.import.invalid': 'Invalid mnemonic phrase or private key',
    'toast.import.invalid.mnemonic': 'Invalid mnemonic phrase',
    'toast.import.private.invalid': 'Invalid private key',
    'toast.import.private.success': 'Private key imported successfully!',
    'toast.import.private.success.encrypted': 'Private key imported and encrypted successfully!',
    'toast.import.private.failed': 'Failed to import private key: ',
    'toast.balance.failed': 'Failed to fetch balance',
    'toast.send.success': 'Transaction sent successfully!',
    'toast.send.failed': 'Failed to send transaction: ',
    'toast.copied': 'Copied!',
    'toast.locked': 'Wallet locked',
    'toast.reimport.success': 'Wallet reimported successfully!',
    'toast.reimport.failed': 'Failed to reimport wallet: ',
    
    // Logout
    'logout.confirm': 'Are you sure you want to logout? Make sure you have backed up your mnemonic phrase or private key.',
    'logout.success': 'Logged out successfully'
  };
  
  return translations[key] || key;
}

// Blockchain API endpoints (multiple nodes for redundancy)
// Priority: Local node first, then remote production nodes
// P2P peers: main.nogochain.org:9090,wallet.nogochain.org:9090,node.nogochain.org:9090
// HTTP API:  main.nogochain.org:8080,wallet.nogochain.org:8080,node.nogochain.org:8080
const API_ENDPOINTS = [
  'http://localhost:8080',               // Local node (priority 1)
  'http://main.nogochain.org:8080',      // Main production node
  'http://wallet.nogochain.org:8080',    // Wallet node
  'http://node.nogochain.org:8080'       // Backup node
];

let currentApiEndpoint = 0; // Start with first endpoint
let API_BASE = API_ENDPOINTS[0];

/**
 * Switch to next API endpoint if current one fails
 */
function switchApiEndpoint() {
  currentApiEndpoint = (currentApiEndpoint + 1) % API_ENDPOINTS.length;
  API_BASE = API_ENDPOINTS[currentApiEndpoint];
  console.log(`[API] Switched to endpoint: ${API_BASE}`);
  return API_BASE;
}

/**
 * Fetch with automatic endpoint failover
 */
async function fetchWithFailover(url, options = {}) {
  let lastError;
  
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[(currentApiEndpoint + i) % API_ENDPOINTS.length];
    try {
      const fullUrl = url.replace(API_ENDPOINTS[0], endpoint);
      
      const response = await fetch(fullUrl, {
        ...options,
        mode: 'cors' // Enable CORS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`[API] Endpoint ${endpoint} failed:`, error.message);
    }
  }
  
  throw lastError;
}

import { WalletManager } from '@adapter/storage.js';
import { WalletService } from '@service/sdk.js';
import { 
  generateMnemonic, 
  validateMnemonic, 
  mnemonicToSeed,
  derivePath,
  generateKeyPair,
  generateAddress,
  signMessage
} from '@core/crypto.js';
// i18n removed - using simple English-only translation function defined above
// import { t, setLang, getCurrentLang, getLangName } from './i18n.js';

// Global state
let walletManager = null;
let walletService = null;
let currentWallet = null;
let isWalletLocked = true;
let localNonce = null; // Local nonce counter to prevent conflicts during rapid transactions
let nodeConnected = false; // Node connection status
let currentNodeEndpoint = API_ENDPOINTS[0]; // Current connected node

// Expose functions to global scope immediately
window.switchLang = switchLang;
window.t = t; // Expose translation function for HTML onclick handlers

// API configuration - Use remote nodes for production
API_BASE = API_ENDPOINTS[0];

/**
 * Toggle node selector dropdown
 */
function toggleNodeSelector() {
  const selector = document.getElementById('nodeSelector');
  if (selector) {
    selector.style.display = selector.style.display === 'none' ? 'block' : 'none';
  }
}

/**
 * Select a specific node
 */
async function selectNode(endpoint) {
  // Update API_BASE to selected endpoint
  API_BASE = endpoint;
  
  // Update current endpoint index
  const index = API_ENDPOINTS.indexOf(endpoint);
  if (index !== -1) {
    currentApiEndpoint = index;
  }
  
  console.log('[Node Selector] Switched to:', endpoint);
  
  // Close selector
  toggleNodeSelector();
  
  // Re-check connection
  await checkNodeConnection();
  
  // Refresh wallet info if wallet is loaded
  if (currentWallet) {
    await loadWalletInfo();
  }
  
  // Show toast notification
  showToast(`Node switched to: ${endpoint}`);
}

/**
 * Update node selector UI to highlight current node
 */
function updateNodeSelectorUI() {
  const options = document.querySelectorAll('.node-option');
  options.forEach(btn => {
    // Remove active style from all buttons
    btn.style.background = 'var(--bg-secondary)';
    btn.style.borderColor = 'var(--border-color)';
    btn.style.fontWeight = 'normal';
    
    // Check if this button matches current endpoint
    const onclick = btn.getAttribute('onclick');
    if (onclick && onclick.includes(API_BASE)) {
      btn.style.background = 'var(--accent-blue)';
      btn.style.borderColor = 'var(--accent-blue)';
      btn.style.color = 'white';
      btn.style.fontWeight = '600';
    }
  });
}

// Close node selector when clicking outside
document.addEventListener('click', function(event) {
  const selector = document.getElementById('nodeSelector');
  const button = document.getElementById('nodeSelectBtn');
  
  if (selector && button && 
      !selector.contains(event.target) && 
      !button.contains(event.target)) {
    selector.style.display = 'none';
  }
});

/**
 * Check node connection status
 */
async function checkNodeConnection() {
  const statusDot = document.getElementById('nodeStatusDot');
  const statusText = document.getElementById('nodeStatusText');
  
  if (!statusDot || !statusText) {
    console.warn('[Node Status] Status elements not found');
    statusText.textContent = '状态栏未初始化';
    return;
  }
  
  // Set checking status
  statusDot.style.background = 'var(--accent-yellow)';
  statusText.textContent = t('node.status.checking') || '检测中...';
  statusText.style.color = 'var(--text-secondary)';
  
  let lastError = null;
  
  // Try each endpoint in order
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[i];
    
    try {
      console.log(`[Node Status] Trying endpoint ${i + 1}/${API_ENDPOINTS.length}: ${endpoint}`);
      
      // Try to connect to current node with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        mode: 'cors' // Enable CORS
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        nodeConnected = true;
        currentNodeEndpoint = endpoint;
        API_BASE = endpoint; // Update global API_BASE
        
        // Update UI - Connected
        statusDot.style.background = 'var(--accent-green)';
        statusDot.style.boxShadow = '0 0 10px var(--accent-green)';
        statusText.textContent = `✓ ${currentNodeEndpoint}`;
        statusText.style.color = 'var(--accent-green)';
        
        console.log('[Node Status] ✅ Connected to:', currentNodeEndpoint);
        console.log('[Node Status] Health data:', data);
        
        // Update node selector UI
        updateNodeSelectorUI();
        
        return; // Success, exit function
      } else {
        throw new Error(`Node returned status ${response.status}`);
      }
    } catch (error) {
      lastError = error;
      console.warn(`[Node Status] ❌ Endpoint ${endpoint} failed:`, error.message);
      
      // Continue to next endpoint
      if (error.name === 'AbortError') {
        console.warn('[Node Status] Request timeout');
      } else if (error.name === 'TypeError') {
        console.warn('[Node Status] Network error - CORS or unreachable');
      }
    }
  }
  
  // All endpoints failed
  nodeConnected = false;
  
  // Update UI - Disconnected
  statusDot.style.background = 'var(--accent-red)';
  statusDot.style.boxShadow = '0 0 10px var(--accent-red)';
  
  const errorMsg = lastError ? lastError.message : 'Unknown error';
  statusText.textContent = `${t('node.status.disconnected') || '节点未连接'} - ${errorMsg}`;
  statusText.style.color = 'var(--accent-red)';
  
  console.error('[Node Status] ❌ All endpoints failed');
  console.error('[Node Status] Tried endpoints:', API_ENDPOINTS);
  console.error('[Node Status] Last error:', lastError);
}

/**
 * Initialize application
 */
async function initApp() {
  console.log('=== NogoWallet Initializing ===');
  
  // Initialize wallet manager
  walletManager = new WalletManager();
  walletService = new WalletService();
  
  // Check node connection
  await checkNodeConnection();
  
  // Check for saved wallet
  await loadSavedWallet();
  
  console.log('=== NogoWallet Ready ===');
}

/**
 * Load saved wallet from storage
 */
async function loadSavedWallet() {
  try {
    const saved = localStorage.getItem('nogoWallet');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      
      console.log('[loadSavedWallet] Loaded wallet data:', {
        encrypted: parsed.encrypted,
        hasPublicKey: !!parsed.publicKey,
        publicKeyLength: parsed.publicKey?.length,
        publicKey: parsed.publicKey ? parsed.publicKey.substring(0, 20) + '...' : 'MISSING'
      });
      
      if (parsed.encrypted) {
        // Encrypted wallet - address and publicKey are in plaintext
        currentWallet = parsed;
        isWalletLocked = true;
        console.log('Encrypted wallet loaded (locked)');
        
        // Show dashboard but locked
        showTab('walletDashboardTab');
        updateWalletInfo();
      } else {
        // Unencrypted wallet
        currentWallet = parsed;
        isWalletLocked = false;
        console.log('Unencrypted wallet loaded');
        
        showTab('walletDashboardTab');
        loadWalletInfo();
      }
    } else {
      showWelcome();
    }
  } catch (e) {
    console.error('Failed to load saved wallet:', e);
    showWelcome();
  }
}

/**
 * Generate new wallet
 */
async function generateWallet() {
  try {
    showToast(t('toast.generating'));
    
    // Generate mnemonic
    const mnemonic = generateMnemonic();
    
    // Derive seed
    const seed = await mnemonicToSeed(mnemonic);
    
    // Derive key using BIP44 path - NogoChain uses coinType 0 (not 60 which is Ethereum)
    // Path: m/44'/0'/0'/0/0  (purpose/coinType/account/change/index)
    const path = "m/44'/0'/0'/0/0";
    const derivedKey = await derivePath(seed, path);
    
    // Generate key pair
    const keyPair = await generateKeyPair(derivedKey);
    
    console.log('[generateWallet] Key pair:', {
      privateKeyType: keyPair.privateKey?.constructor?.name,
      privateKeyLength: keyPair.privateKey?.byteLength,
      publicKeyType: keyPair.publicKey?.constructor?.name,
      publicKeyLength: keyPair.publicKey?.byteLength
    });
    
    // Generate address
    const address = generateAddress(keyPair.publicKey);
    
    // Convert to Base64
    const privateKeyBase64 = arrayBufferToBase64(keyPair.privateKey);
    const publicKeyBase64 = arrayBufferToBase64(keyPair.publicKey);
    
    console.log('[generateWallet] Generated keys:', {
      address,
      privateKeyBase64: privateKeyBase64.substring(0, 30) + '...',
      privateKeyBase64Length: privateKeyBase64.length,
      publicKeyBase64: publicKeyBase64.substring(0, 30) + '...',
      publicKeyBase64Length: publicKeyBase64.length
    });
    
    // Display wallet info
    document.getElementById('mnemonicPhrase').textContent = mnemonic;
    document.getElementById('newAddress').textContent = address;
    document.getElementById('newPublicKey').textContent = publicKeyBase64;
    document.getElementById('newPrivateKey').textContent = privateKeyBase64;
    
    // Temporarily save
    currentWallet = {
      address,
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
      mnemonic
    };
    
    console.log('[generateWallet] currentWallet saved:', {
      address: currentWallet.address,
      publicKey: currentWallet.publicKey ? currentWallet.publicKey.substring(0, 20) + '...' : 'missing',
      publicKeyLength: currentWallet.publicKey?.length
    });
    
    // Show step 2
    document.getElementById('createStep1').style.display = 'none';
    document.getElementById('createStep2').style.display = 'block';
    
    // Show password section after a short delay to let user see the mnemonic
    setTimeout(() => {
      document.getElementById('passwordSection').style.display = 'block';
      console.log('[generateWallet] Password section displayed');
    }, 1000);
    
    showToast(t('toast.generated'));
    
  } catch (e) {
    console.error('Generation failed:', e);
    showToast(t('toast.generation.failed') + e.message);
  }
}

/**
 * Save wallet with password encryption
 */
async function saveWalletWithPassword() {
  const password1 = document.getElementById('walletPassword1').value;
  const password2 = document.getElementById('walletPassword2').value;
  
  if (!password1 || !password2) {
    document.getElementById('passwordMatchError').textContent = t('create.password.input');
    document.getElementById('passwordMatchError').style.display = 'block';
    return;
  }
  
  if (password1 !== password2) {
    document.getElementById('passwordMatchError').textContent = t('create.password.error');
    document.getElementById('passwordMatchError').style.display = 'block';
    return;
  }
  
  if (password1.length < 8) {
    document.getElementById('passwordMatchError').textContent = t('create.password.minlength');
    document.getElementById('passwordMatchError').style.display = 'block';
    return;
  }
  
  try {
    const { encryptWalletData } = await import('@adapter/storage.js');
    
    // Encrypt wallet data
    const encrypted = await encryptWalletData(currentWallet, password1);
    localStorage.setItem('nogoWallet', JSON.stringify(encrypted));
    currentWallet = encrypted;
    isWalletLocked = false;
    
    // Clear backup if exists
    localStorage.removeItem('nogoWallet_backup');
    
    showToast(t('toast.encrypt.success'));
    showTab('walletDashboardTab');
    loadWalletInfo();
    
  } catch (e) {
    console.error('Failed to encrypt wallet:', e);
    showToast(t('toast.encrypt.failed'));
  }
}

/**
 * Import wallet from mnemonic or private key
 */
async function importWallet() {
  const mnemonic = document.getElementById('importMnemonic').value.trim();
  const privateKeyBase64 = document.getElementById('importPrivateKey').value.trim();
  
  try {
    if (mnemonic) {
      await importFromMnemonic(mnemonic);
    } else if (privateKeyBase64) {
      await importFromPrivateKey(privateKeyBase64);
    } else {
      showToast(t('toast.import.failed') + t('toast.import.invalid'));
      return;
    }
  } catch (e) {
    showToast(t('toast.import.failed') + e.message);
    console.error(e);
  }
}

/**
 * Import from mnemonic
 */
async function importFromMnemonic(mnemonic) {
  if (!validateMnemonic(mnemonic)) {
      showToast(t('toast.import.invalid'));
      return;
    }
  
  // Use same algorithm as official webwallet: mnemonic -> PBKDF2 -> SHA256 -> Ed25519
  const seed = await mnemonicToSeed(mnemonic);
  console.log('[DEBUG Import] Seed (hex):', Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Hash seed with SHA-256 to get private key
  const hashBuffer = await crypto.subtle.digest('SHA-256', seed);
  const privateKeyBytes = new Uint8Array(hashBuffer);
  console.log('[DEBUG Import] PrivateKey (hex):', Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Generate Ed25519 public key
  const ed25519 = await import('@noble/ed25519');
  const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);
  console.log('[DEBUG Import] PublicKey (hex):', Array.from(publicKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Generate address
  const address = generateAddress(publicKeyBytes);
  console.log('[DEBUG Import] Address:', address);
  
  // Save wallet
  currentWallet = {
    address,
    publicKey: arrayBufferToBase64(publicKeyBytes.buffer),
    privateKey: arrayBufferToBase64(privateKeyBytes.buffer),
    mnemonic,
    imported: true
  };
  
  // Check password
  const password1 = document.getElementById('importPassword1').value;
  const password2 = document.getElementById('importPassword2').value;
  
  if (password1 || password2) {
    if (!password1 || !password2) {
      document.getElementById('importPasswordError').textContent = t('create.password.input');
      document.getElementById('importPasswordError').style.display = 'block';
      return;
    }
    
    if (password1 !== password2) {
      document.getElementById('importPasswordError').textContent = t('create.password.error');
      document.getElementById('importPasswordError').style.display = 'block';
      return;
    }
    
    if (password1.length < 8) {
      document.getElementById('importPasswordError').textContent = t('create.password.minlength');
      document.getElementById('importPasswordError').style.display = 'block';
      return;
    }
    
    // Encrypt and save
    const { encryptWalletData } = await import('@adapter/storage.js');
    const encrypted = await encryptWalletData(currentWallet, password1);
    localStorage.setItem('nogoWallet', JSON.stringify(encrypted));
    currentWallet = encrypted;
    
    // Clear backup if exists
    localStorage.removeItem('nogoWallet_backup');
    
    showToast(t('toast.import.success.encrypted'));
  } else {
    localStorage.setItem('nogoWallet', JSON.stringify(currentWallet));
    
    // Clear backup if exists
    localStorage.removeItem('nogoWallet_backup');
    
    showToast(t('toast.import.success'));
  }
  
  showTab('walletDashboardTab');
  loadWalletInfo();
}

/**
 * Import from private key
 */
async function importFromPrivateKey(privateKeyBase64) {
  try {
    const privateKeyBytes = base64ToUint8Array(privateKeyBase64);
    
    if (privateKeyBytes.length !== 32) {
      showToast(t('toast.import.private.invalid'));
      return;
    }
    
    // Generate public key
    const ed25519 = await import('@noble/ed25519');
    const publicKeyBytes = await ed25519.ed25519.getPublicKey(privateKeyBytes);
    
    // Generate address
    const address = generateAddress(publicKeyBytes);
    
    // Save wallet
    currentWallet = {
      address,
      publicKey: arrayBufferToBase64(publicKeyBytes),
      privateKey: privateKeyBase64,
      imported: true
    };
    
    // Check password
    const password1 = document.getElementById('importPassword1').value;
    const password2 = document.getElementById('importPassword2').value;
    
    if (password1 || password2) {
      if (!password1 || !password2) {
        document.getElementById('importPasswordError').textContent = '请填写两个密码字段或都留空';
        document.getElementById('importPasswordError').style.display = 'block';
        return;
      }
      
      if (password1 !== password2) {
        document.getElementById('importPasswordError').textContent = '密码不匹配！';
        document.getElementById('importPasswordError').style.display = 'block';
        return;
      }
      
      if (password1.length < 8) {
        document.getElementById('importPasswordError').textContent = '密码必须至少 8 个字符';
        document.getElementById('importPasswordError').style.display = 'block';
        return;
      }
      
      // Encrypt and save
      const { encryptWalletData } = await import('@adapter/storage.js');
      const encrypted = await encryptWalletData(currentWallet, password1);
      localStorage.setItem('nogoWallet', JSON.stringify(encrypted));
      currentWallet = encrypted;
      
      // Clear backup if exists
      localStorage.removeItem('nogoWallet_backup');
      
      showToast(t('toast.import.private.success.encrypted'));
    } else {
      localStorage.setItem('nogoWallet', JSON.stringify(currentWallet));
      
      // Clear backup if exists
      localStorage.removeItem('nogoWallet_backup');
      
      showToast(t('toast.import.private.success'));
    }
    
    showTab('walletDashboardTab');
    loadWalletInfo();
    
  } catch (e) {
    showToast(t('toast.import.private.failed') + e.message);
    console.error(e);
  }
}

/**
 * Clear reimport form
 */
function clearReimportForm() {
  document.getElementById('reimportMnemonic').value = '';
  document.getElementById('reimportPrivateKey').value = '';
  document.getElementById('reimportPassword1').value = '';
  document.getElementById('reimportPassword2').value = '';
  document.getElementById('reimportPasswordError').style.display = 'none';
}

/**
 * Re-import wallet (for already loaded wallet)
 */
async function reimportWallet() {
  const mnemonic = document.getElementById('reimportMnemonic').value.trim();
  const privateKeyBase64 = document.getElementById('reimportPrivateKey').value.trim();
  
  try {
    if (mnemonic) {
      await reimportFromMnemonic(mnemonic);
    } else if (privateKeyBase64) {
      await reimportFromPrivateKey(privateKeyBase64);
    } else {
      showToast(t('toast.import.failed') + t('toast.import.invalid'));
      return;
    }
  } catch (e) {
    showToast(t('toast.import.failed') + e.message);
    console.error(e);
  }
}

/**
 * Re-import from mnemonic
 */
async function reimportFromMnemonic(mnemonic) {
  if (!validateMnemonic(mnemonic)) {
    showToast(t('toast.import.invalid'));
    return;
  }
  
  // Use same algorithm as official webwallet: mnemonic -> PBKDF2 -> SHA256 -> Ed25519
  const seed = await mnemonicToSeed(mnemonic);
  console.log('[DEBUG Reimport] Seed (hex):', Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Hash seed with SHA-256 to get private key
  const hashBuffer = await crypto.subtle.digest('SHA-256', seed);
  const privateKeyBytes = new Uint8Array(hashBuffer);
  console.log('[DEBUG Reimport] PrivateKey (hex):', Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Generate Ed25519 public key
  const ed25519 = await import('@noble/ed25519');
  const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);
  console.log('[DEBUG Reimport] PublicKey (hex):', Array.from(publicKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Generate address
  const address = generateAddress(publicKeyBytes);
  console.log('[DEBUG Reimport] Address:', address);
  
  // Save wallet
  currentWallet = {
    address,
    publicKey: arrayBufferToBase64(publicKeyBytes.buffer),
    privateKey: arrayBufferToBase64(privateKeyBytes.buffer),
    mnemonic,
    imported: true
  };
  
  // Check password
  const password1 = document.getElementById('reimportPassword1').value;
  const password2 = document.getElementById('reimportPassword2').value;
  
  if (password1 || password2) {
    if (!password1 || !password2) {
      document.getElementById('reimportPasswordError').textContent = t('create.password.input');
      document.getElementById('reimportPasswordError').style.display = 'block';
      return;
    }
    
    if (password1 !== password2) {
      document.getElementById('reimportPasswordError').textContent = t('create.password.error');
      document.getElementById('reimportPasswordError').style.display = 'block';
      return;
    }
    
    if (password1.length < 8) {
      document.getElementById('reimportPasswordError').textContent = t('create.password.minlength');
      document.getElementById('reimportPasswordError').style.display = 'block';
      return;
    }
    
    // Encrypt and save
    const { encryptWalletData } = await import('@adapter/storage.js');
    const encrypted = await encryptWalletData(currentWallet, password1);
    localStorage.setItem('nogoWallet', JSON.stringify(encrypted));
    currentWallet = encrypted;
    
    showToast(t('toast.import.success.encrypted'));
  } else {
    localStorage.setItem('nogoWallet', JSON.stringify(currentWallet));
    showToast(t('toast.import.success'));
  }
  
  // Reset nonce counter
  localNonce = null;
  
  // Clear wallet data
  localStorage.removeItem('nogoWallet');
  currentWallet = null;
  
  showToast(t('toast.reimport.success'));
  
  // Clear form and show welcome page
  clearReimportForm();
  showWelcome();
}

/**
 * Re-import from private key
 */
async function reimportFromPrivateKey(privateKeyBase64) {
  try {
    const privateKeyBytes = base64ToUint8Array(privateKeyBase64);
    
    if (privateKeyBytes.length !== 32) {
      showToast(t('toast.import.private.invalid'));
      return;
    }
    
    // Generate public key
    const ed25519 = await import('@noble/ed25519');
    const publicKeyBytes = await ed25519.ed25519.getPublicKey(privateKeyBytes);
    
    // Generate address
    const address = generateAddress(publicKeyBytes);
    
    // Save wallet
    currentWallet = {
      address,
      publicKey: arrayBufferToBase64(publicKeyBytes),
      privateKey: privateKeyBase64,
      imported: true
    };
    
    // Check password
    const password1 = document.getElementById('reimportPassword1').value;
    const password2 = document.getElementById('reimportPassword2').value;
    
    if (password1 || password2) {
      if (!password1 || !password2) {
        document.getElementById('reimportPasswordError').textContent = t('create.password.input');
        document.getElementById('reimportPasswordError').style.display = 'block';
        return;
      }
      
      if (password1 !== password2) {
        document.getElementById('reimportPasswordError').textContent = t('create.password.error');
        document.getElementById('reimportPasswordError').style.display = 'block';
        return;
      }
      
      if (password1.length < 8) {
        document.getElementById('reimportPasswordError').textContent = t('create.password.minlength');
        document.getElementById('reimportPasswordError').style.display = 'block';
        return;
      }
      
      // Encrypt and save
      const { encryptWalletData } = await import('@adapter/storage.js');
      const encrypted = await encryptWalletData(currentWallet, password1);
      localStorage.setItem('nogoWallet', JSON.stringify(encrypted));
      currentWallet = encrypted;
      
      showToast(t('toast.import.private.success.encrypted'));
    } else {
      localStorage.setItem('nogoWallet', JSON.stringify(currentWallet));
      showToast(t('toast.import.private.success'));
    }
    
    // Reset nonce counter
    localNonce = null;
    
    // Clear wallet data
    localStorage.removeItem('nogoWallet');
    currentWallet = null;
    
    showToast(t('toast.reimport.success'));
    
    // Clear form and show welcome page
    clearReimportForm();
    showWelcome();
    
  } catch (e) {
    showToast(t('toast.import.private.failed') + e.message);
    console.error(e);
  }
}

/**
 * Load wallet info and balance
 */
async function loadWalletInfo() {
  if (!currentWallet) {
    console.warn('[loadWalletInfo] currentWallet is null');
    return;
  }
  
  console.log('[loadWalletInfo] Loading wallet info:', {
    address: currentWallet.address,
    publicKey: currentWallet.publicKey ? 'present' : 'missing',
    publicKeyLength: currentWallet.publicKey?.length
  });
  
  // Set basic info
  const addressEl = document.getElementById('walletAddress');
  const publicKeyEl = document.getElementById('walletPublicKey');
  const receiveAddressEl = document.getElementById('receiveAddress');
  
  console.log('[loadWalletInfo] DOM elements:', {
    addressEl: !!addressEl,
    publicKeyEl: !!publicKeyEl,
    receiveAddressEl: !!receiveAddressEl
  });
  
  if (addressEl) addressEl.textContent = currentWallet.address;
  if (publicKeyEl) {
    publicKeyEl.textContent = currentWallet.publicKey;
    console.log('[loadWalletInfo] Public key set:', currentWallet.publicKey?.substring(0, 20) + '...');
  } else {
    console.error('[loadWalletInfo] walletPublicKey element not found!');
  }
  if (receiveAddressEl) receiveAddressEl.textContent = currentWallet.address;
  
  // Generate QR code
  await generateQRCode(currentWallet.address);
  
  // Load balance and nonce
  try {
    const response = await fetchWithFailover(`${API_BASE}/balance/${currentWallet.address}`);
    const data = await response.json();
    const balance = (data.balance / 1e8).toFixed(8);
    document.getElementById('walletBalance').textContent = balance;
    
    // Update send tab balance
    const sendBalanceEl = document.getElementById('sendBalance');
    if (sendBalanceEl) {
      sendBalanceEl.textContent = balance;
    }
    
    // Update nonce - use API nonce as base, or increment local counter if available
    if (localNonce === null) {
      localNonce = (data.nonce || 0) + 1;
    }
    document.getElementById('walletNonce').textContent = localNonce;
  } catch (e) {
    console.warn('Failed to load balance:', e);
    showToast(t('toast.balance.failed'));
  }
  
  // Load transactions if tab is visible
  if (!document.getElementById('transactionsTab').style.display || document.getElementById('transactionsTab').style.display === 'block') {
    await loadTransactions();
  }
}

/**
 * Load balance for send tab
 */
async function loadSendBalance() {
  if (!currentWallet || !currentWallet.address) {
    return;
  }
  
  try {
    const response = await fetchWithFailover(`${API_BASE}/balance/${currentWallet.address}`);
    const data = await response.json();
    const balance = (data.balance / 1e8).toFixed(8);
    
    const sendBalanceEl = document.getElementById('sendBalance');
    if (sendBalanceEl) {
      sendBalanceEl.textContent = balance;
    }
  } catch (e) {
    console.error('[loadSendBalance] Failed to load balance:', e);
  }
}

/**
 * Update wallet info (for locked wallet)
 */
function updateWalletInfo() {
  if (!currentWallet) return;
  
  document.getElementById('walletAddress').textContent = currentWallet.address;
  document.getElementById('receiveAddress').textContent = currentWallet.address;
}

/**
 * Load transactions
 */
async function loadTransactions() {
  const container = document.getElementById('transactionsList');
  if (!container || !currentWallet) return;
  
  try {
    const response = await fetchWithFailover(`${API_BASE}/address/${currentWallet.address}/txs`);
    const data = await response.json();
    const txs = data.txs || [];
    
    if (txs.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-secondary);">${t('wallet.transactions.empty')}</div>`;
      return;
    }
    
    // Sort by time (newest first)
    txs.sort((a, b) => {
      const getTime = (tx) => {
        if (tx.blockTime) return tx.blockTime;
        if (tx.timestamp) return tx.timestamp;
        if (tx.time) return tx.time;
        return 0;
      };
      return getTime(b) - getTime(a);
    });
    
    let html = '';
    for (const tx of txs) {
      const amount = (tx.amount || 0) / 1e8;
      const fee = (tx.fee || 0) / 1e8;
      const isCoinbase = tx.type === 'coinbase';
      const isIncoming = tx.toAddress === currentWallet.address;
      const direction = isIncoming ? 'IN' : 'OUT';
      const amountClass = isIncoming ? 'text-green' : 'text-red';
      
      let timestamp = 'N/A';
      if (tx.blockTime) {
        timestamp = new Date(tx.blockTime * 1000).toLocaleString();
      }
      
      const txHash = tx.txId || tx.hash || 'N/A';
      const isConfirmed = tx.location && tx.location.height && tx.location.blockHashHex;
      const statusDisplay = isConfirmed ? t('wallet.transactions.confirmed') : t('wallet.transactions.pending');
      
      html += `
        <div class="tx-card" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
            <span style="color: var(--accent-blue); font-family: 'Courier New', monospace; font-size: 13px;">${txHash.substring(0, 16)}...${txHash.substring(txHash.length - 16)}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div>
              <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">类型</div>
              <div style="color: var(--text-primary); font-size: 13px;">${isCoinbase ? t('wallet.transactions.coinbase') : t('wallet.transactions.transfer')} ${isIncoming ? '⬇️' : '⬆️'}</div>
            </div>
            <div>
              <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">状态</div>
              <div style="color: var(--text-primary); font-size: 13px;">${statusDisplay}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div>
              <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">金额</div>
              <div style="color: var(${amountClass}); font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold;">${isIncoming ? '+' : '-'}${amount.toFixed(8)} NOGO</div>
            </div>
            <div>
              <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">手续费</div>
              <div style="color: var(--text-secondary); font-family: 'Courier New', monospace; font-size: 13px;">${fee.toFixed(8)} NOGO</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <div style="color: var(--text-secondary); font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">时间</div>
              <div style="color: var(--text-primary); font-family: 'Courier New', monospace; font-size: 13px;">${timestamp}</div>
            </div>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
    
  } catch (e) {
    console.error('Failed to load transactions:', e);
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-secondary);">${t('wallet.transactions.loading')} ❌</div>`;
  }
}

/**
 * Send transaction
 */
async function sendTransaction() {
  const toAddress = document.getElementById('sendAddress').value.trim();
  const amountNOGO = parseFloat(document.getElementById('sendAmount').value);
  
  if (!toAddress || !toAddress.startsWith('NOGO')) {
    showToast(t('toast.send.address.invalid'));
    return;
  }
  if (!amountNOGO || amountNOGO <= 0) {
    showToast(t('toast.send.amount.invalid'));
    return;
  }
  if (!currentWallet) {
    showToast(t('toast.send.wallet.notloaded'));
    return;
  }
  
  try {
    showToast(t('toast.send.creating'));
    
    // Get balance
    const balanceResp = await fetch(`${API_BASE}/balance/${currentWallet.address}`);
    const balanceData = await balanceResp.json();
    const balance = balanceData.balance || 0;
    
    // Use and increment local nonce
    if (localNonce === null) {
      localNonce = (balanceData.nonce || 0) + 1;
    }
    const nonce = localNonce;
    localNonce++; // Increment for next transaction
    
    let fee = 45000;
    
    // Estimate fee
    try {
      const feeResp = await fetch(`${API_BASE}/tx/estimate_fee?speed=average&size=350`);
      const feeData = await feeResp.json();
      fee = feeData.estimatedFee || 45000;
    } catch (e) {
      console.warn('Fee estimation failed:', e);
    }
    
    const amount = Math.floor(amountNOGO * 1e8);
    
    if (balance < amount + fee) {
      showToast(t('toast.send.balance'));
      return;
    }
    
    // Build transaction
    const tx = {
      type: 'transfer',
      chainId: 1,
      fromPubKey: currentWallet.publicKey,
      toAddress: toAddress,
      amount: amount,
      fee: fee,
      nonce: nonce,
      data: ''
    };
    
    // Compute from address
    const { sha256 } = await import('@noble/hashes/sha256');
    const pubKeyBytes = base64ToUint8Array(currentWallet.publicKey);
    const pubKeyHash = sha256(pubKeyBytes);
    const addressData = new Uint8Array(1 + 32);
    addressData[0] = 0x00;
    addressData.set(pubKeyHash, 1);
    const checksumHash = sha256(addressData);
    const checksumBytes = checksumHash.slice(0, 4);
    const fullAddress = new Uint8Array(1 + 32 + 4);
    fullAddress.set(addressData, 0);
    fullAddress.set(checksumBytes, 1 + 32);
    const fromAddr = 'NOGO' + Array.from(fullAddress).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create signing hash
    const legacyJsonObj = {
      type: 'transfer',
      chainId: 1,
      fromAddr: fromAddr,
      toAddress: toAddress,
      amount: amount,
      fee: fee,
      nonce: nonce
    };
    
    const legacyJsonStr = JSON.stringify(legacyJsonObj);
    const encoder = new TextEncoder();
    const preimage = encoder.encode(legacyJsonStr);
    const msgHash = sha256(preimage);
    
    // Sign
    const ed25519 = await import('@noble/ed25519');
    const privateKeyBytes = base64ToUint8Array(currentWallet.privateKey);
    const signature = await ed25519.ed25519.sign(msgHash, privateKeyBytes);
    
    // Add signature
    tx.signature = arrayBufferToBase64(signature.buffer);
    
    // Send
    const submitResp = await fetchWithFailover(`${API_BASE}/tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    
    const result = await submitResp.json();
    const accepted = result.accepted || result.Accepted;
    const txid = result.txId || result.TxID || result.txid;
    const message = result.message || result.Message || result.error;
    
    if (accepted) {
      showToast(t('toast.send.success') + txid.substring(0, 16) + '...' + txid.substring(txid.length - 8));
      
      // Clear form
      document.getElementById('sendAddress').value = '';
      document.getElementById('sendAmount').value = '';
      
      // Update nonce display immediately
      document.getElementById('walletNonce').textContent = localNonce;
      
      // Refresh balance
      await loadWalletInfo();
    } else {
      // Revert nonce if transaction failed
      localNonce--;
      showToast('❌ ' + message);
    }
    
  } catch (e) {
    console.error('Send failed:', e);
    showToast(t('toast.send.failed') + e.message);
  }
}

/**
 * Lock wallet
 */
function lockWallet() {
  isWalletLocked = true;
  showToast(t('toast.locked'));
}

/**
 * Logout
 */
function logout() {
  if (confirm(t('logout.confirm'))) {
    localStorage.removeItem('nogoWallet');
    currentWallet = null;
    isWalletLocked = true;
    showWelcome();
    showToast(t('toast.logout'));
  }
}

/**
 * UI Navigation functions
 */
function showWelcome() {
  // Hide all tabs including wallet dashboard
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  // Show welcome section
  document.getElementById('welcomeSection').style.display = 'block';
  
  // Show/hide "Back to Wallet" button based on backup or wallet existence
  const backToWalletBtn = document.getElementById('backToWalletBtn');
  const backupData = localStorage.getItem('nogoWallet_backup');
  const walletData = localStorage.getItem('nogoWallet');
  if (backToWalletBtn) {
    if (backupData) {
      backToWalletBtn.style.display = 'inline-block';
      backToWalletBtn.textContent = '← Back to My Wallet';
    } else if (walletData) {
      backToWalletBtn.style.display = 'inline-block';
      backToWalletBtn.textContent = '← Back to Wallet';
    } else {
      backToWalletBtn.style.display = 'none';
    }
  }
  
  console.log('[showWelcome] Welcome page displayed');
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById('welcomeSection').style.display = 'none';
  
  const tabElement = document.getElementById(tabId);
  if (tabElement) {
    tabElement.style.display = 'block';
    
    if (tabId === 'walletDashboardTab') {
      // Show default sub-tab
      ['sendTab', 'receiveTab', 'infoTab', 'transactionsTab'].forEach(t => {
        document.getElementById(t).style.display = 'none';
      });
      document.getElementById('sendTab').style.display = 'block';
      
      loadWalletInfo();
    }
  }
}

function switchCreateTab(step) {
  if (step === 'step1') {
    document.getElementById('createStep1').style.display = 'block';
    document.getElementById('createStep2').style.display = 'none';
  }
}

function switchImportTab(mode) {
  document.getElementById('importPassword1').value = '';
  document.getElementById('importPassword2').value = '';
  document.getElementById('importPasswordError').style.display = 'none';
}

function switchWalletTab(tab) {
  // Reimport: backup current wallet and redirect to welcome page (don't clear wallet)
  if (tab === 'reimport') {
    const walletData = localStorage.getItem('nogoWallet');
    if (walletData) {
      // Backup current wallet to temporary storage
      localStorage.setItem('nogoWallet_backup', walletData);
      // Show welcome page
      showWelcome();
      showToast('You can create/import new wallet or go back to current wallet.');
    } else {
      // No wallet, just show welcome page
      showWelcome();
    }
    return;
  }
  
  // Hide all tabs
  ['sendTab', 'receiveTab', 'infoTab', 'transactionsTab', 'reimportTab'].forEach(t => {
    document.getElementById(t).style.display = 'none';
  });
  
  // Remove active class from all buttons
  ['send', 'receive', 'transactions', 'info', 'reimport'].forEach(t => {
    const btn = document.getElementById(`tabBtn-${t}`);
    if (btn) {
      btn.classList.remove('active');
    }
  });
  
  // Show selected tab and activate button
  document.getElementById(tab + 'Tab').style.display = 'block';
  const activeBtn = document.getElementById(`tabBtn-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Load wallet info when switching to info tab
  if (tab === 'info') {
    loadWalletInfo();
  }
  
  // Load transactions if needed
  if (tab === 'transactions') {
    loadTransactions();
  }
  
  // Load balance when switching to send tab
  if (tab === 'send') {
    loadSendBalance();
  }
  
  // Clear reimport form when switching to reimport tab
  if (tab === 'reimport') {
    clearReimportForm();
  }
}

/**
 * Generate QR code
 */
async function generateQRCode(address) {
  const container = document.getElementById('qrCodeContainer');
  if (!container) return;
  
  try {
    container.innerHTML = '';
    
    // Create a wrapper div to crop the white border
    const qrWrapper = document.createElement('div');
    qrWrapper.style.cssText = `
      display: inline-block;
      width: 200px;
      height: 200px;
      background: #161b22;
      border-radius: 8px;
      overflow: hidden;
      margin: 0 auto;
      display: block;
    `;
    
    // Use QR code API with larger size and crop it
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(address)}&color=3fb950&bgcolor=161b22&margin=0&format=png`;
    
    const img = document.createElement('img');
    img.src = qrUrl;
    img.alt = 'Receive Address QR Code';
    img.style.width = '200px';
    img.style.height = '200px';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    
    qrWrapper.appendChild(img);
    container.appendChild(qrWrapper);
    
  } catch (e) {
    console.error('Failed to generate QR code:', e);
    container.innerHTML = `<p style="color: #f85149;">${t('toast.qr.failed')}</p>`;
  }
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(elementId, labelKey) {
  const element = document.getElementById(elementId);
  const text = element.textContent;
  
  try {
    await navigator.clipboard.writeText(text);
    const label = t(labelKey) || labelKey;
    showToast(t('common.copied', { label }));
  } catch (err) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    const label = t(labelKey) || labelKey;
    showToast(t('common.copied', { label }));
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  
  if (type === 'success') {
    toast.style.background = 'var(--accent-green, #10b981)';
  } else if (type === 'error') {
    toast.style.background = 'var(--accent-red, #ef4444)';
  } else {
    toast.style.background = 'var(--accent-blue, #3b82f6)';
  }
  
  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, 3000);
}

/**
 * Switch language
 */
function switchLang(lang) {
  console.log('[switchLang] Switching to:', lang);
  
  // Update active state on lang buttons
  const zhBtn = document.getElementById('langBtnZh');
  const enBtn = document.getElementById('langBtnEn');
  
  console.log('[switchLang] Buttons found:', { zh: !!zhBtn, en: !!enBtn });
  
  if (zhBtn && enBtn) {
    if (lang === 'zh') {
      zhBtn.classList.add('active');
      enBtn.classList.remove('active');
      console.log('[switchLang] Set Chinese active');
    } else {
      enBtn.classList.add('active');
      zhBtn.classList.remove('active');
      console.log('[switchLang] Set English active');
    }
  }
  
  // Set language (this will also update page content via i18n)
  setLang(lang);
  
  // Force update placeholders and dynamic content
  updatePageLanguage();
  
  console.log('[switchLang] Language switched to:', getCurrentLang());
}

/**
 * Update page language
 */
function updatePageLanguage() {
  let updatedCount = 0;
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation !== key && translation) {
      el.textContent = translation;
      updatedCount++;
    }
  });
  
  console.log(`[i18n] Updated ${updatedCount} elements with language:`, getCurrentLang());
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation !== key && translation) {
      el.placeholder = translation;
    }
  });
  
  // Update error messages if visible
  const passwordError = document.getElementById('passwordMatchError');
  if (passwordError && passwordError.style.display === 'block') {
    passwordError.textContent = t('create.password.error');
  }
  
  const importPasswordError = document.getElementById('importPasswordError');
  if (importPasswordError && importPasswordError.style.display === 'block') {
    importPasswordError.textContent = t('create.password.error');
  }
  
  // Update QR code label if exists
  const qrCodeContainer = document.getElementById('qrCodeContainer');
  if (qrCodeContainer && qrCodeContainer.lastChild) {
    const label = qrCodeContainer.lastChild;
    if (label.tagName === 'P') {
      label.textContent = t('wallet.receive.qr');
    }
  }
  
  console.log('[i18n] Language updated to:', getCurrentLang());
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

// Initialize app on load
// Use 'load' event instead of 'DOMContentLoaded' for better Tauri compatibility
window.addEventListener('load', () => {
  console.log('[Load] Initializing app...');
  
  // Initialize app
  initApp();
  
  // Bind all event listeners
  bindEventListeners();
  
  console.log('[Load] App initialization complete');
});

// Expose functions to global scope for HTML onclick handlers
window.showTab = showTab;
window.showWelcome = showWelcome;
window.generateWallet = generateWallet;
window.saveWalletWithPassword = saveWalletWithPassword;
window.importWallet = importWallet;
window.reimportWallet = reimportWallet;
window.copyToClipboard = copyToClipboard;
window.switchCreateTab = switchCreateTab;
window.switchImportTab = switchImportTab;
window.switchWalletTab = switchWalletTab;
window.showSection = function(section) {
  console.log('Section:', section);
};

// Bind event listeners programmatically
function bindEventListeners() {
  console.log('[Event Binders] Binding all event listeners...');
  
  // Node selector
  const nodeSelectBtn = document.getElementById('nodeSelectBtn');
  if (nodeSelectBtn) {
    nodeSelectBtn.addEventListener('click', toggleNodeSelector);
    console.log('[Event Binders] Node selector button bound');
  }
  
  // Node options
  document.querySelectorAll('.node-option').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const nodes = [
        'http://localhost:8080',
        'http://main.nogochain.org:8080',
        'http://wallet.nogochain.org:8080',
        'http://node.nogochain.org:8080'
      ];
      selectNode(nodes[index]);
    });
  });
  
  // Language buttons (removed - no language switcher in English-only version)
  
  // Welcome page cards - using IDs
  const createCard = document.getElementById('createWalletCard');
  const importCard = document.getElementById('importWalletCard');
  if (createCard) createCard.addEventListener('click', () => showTab('createTab'));
  if (importCard) importCard.addEventListener('click', () => showTab('importTab'));
  
  // Back to wallet button - restore backed up wallet
  const backToWalletBtn = document.getElementById('backToWalletBtn');
  if (backToWalletBtn) {
    backToWalletBtn.addEventListener('click', () => {
      // Check if backup exists
      const backupData = localStorage.getItem('nogoWallet_backup');
      if (backupData) {
        // Restore backup
        localStorage.setItem('nogoWallet', backupData);
        localStorage.removeItem('nogoWallet_backup');
        currentWallet = JSON.parse(backupData);
        showTab('walletDashboardTab');
        loadWalletInfo();
        showToast('Wallet restored');
      } else {
        // No backup, check if current wallet exists
        const walletData = localStorage.getItem('nogoWallet');
        if (walletData) {
          currentWallet = JSON.parse(walletData);
          showTab('walletDashboardTab');
          loadWalletInfo();
        } else {
          showToast('No wallet to restore');
        }
      }
    });
    // Show/hide button based on backup or wallet existence
    const backupData = localStorage.getItem('nogoWallet_backup');
    const walletData = localStorage.getItem('nogoWallet');
    if (backToWalletBtn) {
      if (backupData || walletData) {
        backToWalletBtn.style.display = 'inline-block';
        backToWalletBtn.textContent = backupData ? '← Back to My Wallet' : '← Back to Wallet';
      } else {
        backToWalletBtn.style.display = 'none';
      }
    }
  }
  
  // Create tab buttons - using IDs
  const createStep1Btn = document.getElementById('createStep1Btn');
  const createBackBtn = document.getElementById('createBackBtn');
  const generateBtn = document.getElementById('generateBtn');
  if (createStep1Btn) createStep1Btn.addEventListener('click', () => switchCreateTab('step1'));
  if (createBackBtn) createBackBtn.addEventListener('click', showWelcome);
  if (generateBtn) generateBtn.addEventListener('click', generateWallet);
  
  // Copy buttons in create step 2 - using IDs
  const copyMnemonicBtn = document.getElementById('copyMnemonicBtn');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const copyPublicKeyBtn = document.getElementById('copyPublicKeyBtn');
  const copyPrivateKeyBtn = document.getElementById('copyPrivateKeyBtn');
  if (copyMnemonicBtn) copyMnemonicBtn.addEventListener('click', () => copyToClipboard('mnemonicPhrase', 'Mnemonic copied!'));
  if (copyAddressBtn) copyAddressBtn.addEventListener('click', () => copyToClipboard('newAddress', 'Address copied!'));
  if (copyPublicKeyBtn) copyPublicKeyBtn.addEventListener('click', () => copyToClipboard('newPublicKey', 'Public key copied!'));
  if (copyPrivateKeyBtn) copyPrivateKeyBtn.addEventListener('click', () => copyToClipboard('newPrivateKey', 'Private key copied!'));
  
  // Save wallet button - using ID
  const saveBtn = document.getElementById('saveWalletBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveWalletWithPassword);
  
  // Import tab buttons - using IDs
  const importTabBtn = document.getElementById('importTabBtn');
  const importBackBtn = document.getElementById('importBackBtn');
  const importSubmitBtn = document.getElementById('importSubmitBtn');
  if (importTabBtn) importTabBtn.addEventListener('click', () => switchImportTab('import'));
  if (importBackBtn) importBackBtn.addEventListener('click', showWelcome);
  if (importSubmitBtn) importSubmitBtn.addEventListener('click', importWallet);
  
  // Wallet tab buttons - using IDs
  const tabBtns = ['send', 'receive', 'transactions', 'info', 'reimport'];
  tabBtns.forEach(tab => {
    const btn = document.getElementById(`tabBtn-${tab}`);
    if (btn) btn.addEventListener('click', () => switchWalletTab(tab));
  });
  
  // Send transaction button - using ID
  const sendBtn = document.getElementById('sendTransactionBtn');
  if (sendBtn) sendBtn.addEventListener('click', sendTransaction);
  
  // Refresh balance button - using ID
  const refreshBalanceBtn = document.getElementById('refreshBalanceBtn');
  if (refreshBalanceBtn) {
    refreshBalanceBtn.addEventListener('click', async () => {
      if (currentWallet && currentWallet.address) {
        try {
          const response = await fetchWithFailover(`${API_BASE}/balance/${currentWallet.address}`);
          const data = await response.json();
          const balance = (data.balance / 1e8).toFixed(8);
          document.getElementById('sendBalance').textContent = balance;
          document.getElementById('walletBalance').textContent = balance;
          showToast('Balance refreshed');
        } catch (e) {
          showToast('Failed to refresh balance');
          console.error(e);
        }
      }
    });
  }
  
  // Copy receive address button - using ID
  const copyReceiveBtn = document.getElementById('copyReceiveAddressBtn');
  if (copyReceiveBtn) copyReceiveBtn.addEventListener('click', () => copyToClipboard('receiveAddress', 'Address copied!'));
  
  // Copy wallet info buttons - using IDs
  const copyWalletAddressBtn = document.getElementById('copyWalletAddressBtn');
  const copyWalletPublicKeyBtn = document.getElementById('copyWalletPublicKeyBtn');
  if (copyWalletAddressBtn) copyWalletAddressBtn.addEventListener('click', () => copyToClipboard('walletAddress', 'Address copied!'));
  if (copyWalletPublicKeyBtn) copyWalletPublicKeyBtn.addEventListener('click', () => copyToClipboard('walletPublicKey', 'Public key copied!'));
  
  // Reimport button - using ID
  const reimportBtn = document.getElementById('reimportWalletBtn');
  if (reimportBtn) reimportBtn.addEventListener('click', reimportWallet);
  
  console.log('[Event Binders] All event listeners bound successfully');
}
