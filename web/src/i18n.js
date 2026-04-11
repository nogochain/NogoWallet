/**
 * Internationalization (i18n) Module
 * Production-grade language switching for NogoWallet
 */

// Translation data
const translations = {
  zh: {
    // Header
    'header.wallet': '钱包',
    'header.explorer': '浏览器',
    'header.settings': '设置',
    
    // Welcome Section
    'welcome.title': 'NogoChain Wallet',
    'welcome.subtitle': '安全且去中心化的数字资产管理',
    'welcome.create': '创建新钱包',
    'welcome.create.desc': '生成新的安全钱包，包含 BIP39 助记词短语',
    'welcome.import': '导入钱包',
    'welcome.import.desc': '使用助记词或私钥恢复现有钱包',
    
    // Create Wallet Step 1
    'create.step1.title': '🎯 生成新钱包',
    'create.step1.desc': '使用 BIP39 标准助记词短语和 Ed25519 密钥对创建新钱包',
    'create.generate': '✨ 生成钱包',
    
    // Create Wallet Step 2
    'create.step2.success': '✅ 钱包生成成功！',
    'create.step2.backup': '请备份您的助记词短语和私钥。',
    'create.mnemonic.title': '📝 助记词短语 (请抄写下来)',
    'create.mnemonic.copy': '📋 复制助记词',
    'create.privatekey.title': '🔑 私钥 (Base64 格式 - 也需要备份)',
    'create.privatekey.copy': '📋 复制私钥',
    'create.security.title': '⚠️ 重要安全提示：',
    'create.security.tip1': '按顺序将助记词短语抄写在纸上',
    'create.security.tip2': '存放在安全的地方（保险箱、保险柜等）',
    'create.security.tip3': '不要截图、通过电子邮件或消息应用发送',
    'create.security.tip4': '丢失助记词 = 永久失去对资产的访问权',
    'create.security.tip5': '任何获得助记词的人都可以盗取您的资金',
    'create.details.title': '📍 钱包详情',
    'create.details.address': '地址:',
    'create.details.pubkey': '公钥:',
    'create.password.title': '🔐 设置钱包密码',
    'create.password.label': '密码:',
    'create.password.confirm': '确认密码:',
    'create.password.error': '密码不匹配！',
    'create.password.submit': '✅ 我已备份 - 设置密码并开始使用',
    
    // Create Wallet
    'create.tab': '创建钱包',
    'create.back': '返回欢迎页',
    'create.generate.title': '🎯 生成新钱包',
    'create.generate.desc': '使用 BIP39 标准助记词短语和 Ed25519 密钥对创建新钱包',
    'create.generate.btn': '✨ 生成钱包',
    'create.success.title': '✅ 钱包生成成功！',
    'create.success.desc': '请备份您的助记词短语和私钥。',
    'create.mnemonic.label': '📝 助记词短语 (请抄写下来)',
    'create.mnemonic.copy': '📋 复制助记词',
    'create.warning.title': '⚠️ 重要安全提示：',
    'create.warning.1': '按顺序将助记词短语抄写在纸上',
    'create.warning.2': '存放在安全的地方（保险箱、保险柜等）',
    'create.warning.3': '不要截图、通过电子邮件或消息应用发送',
    'create.warning.4': '丢失助记词 = 永久失去对资产的访问权',
    'create.warning.5': '任何获得助记词的人都可以盗取您的资金',
    'create.details.title': '📍 钱包详情',
    'create.details.address': '地址:',
    'create.details.pubkey': '公钥:',
    'create.password.title': '🔐 设置钱包密码',
    'create.password.label1': '密码:',
    'create.password.placeholder1': '输入强密码',
    'create.password.label2': '确认密码:',
    'create.password.placeholder2': '确认您的密码',
    'create.password.error': '密码不匹配！',
    'create.password.minlength': '密码必须至少 8 个字符',
    'create.password.input': '请输入两个密码字段',
    'create.save.btn': '✅ 我已备份 - 设置密码并开始使用',
    
    // Import Wallet
    'import.tab': '导入钱包',
    'import.back': '返回欢迎页',
    'import.method.title': '🔑 导入方式：',
    'import.method.desc': '选择以下一种方式来恢复您的钱包',
    'import.forgot.title': '⚠️ 忘记密码？',
    'import.forgot.desc': '如果您忘记了密码，可以使用助记词短语或私钥导入钱包并设置新密码。',
    'import.forgot.note': '您的资金是安全的 - 您只需要备份短语！',
    'import.mnemonic.label': '助记词短语 (12 个单词，空格分隔):',
    'import.mnemonic.placeholder': 'abandon ability able about above absent absorb abstract absurd abuse access accident',
    'import.or': '— 或 —',
    'import.private.label': '私钥 (Base64 格式):',
    'import.private.placeholder': '输入您的 Base64 格式私钥...',
    'import.password.title': '🔐 设置新密码',
    'import.password.note': '可选但推荐。如果不想加密钱包可留空。',
    'import.password.label1': '密码:',
    'import.password.placeholder1': '输入强密码',
    'import.password.label2': '确认密码:',
    'import.password.placeholder2': '确认您的密码',
    'import.btn': '📥 导入钱包',
    
    // Wallet Dashboard
    'wallet.tab.send': '发送',
    'wallet.tab.receive': '接收',
    'wallet.tab.transactions': '交易',
    'wallet.tab.info': '信息',
    'wallet.tab.reimport': '重新导入',
    'wallet.tab.lock': '🔒 锁定',
    'wallet.tab.logout': '退出',
    'wallet.balance.label': '可用余额',
    'wallet.send.title': '发送 NOGO',
    'wallet.send.address': '收款地址:',
    'wallet.send.address.placeholder': 'NOGO...',
    'wallet.send.amount': '金额 (NOGO):',
    'wallet.send.btn': '🚀 发送交易',
    'wallet.receive.title': '接收 NOGO',
    'wallet.receive.address': '您的收款地址:',
    'wallet.receive.copy': '📋 复制地址',
    'wallet.receive.qr': '扫描二维码接收 NOGO',
    'wallet.info.title': '钱包信息',
    'wallet.info.address': '地址:',
    'wallet.info.pubkey': '公钥:',
    'wallet.info.nonce': 'Nonce:',
    'wallet.transactions.title': '交易历史',
    'wallet.transactions.loading': '加载中...',
    'wallet.transactions.empty': '暂无交易',
    'wallet.transactions.type': '类型',
    'wallet.transactions.status': '状态',
    'wallet.transactions.amount': '金额',
    'wallet.transactions.fee': '手续费',
    'wallet.transactions.time': '时间',
    'wallet.transactions.coinbase': '🪙 Coinbase',
    'wallet.transactions.transfer': '💸 转账',
    'wallet.transactions.confirmed': '✅ 已确认',
    'wallet.transactions.pending': '⏳ 待处理',
    
    // Re-import Wallet
    'wallet.reimport.title': '🔄 重新导入钱包',
    'wallet.reimport.desc': '重新导入钱包功能说明',
    'wallet.reimport.desc.text': '如果您忘记了密码或需要更新助记词/私钥，可以使用此功能重新导入钱包。',
    'wallet.reimport.warning': '⚠️ 重要提示：',
    'wallet.reimport.warning.text': '此操作将用新的助记词/私钥替换当前钱包。请确保您已备份新的助记词或私钥！',
    'wallet.reimport.btn': '🔄 重新导入钱包',
    
    // Language switcher
    'lang.zh': '中文',
    'lang.en': 'English',
    
    // Node Status
    'node.status.connected': '✓ 已连接',
    'node.status.disconnected': '✗ 节点未连接',
    'node.status.checking': '检测中...',
    'node.selector.title': '选择节点',
    'node.selector.local': '🏠 本地节点 (localhost:8080)',
    'node.selector.main': '🌐 主节点 (main.nogochain.org)',
    'node.selector.wallet': '💼 钱包节点 (wallet.nogochain.org)',
    'node.selector.backup': '🔄 备用节点 (node.nogochain.org)',
    'node.selector.tip': '💡 优先使用本地节点，如果不可用则自动切换到远程节点',
    'node.selector.switch': '🔄 切换',
    
    // Common
    'common.copied': '✓ {label} copied to clipboard!',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Toast messages
    'toast.generating': '⏳ 生成钱包中...',
    'toast.generated': '✅ 钱包生成成功！',
    'toast.generation.failed': '❌ 生成失败：',
    'toast.encrypt.success': '✅ 钱包加密保存成功！',
    'toast.encrypt.failed': '❌ 加密钱包失败，请重试',
    'toast.import.success': '✅ 助记词导入成功！(未加密)',
    'toast.import.success.encrypted': '✅ 钱包导入并加密成功！',
    'toast.import.failed': '❌ 导入失败：',
    'toast.import.invalid': '❌ 无效的助记词短语',
    'toast.import.private.success': '✅ 私钥导入成功！(未加密)',
    'toast.import.private.success.encrypted': '✅ 私钥导入并加密成功！',
    'toast.import.private.failed': '❌ 私钥无效：',
    'toast.import.private.invalid': '❌ 私钥长度无效 (应为 32 字节)',
    'toast.send.creating': '⏳ 创建交易中...',
    'toast.send.success': '✅ 交易已发送！TxID: ',
    'toast.send.failed': '❌ 发送失败：',
    'toast.send.balance': '❌ 余额不足',
    'toast.send.address.invalid': '❌ 收款地址无效',
    'toast.send.amount.invalid': '❌ 金额无效',
    'toast.send.wallet.notloaded': '❌ 钱包未加载',
    'toast.locked': '🔒 钱包已锁定',
    'toast.logout': '👋 已退出！',
    'toast.balance.failed': '⚠️ 加载余额失败',
    'toast.qr.failed': '生成二维码失败',
    
    // Logout confirmation
    'logout.confirm': '确定要退出吗？您需要重新输入密码或导入钱包。'
  },
  
  en: {
    // Header
    'header.wallet': 'Wallet',
    'header.explorer': 'Explorer',
    'header.settings': 'Settings',
    
    // Welcome Section
    'welcome.title': 'NogoChain Wallet',
    'welcome.subtitle': 'Secure and Decentralized Digital Asset Management',
    'welcome.create': 'Create New Wallet',
    'welcome.create.desc': 'Generate a new secure wallet with BIP39 mnemonic phrase',
    'welcome.import': 'Import Wallet',
    'welcome.import.desc': 'Restore existing wallet using mnemonic or private key',
    
    // Create Wallet Step 1
    'create.step1.title': '🎯 Generate New Wallet',
    'create.step1.desc': 'Create new wallet using BIP39 standard mnemonic and Ed25519 key pair',
    'create.generate': '✨ Generate Wallet',
    
    // Create Wallet Step 2
    'create.step2.success': '✅ Wallet Generated Successfully!',
    'create.step2.backup': 'Please backup your mnemonic phrase and private key.',
    'create.mnemonic.title': '📝 Mnemonic Phrase (Write it down)',
    'create.mnemonic.copy': '📋 Copy Mnemonic',
    'create.privatekey.title': '🔑 Private Key (Base64 Format - Also Backup Required)',
    'create.privatekey.copy': '📋 Copy Private Key',
    'create.security.title': '⚠️ Important Security Notice:',
    'create.security.tip1': 'Write down the mnemonic phrase in order on paper',
    'create.security.tip2': 'Store in a secure place (safe, safety deposit box, etc.)',
    'create.security.tip3': 'Do NOT screenshot, email, or send via messaging apps',
    'create.security.tip4': 'Losing mnemonic = Permanent loss of access to assets',
    'create.security.tip5': 'Anyone with the mnemonic can steal your funds',
    'create.details.title': '📍 Wallet Details',
    'create.details.address': 'Address:',
    'create.details.pubkey': 'Public Key:',
    'create.password.title': '🔐 Set Wallet Password',
    'create.password.label': 'Password:',
    'create.password.confirm': 'Confirm Password:',
    'create.password.error': 'Passwords do not match!',
    'create.password.submit': '✅ I Have Backed Up - Set Password and Start Using',
    
    // Create Wallet
    'create.tab': 'Create Wallet',
    'create.back': 'Back to Welcome',
    'create.generate.title': '🎯 Generate New Wallet',
    'create.generate.desc': 'Create new wallet using BIP39 standard mnemonic and Ed25519 key pair',
    'create.generate.btn': '✨ Generate Wallet',
    'create.success.title': '✅ Wallet Generated Successfully!',
    'create.success.desc': 'Please backup your mnemonic phrase and private key.',
    'create.mnemonic.label': '📝 Mnemonic Phrase (Write it down)',
    'create.mnemonic.copy': '📋 Copy Mnemonic',
    'create.warning.title': '⚠️ Important Security Notice:',
    'create.warning.1': 'Write down the mnemonic phrase in order on paper',
    'create.warning.2': 'Store in a secure place (safe, safety deposit box, etc.)',
    'create.warning.3': 'Do NOT screenshot, email, or send via messaging apps',
    'create.warning.4': 'Losing mnemonic = Permanent loss of access to assets',
    'create.warning.5': 'Anyone with the mnemonic can steal your funds',
    'create.details.title': '📍 Wallet Details',
    'create.details.address': 'Address:',
    'create.details.pubkey': 'Public Key:',
    'create.password.title': '🔐 Set Wallet Password',
    'create.password.label1': 'Password:',
    'create.password.placeholder1': 'Enter a strong password',
    'create.password.label2': 'Confirm Password:',
    'create.password.placeholder2': 'Confirm your password',
    'create.password.error': 'Passwords do not match!',
    'create.password.minlength': 'Password must be at least 8 characters',
    'create.password.input': 'Please enter both password fields',
    'create.save.btn': '✅ I Have Backed Up - Set Password and Start Using',
    
    // Import Wallet
    'import.tab': 'Import Wallet',
    'import.back': 'Back to Welcome',
    'import.method.title': '🔑 Import Method:',
    'import.method.desc': 'Choose one of the following methods to restore your wallet',
    'import.forgot.title': '⚠️ Forgot Password?',
    'import.forgot.desc': 'If you forgot your password, you can import wallet using mnemonic phrase or private key and set a new password.',
    'import.forgot.note': 'Your funds are safe - you only need the backup phrase!',
    'import.mnemonic.label': 'Mnemonic Phrase (12 words, space-separated):',
    'import.mnemonic.placeholder': 'abandon ability able about above absent absorb abstract absurd abuse access accident',
    'import.or': '— OR —',
    'import.private.label': 'Private Key (Base64 format):',
    'import.private.placeholder': 'Enter your Base64 format private key...',
    'import.password.title': '🔐 Set New Password',
    'import.password.note': 'Optional but recommended. Leave blank if you don\'t want to encrypt wallet.',
    'import.password.label1': 'Password:',
    'import.password.placeholder1': 'Enter a strong password',
    'import.password.label2': 'Confirm Password:',
    'import.password.placeholder2': 'Confirm your password',
    'import.btn': '📥 Import Wallet',
    
    // Wallet Dashboard
    'wallet.tab.send': 'Send',
    'wallet.tab.receive': 'Receive',
    'wallet.tab.transactions': 'Transactions',
    'wallet.tab.info': 'Info',
    'wallet.tab.reimport': 'Re-import',
    'wallet.tab.lock': '🔒 Lock',
    'wallet.tab.logout': 'Logout',
    'wallet.balance.label': 'Available Balance',
    'wallet.send.title': 'Send NOGO',
    'wallet.send.address': 'Recipient Address:',
    'wallet.send.address.placeholder': 'NOGO...',
    'wallet.send.amount': 'Amount (NOGO):',
    'wallet.send.btn': '🚀 Send Transaction',
    'wallet.receive.title': 'Receive NOGO',
    'wallet.receive.address': 'Your Receiving Address:',
    'wallet.receive.copy': '📋 Copy Address',
    'wallet.receive.qr': 'Scan QR to receive NOGO',
    'wallet.info.title': 'Wallet Information',
    'wallet.info.address': 'Address:',
    'wallet.info.pubkey': 'Public Key:',
    'wallet.info.nonce': 'Nonce:',
    'wallet.transactions.title': 'Transaction History',
    'wallet.transactions.loading': 'Loading...',
    'wallet.transactions.empty': 'No transactions',
    'wallet.transactions.type': 'Type',
    'wallet.transactions.status': 'Status',
    'wallet.transactions.amount': 'Amount',
    'wallet.transactions.fee': 'Fee',
    'wallet.transactions.time': 'Time',
    'wallet.transactions.coinbase': '🪙 Coinbase',
    'wallet.transactions.transfer': '💸 Transfer',
    'wallet.transactions.confirmed': '✅ Confirmed',
    'wallet.transactions.pending': '⏳ Pending',
    
    // Re-import Wallet
    'wallet.reimport.title': '🔄 Re-import Wallet',
    'wallet.reimport.desc': 'Re-import Wallet Instructions',
    'wallet.reimport.desc.text': 'If you forgot your password or need to update mnemonic/private key, you can use this function to re-import your wallet.',
    'wallet.reimport.warning': '⚠️ Important Notice:',
    'wallet.reimport.warning.text': 'This operation will replace the current wallet with new mnemonic/private key. Please ensure you have backed up the new mnemonic or private key!',
    'wallet.reimport.btn': '🔄 Re-import Wallet',
    
    // Node Status
    'node.status.connected': '✓ Connected',
    'node.status.disconnected': '✗ Node Disconnected',
    'node.status.checking': 'Checking...',
    'node.selector.title': 'Select Node',
    'node.selector.local': '🏠 Local Node (localhost:8080)',
    'node.selector.main': '🌐 Main Node (main.nogochain.org)',
    'node.selector.wallet': '💼 Wallet Node (wallet.nogochain.org)',
    'node.selector.backup': '🔄 Backup Node (node.nogochain.org)',
    'node.selector.tip': '💡 Prefer local node, auto-switch to remote if unavailable',
    'node.selector.switch': '🔄 Switch',
    
    // Language switcher
    'lang.zh': '中文',
    'lang.en': 'English',
    
    // Common
    'common.copied': '✓ {label} copied to clipboard!',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.copy': 'Copy',
    'common.address': 'Address',
    'common.publicKey': 'Public Key',
    'common.privateKey': 'Private Key',
    'common.mnemonic': 'Mnemonic',
    
    // Toast messages
    'toast.generating': '⏳ Generating wallet...',
    'toast.generated': '✅ Wallet generated successfully!',
    'toast.generation.failed': '❌ Generation failed: ',
    'toast.encrypt.success': '✅ Wallet encrypted and saved successfully!',
    'toast.encrypt.failed': '❌ Failed to encrypt wallet, please try again',
    'toast.import.success': '✅ Mnemonic imported successfully! (Unencrypted)',
    'toast.import.success.encrypted': '✅ Wallet imported and encrypted successfully!',
    'toast.import.failed': '❌ Import failed: ',
    'toast.import.invalid': '❌ Invalid mnemonic phrase',
    'toast.import.private.success': '✅ Private key imported successfully! (Unencrypted)',
    'toast.import.private.success.encrypted': '✅ Private key imported and encrypted successfully!',
    'toast.import.private.failed': '❌ Invalid private key: ',
    'toast.import.private.invalid': '❌ Invalid private key length (should be 32 bytes)',
    'toast.send.creating': '⏳ Creating transaction...',
    'toast.send.success': '✅ Transaction sent! TxID: ',
    'toast.send.failed': '❌ Send failed: ',
    'toast.send.balance': '❌ Insufficient balance',
    'toast.send.address.invalid': '❌ Invalid recipient address',
    'toast.send.amount.invalid': '❌ Invalid amount',
    'toast.send.wallet.notloaded': '❌ Wallet not loaded',
    'toast.locked': '🔒 Wallet locked',
    'toast.logout': '👋 Logged out!',
    'toast.balance.failed': '⚠️ Failed to load balance',
    'toast.qr.failed': 'Failed to generate QR code',
    
    // Logout confirmation
    'logout.confirm': 'Are you sure you want to logout? You will need to re-enter password or import wallet.',
    
    // Password validation
    'create.password.input': 'Please enter both password fields',
    'create.password.minlength': 'Password must be at least 8 characters',
    'create.password.error': 'Passwords do not match!'
  }
};

// Current language - Default to English
// Clear localStorage for testing
localStorage.removeItem('nogoWalletLang');
let currentLang = 'en';

// Debug: log available translation keys
console.log('[i18n] Available languages:', Object.keys(translations));
console.log('[i18n] English keys count:', Object.keys(translations.en || {}).length);
console.log('[i18n] Chinese keys count:', Object.keys(translations.zh || {}).length);
console.log('[i18n] Current language:', currentLang);
console.log('[i18n] Sample key test:', translations.en?.['welcome.title']);

/**
 * Get translation by key
 */
export function t(key, params = {}) {
  const lang = translations[currentLang];
  
  // Direct lookup for flat key structure (e.g., 'welcome.title')
  let value = lang?.[key];
  
  if (value === undefined) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  // Replace parameters
  if (params && typeof value === 'string') {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }
  }
  
  return value;
}

/**
 * Get current language
 */
export function getCurrentLang() {
  return currentLang;
}

/**
 * Set language
 */
export function setLang(lang) {
  if (['zh', 'en'].includes(lang)) {
    currentLang = lang;
    localStorage.setItem('nogoWalletLang', lang);
    document.documentElement.lang = lang;
    
    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }
}

/**
 * Initialize i18n
 */
export function initI18n() {
  setLang(currentLang);
}

/**
 * Get language name
 */
export function getLangName(lang) {
  return lang === 'zh' ? '中文' : 'English';
}
