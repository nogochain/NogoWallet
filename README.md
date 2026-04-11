# NogoWallet - NogoChain Cross-Platform Wallet
# NogoWallet - NogoChain 跨平台钱包

Production-grade cross-platform wallet application supporting Tauri desktop and PWA.

生产级跨平台钱包应用，支持 Tauri 桌面端和 PWA。

## Features
## 功能特性

### Core Features
### 核心功能
- ✅ BIP39/BIP32/BIP44 compatible key generation and derivation
- ✅ BIP39/BIP32/BIP44 兼容的密钥生成和派生
- ✅ Ed25519 digital signature algorithm
- ✅ Ed25519 数字签名算法
- ✅ AES-256-GCM encrypted storage
- ✅ AES-256-GCM 加密存储
- ✅ PBKDF2 key derivation (100,000 iterations)
- ✅ PBKDF2 密钥派生 (100,000 次迭代)
- ✅ Multi-wallet management
- ✅ 多钱包管理
- ✅ Transaction signing and broadcasting
- ✅ 交易签名和广播
- ✅ Balance query and transaction history
- ✅ 余额查询和交易历史

### Security Features
### 安全特性
- Private keys never appear outside memory
- 私钥永不出现在内存之外
- Encrypted storage of sensitive data
- 敏感数据加密存储
- Memory attack prevention (timely clearing of sensitive data)
- 防内存攻击 (及时清除敏感数据)
- Random number generation using CSPRNG
- 随机数生成使用 CSPRNG
- Password-protected wallet unlocking
- 密码保护钱包解锁

### Platform Support
### 平台支持
- 🖥️ **Tauri Desktop**: Windows/macOS/Linux
- 🖥️ **Tauri 桌面端**: Windows/macOS/Linux
- 🌐 **PWA**: Progressive Web App with offline support
- 🌐 **PWA**: 渐进式 Web 应用，支持离线访问
- 📱 **Mobile**: Coming soon via Capacitor
- 📱 **移动端**: 后续通过 Capacitor 支持

## Project Structure
## 项目结构

```
NogoWallet/
├── core/               # Core cryptography module / 核心加密模块
│   └── src/
│       └── crypto.js   # BIP39/BIP32/BIP44, Ed25519
├── adapter/            # Platform adapter layer / 平台适配层
│   └── src/
│       └── storage.js  # Web/Tauri storage adapter / Web/Tauri 存储适配器
├── service/            # Service layer / 服务层
│   └── src/
│       └── sdk.js      # NogoChain SDK integration / NogoChain SDK 集成
├── web/                # Web/PWA frontend / Web/PWA 前端
│   ├── src/
│   │   └── main.js     # Main application logic / 主应用逻辑
│   ├── public/
│   │   ├── manifest.json  # PWA manifest / PWA 清单
│   │   └── sw.js          # Service Worker
│   ├── index.html
│   └── vite.config.js
├── desktop/            # Tauri desktop app / Tauri 桌面端
│   └── src-tauri/
│       ├── src/
│       │   └── main.rs # Rust backend / Rust 后端
│       ├── Cargo.toml
│       └── tauri.conf.json
├── reports/            # Reports and documentation / 报告和文档
└── package.json
```

## Installation and Development
## 安装和开发

### Prerequisites
### 前置要求

- Node.js >= 18.0.0
- Rust >= 1.70.0 (for Tauri desktop)
- Rust >= 1.70.0 (Tauri 桌面端)
- npm or yarn
- npm 或 yarn

### Install Dependencies
### 安装依赖

```bash
cd NogoWallet
npm install
```

### Development Mode
### 开发模式

#### Web/PWA Development
#### Web/PWA 开发
```bash
npm run dev
# Access http://localhost:3000
# 访问 http://localhost:3000
```

#### Tauri Desktop Development
#### Tauri 桌面端开发
```bash
npm run tauri:dev
```

### Build Production Version
### 构建生产版本

#### Web/PWA Build
#### Web/PWA 构建
```bash
npm run build
# Output to web/dist/
# 输出到 web/dist/
```

#### Tauri Desktop Build
#### Tauri 桌面端构建
```bash
npm run tauri:build
# Output to desktop/src-tauri/target/release/
# 输出到 desktop/src-tauri/target/release/
```

### Testing
### 测试

```bash
npm test
npm run test:coverage
```

### Code Linting
### 代码检查

```bash
npm run lint
npm run lint:fix
```

## Usage Guide
## 使用指南

### Create New Wallet
### 创建新钱包

1. Click "Create New Wallet"
1. 点击"创建新钱包"
2. Generate mnemonic phrase (12 words)
2. 生成助记词短语 (12 词)
3. **Important**: Write down the mnemonic and store it securely
3. **重要**: 抄写助记词并安全保存
4. Set a strong password to encrypt the wallet
4. 设置强密码加密钱包
5. Start using
5. 开始使用

### Import Wallet
### 导入钱包

1. Click "Import Wallet"
1. 点击"导入钱包"
2. Enter mnemonic phrase or private key
2. 输入助记词短语或私钥
3. Set new password (optional)
3. 设置新密码 (可选)
4. Import successful
4. 导入成功

### Send Transaction
### 发送交易

1. Go to "Send" tab
1. 进入"发送"标签
2. Enter recipient address
2. 输入收款地址
3. Enter amount
3. 输入金额
4. Confirm transaction details
4. 确认交易详情
5. Sign and broadcast
5. 签名并广播

### Receive Funds
### 接收资金

1. Go to "Receive" tab
1. 进入"接收"标签
2. Copy address or scan QR code
2. 复制地址或扫描二维码
3. Share with payer
3. 分享给付款方

## Technical Specifications
## 技术规格

### Cryptographic Standards
### 加密标准

- **Mnemonic**: BIP39 (2048 wordlist, 128-bit entropy)
- **助记词**: BIP39 (2048 词表，128 位熵)
- **Key Derivation**: BIP32 (HMAC-SHA512)
- **密钥派生**: BIP32 (HMAC-SHA512)
- **Derivation Path**: BIP44 (m/44'/60'/0'/0/0)
- **派生路径**: BIP44 (m/44'/60'/0'/0/0)
- **Signature Algorithm**: Ed25519
- **签名算法**: Ed25519
- **Encryption Algorithm**: AES-256-GCM
- **加密算法**: AES-256-GCM
- **Key Derivation Function**: PBKDF2-HMAC-SHA256 (100,000 iterations)
- **密钥派生函数**: PBKDF2-HMAC-SHA256 (100,000 次迭代)

### Address Format
### 地址格式

```
NOGO + Version(1 byte) + SHA256(PublicKey)(32 bytes) + Checksum(4 bytes)
Version: 0x00
Checksum: SHA256(version + hash)[0:4]
```

### Performance Metrics
### 性能指标

- Cold start: <2s (desktop), <3s (mobile)
- 冷启动：<2 秒 (桌面), <3 秒 (移动)
- Transaction signing: <100ms
- 交易签名：<100 毫秒
- Balance query: <2s (excluding network latency)
- 余额查询：<2 秒 (网络延迟除外)

## Security Recommendations
## 安全建议

1. **Backup Mnemonic**: Write down the mnemonic on paper and store it in a secure place
1. **备份助记词**: 将助记词抄写在纸上，存放在安全地方
2. **No Screenshots**: Never take screenshots or store mnemonic digitally
2. **不要截图**: 切勿截图或通过数字方式存储助记词
3. **Strong Password**: Use at least 8 characters with complexity
3. **强密码**: 使用至少 8 位复杂密码
4. **Regular Backups**: Backup wallet data regularly
4. **定期备份**: 定期备份钱包数据
5. **Beware of Phishing**: Only download from official sources
5. **警惕钓鱼**: 只从官方渠道下载应用

## Troubleshooting
## 故障排除

### FAQ
### 常见问题

**Q: What if I forget my password?**
**Q: 忘记密码怎么办？**

A: Re-import the wallet using mnemonic phrase or private key and set a new password.
A: 使用助记词短语或私钥重新导入钱包，设置新密码。

**Q: Mnemonic import failed?**
**Q: 助记词导入失败？**

A: Ensure the mnemonic order is correct, words are separated by spaces, and there are no typos.
A: 确保助记词顺序正确，单词间用空格分隔，无拼写错误。

**Q: Transaction stuck in pending?**
**Q: 交易一直 pending？**

A: Check network status, may need higher transaction fee.
A: 检查网络状态，可能需要更高手续费。

### Log Locations
### 日志位置

- **Web/PWA**: Browser developer tools console
- **Web/PWA**: 浏览器开发者工具控制台
- **Tauri**: 
  - Windows: `%APPDATA%\NogoWallet\logs\`
  - macOS: `~/Library/Logs/NogoWallet/`
  - Linux: `~/.local/share/NogoWallet/logs/`

## Contributing
## 贡献

Contributions are welcome! Please follow these steps:

欢迎贡献代码！请遵循以下步骤：

1. Fork the project
1. Fork 项目
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
5. 开启 Pull Request

## License
## 许可证

MIT License - See LICENSE file for details

MIT License - 详见 LICENSE 文件

## Contact
## 联系方式

- GitHub: https://github.com/nogochain/nogo
- GitHub: https://github.com/nogochain/nogo
- Documentation: https://github.com/nogochain/nogo/docs
- 文档：https://github.com/nogochain/nogo/docs
- Email: hello@eiyaro.org
- 邮箱：hello@eiyaro.org

## Version History
## 版本历史

### v1.0.0 (2026-04-10)
- Initial release
- 初始版本
- Core cryptography module implementation
- 核心加密模块实现
- Secure storage module implementation
- 安全存储模块实现
- SDK integration
- SDK 集成
- UI porting
- UI 移植
- Tauri desktop configuration
- Tauri 桌面端配置
- PWA configuration
- PWA 配置

## Roadmap
## 路线图

- [ ] v1.1.0: Multi-wallet management
- [ ] v1.1.0: 多钱包管理
- [ ] v1.2.0: Batch transaction sending
- [ ] v1.2.0: 交易批量发送
- [ ] v1.3.0: Proposal voting feature
- [ ] v1.3.0: 提案投票功能
- [ ] v2.0.0: Mobile support (Capacitor)
- [ ] v2.0.0: 移动端支持 (Capacitor)
- [ ] v2.1.0: Hardware wallet support
- [ ] v2.1.0: 硬件钱包支持

---

© 2026 NogoChain Foundation. All rights reserved.
