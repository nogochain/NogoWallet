# NogoWallet - NogoChain 跨平台钱包

生产级跨平台钱包应用，支持 Tauri 桌面端和 PWA。

## 功能特性

### 核心功能
- ✅ BIP39/BIP32/BIP44 兼容的密钥生成和派生
- ✅ Ed25519 数字签名算法
- ✅ AES-256-GCM 加密存储
- ✅ PBKDF2 密钥派生 (100,000 次迭代)
- ✅ 多钱包管理
- ✅ 交易签名和广播
- ✅ 余额查询和交易历史

### 安全特性
- 私钥永不出现在内存之外
- 敏感数据加密存储
- 防内存攻击 (及时清除敏感数据)
- 随机数生成使用 CSPRNG
- 密码保护钱包解锁

### 平台支持
- 🖥️ **Tauri 桌面端**: Windows/macOS/Linux
- 🌐 **PWA**: 渐进式 Web 应用，支持离线访问
- 📱 **移动端**: 后续通过 Capacitor 支持

## 项目结构

```
NogoWallet/
├── core/               # 核心加密模块
│   └── src/
│       └── crypto.js   # BIP39/BIP32/BIP44, Ed25519
├── adapter/            # 平台适配层
│   └── src/
│       └── storage.js  # Web/Tauri 存储适配器
├── service/            # 服务层
│   └── src/
│       └── sdk.js      # NogoChain SDK 集成
├── web/                # Web/PWA 前端
│   ├── src/
│   │   └── main.js     # 主应用逻辑
│   ├── public/
│   │   ├── manifest.json  # PWA 清单
│   │   └── sw.js          # Service Worker
│   ├── index.html
│   └── vite.config.js
├── desktop/            # Tauri 桌面端
│   └── src-tauri/
│       ├── src/
│       │   └── main.rs # Rust 后端
│       ├── Cargo.toml
│       └── tauri.conf.json
├── reports/            # 报告和文档
└── package.json
```

## 安装和开发

### 前置要求

- Node.js >= 18.0.0
- Rust >= 1.70.0 (Tauri 桌面端)
- npm 或 yarn

### 安装依赖

```bash
cd NogoWallet
npm install
```

### 开发模式

#### Web/PWA 开发
```bash
npm run dev
# 访问 http://localhost:3000
```

#### Tauri 桌面端开发
```bash
npm run tauri:dev
```

### 构建生产版本

#### Web/PWA 构建
```bash
npm run build
# 输出到 web/dist/
```

#### Tauri 桌面端构建
```bash
npm run tauri:build
# 输出到 desktop/src-tauri/target/release/
```

### 测试

```bash
npm test
npm run test:coverage
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 使用指南

### 创建新钱包

1. 点击"创建新钱包"
2. 生成助记词短语 (12 词)
3. **重要**: 抄写助记词并安全保存
4. 设置强密码加密钱包
5. 开始使用

### 导入钱包

1. 点击"导入钱包"
2. 输入助记词短语或私钥
3. 设置新密码 (可选)
4. 导入成功

### 发送交易

1. 进入"发送"标签
2. 输入收款地址
3. 输入金额
4. 确认交易详情
5. 签名并广播

### 接收资金

1. 进入"接收"标签
2. 复制地址或扫描二维码
3. 分享给付款方

## 技术规格

### 加密标准

- **助记词**: BIP39 (2048 词表，128 位熵)
- **密钥派生**: BIP32 (HMAC-SHA512)
- **派生路径**: BIP44 (m/44'/60'/0'/0/0)
- **签名算法**: Ed25519
- **加密算法**: AES-256-GCM
- **密钥派生函数**: PBKDF2-HMAC-SHA256 (100,000 次迭代)

### 地址格式

```
NOGO + Version(1 byte) + SHA256(PublicKey)(32 bytes) + Checksum(4 bytes)
Version: 0x00
Checksum: SHA256(version + hash)[0:4]
```

### 性能指标

- 冷启动：<2 秒 (桌面), <3 秒 (移动)
- 交易签名：<100 毫秒
- 余额查询：<2 秒 (网络延迟除外)

## 安全建议

1. **备份助记词**: 将助记词抄写在纸上，存放在安全地方
2. **不要截图**: 切勿截图或通过数字方式存储助记词
3. **强密码**: 使用至少 8 位复杂密码
4. **定期备份**: 定期备份钱包数据
5. **警惕钓鱼**: 只从官方渠道下载应用

## 故障排除

### 常见问题

**Q: 忘记密码怎么办？**
A: 使用助记词短语或私钥重新导入钱包，设置新密码。

**Q: 助记词导入失败？**
A: 确保助记词顺序正确，单词间用空格分隔，无拼写错误。

**Q: 交易一直 pending？**
A: 检查网络状态，可能需要更高手续费。

### 日志位置

- **Web/PWA**: 浏览器开发者工具控制台
- **Tauri**: 
  - Windows: `%APPDATA%\NogoWallet\logs\`
  - macOS: `~/Library/Logs/NogoWallet/`
  - Linux: `~/.local/share/NogoWallet/logs/`

## 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 联系方式

- 官网：https://nogochain.com
- 文档：https://docs.nogochain.com
- GitHub: https://github.com/nogochain/nogochain
- 邮箱：support@nogochain.com

## 版本历史

### v1.0.0 (2026-04-10)
- 初始版本
- 核心加密模块实现
- 安全存储模块实现
- SDK 集成
- UI 移植
- Tauri 桌面端配置
- PWA 配置

## 路线图

- [ ] v1.1.0: 多钱包管理
- [ ] v1.2.0: 交易批量发送
- [ ] v1.3.0: 提案投票功能
- [ ] v2.0.0: 移动端支持 (Capacitor)
- [ ] v2.1.0: 硬件钱包支持

---

© 2026 NogoChain Foundation. All rights reserved.
