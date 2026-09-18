# PixZip 图片压缩工具 - SR-DevBox 开发者效率工具箱

```
SR-DevBox 开发者效率工具箱 - PixZip 图片压缩工具
@author     Zhu Rui
@website    https://srdevbox.com
@email      30501250@qq.com
@date       2026-09-18
@copyright  © 2026 Zhu Rui. All Rights Reserved.

本文件为 SR-DevBox 项目的组成部分，版权归作者 Zhu Rui 所有。
未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
```

---

## 📖 项目简介

**PixZip** 是 **SR-DevBox 开发者效率工具箱**旗下的纯前端图片压缩工具，面向前端开发者、UI 设计师与运维工程师。全程本地浏览器运行，图片数据**绝不上传服务器**。

支持 PNG / JPG / JPEG / GIF / SVG / WebP / ICO / BMP 批量压缩，三档压缩模式覆盖极致瘦身到无损交付的完整场景；独有**元数据清洗引擎**深度识别并清除 EXIF/XMP 隐私痕迹，统一重写软件溯源标识；整站拖入时保持完整目录层级打包输出。

---

## ✨ 核心特性

### 1. 三档压缩模式自由切换

| 模式 | 体积缩减 | 适用场景 |
| :--- | :--- | :--- |
| **⚡ 极致体积** | 最高节省 80% 空间 | 网页资源、H5 素材、小程序图片 |
| **💎 高保真** | 节省 35%~60% 空间 | 产品图、摄影照片、精细插画 |
| **🔒 真无损** | 节省 10%~25% 空间 | 设计原稿交付、工程测绘资产 |

- **极致体积**：`upng-js` k-d tree 感知量化 + Floyd-Steinberg 误差扩散抖动，32 位真彩色智能量化为带 Alpha 的 8 位 PNG-8；JPG/WebP 基于 Canvas 高质量重编（质量系数 80%）。颜色智能压缩，透明背景不损。
- **高保真**：质量系数调至 88%，写实真彩与高频细节保护。画质接近原图，适合照片素材。
- **真无损**：`pngjs` 最优 DEFLATE 重压缩（`deflateLevel: 9` + `Z_FILTERED` 策略），PSNR=∞，SSIM=1.0，像素矩阵位级绝对一致。适合设计交付。

所有模式均内置**体积安全兜底**：若压缩后不减反增，自动保留原文件，输出只减不增。

---

### 2. 元数据清洗引擎（EXIF 脱敏 · 软件溯源重写）

深度解析并刷新图片数据源，自动识别并清除：

- **EXIF / XMP 隐私痕迹**：制作软件（Adobe Photoshop、Illustrator、Figma 等）、拍摄设备型号、GPS 坐标、拍摄时间等。
- **PNG 文本块冗余信息**：`tEXt`、`iTXt`、`zTXt` 等软件写入的元数据块。

导出文件的软件标识统一重写为 **SR-DevBox PixZip** 溯源标记。

---

### 3. 多格式无损优化引擎

- **PNG**：扫描线差分过滤重构 + DEFLATE 9 / Strategy 3（`Z_FILTERED`）。
- **JPEG/JPG**：无损剥离 EXIF、拍摄参数、缩略图与 Photoshop IPTC 冗余元数据，SOS 图像熵编码流 100% 位级保持，可选保留 ICC 色彩配置文件。
- **SVG**：XML 矢量树无损精简，剥离注释、文档声明、Inkscape/Illustrator 冗余命名空间与多余空白。
- **WebP**：RIFF 容器优化，安全剥离 EXIF / XMP 扩展块，保持 VP8 / VP8L 像素流完整。
- **GIF 动图**：纯前端多帧重构与量化引擎（`omggif` + `upng-js`），完整保留全部帧序列、帧延迟、清除方式（disposal）、循环次数与透明通道，减容 30%~70%。

---

### 4. 整站目录拖入与递归扫描

通过 HTML5 `webkitGetAsEntry()` + 批量 `readEntries()` + `<input webkitdirectory>`，支持将**整个网站项目或多层级文件夹**直接拖入，自动深度递归扫描所有子目录中的图片资源，队列中按目录层级分组展示。

---

### 5. 双通道打包导出（目录结构完整保持）

1. **一键打包下载全部图片（ZIP）**：完整保留各级相对目录（如 `assets/images/header.png`），仅导出优化后的图片资产。
2. **打包下载整站项目（ZIP）**：保持完整网站代码结构，HTML/CSS/JS/字体原样保留，内部图片无缝替换为压缩后文件，自动识别并提示非图片文件。

具备全局打包互斥锁与实时进度反馈，防重入防崩溃。

---

### 6. 原图 / 压缩图全屏对比查看器

- **分割线拖拽对比**：中线垂直分割，左原图右压缩图，自由拖拽无缝裁切。
- **滚轮无级缩放 + 画布平移**：支持 0.2x ~ 10x 放大，以光标焦点自动坐标补偿，双图层像素级绝对重合对齐。
- **双角标体积提示**：左上角【原图 · X.XX MB】，右上角【压缩后 · Y.YY KB (-Z.Z%)】。
- 支持触屏手势拖拽、键盘 Esc 退出、双击重置居中。

---

### 7. 商业级代码混淆与防逆向加固

- 控制流平坦化（`controlFlowFlattening: true`，阈值 0.8）
- 死代码注入（`deadCodeInjection: true`，阈值 0.35）
- 数值运算复合化（`numbersToExpressions: true`）
- 十六进制标识符哈希化（`identifierNamesGenerator: 'hexadecimal'`）
- 字符串双层防御（`stringArrayEncoding: ['base64', 'rc4']`，8 字节切片）
- 反调试与防篡改（`debugProtection: true`，`disableConsoleOutput: true`）
- 严格解耦第三方静态库（`renameGlobals: false`），DOM/Window 调用 100% 稳定

---

### 8. 100% 商业可用合规审计

完全不包含任何 GPL / AGPL 或非商用协议代码，底层依赖全部为 MIT / Zlib 许可：

| 依赖 | 版本 | 许可证 |
| :--- | :--- | :--- |
| `omggif` | ^1.0.10 | MIT |
| `pngjs` | ^7.0.0 | MIT |
| `upng-js` | ^2.1.0 | MIT |
| `jszip` | ^3.10.1 | MIT |
| `pako` | ^2.1.0 | MIT / Zlib |
| `buffer` | ^6.0.3 | MIT |
| `javascript-obfuscator` | ^5.7.0 | BSD-2-Clause（构建期） |
| `esbuild` | ^0.28.2 | MIT（构建期） |

---

## 📁 目录结构

```
SR-devbox图片压缩/
├── index.html                      # 开发版主界面与核心源码
├── package.json                    # 项目元数据与构建命令配置
├── build-bundle.js                 # 商业库浏览器环境打包脚本
├── build-obfuscate.js              # 生产级高强度混淆与防逆向打包脚本
├── font-clipper-ui.html            # 字体裁剪辅助工具
├── lib/                            # 本地开发解耦静态库 (MIT)
│   ├── buffer.min.js               # Buffer 浏览器 Polyfill
│   ├── pngjs.min.js                # pngjs 浏览器版无损编码器
│   ├── upng.min.js                 # UPNG.js 感知量化引擎
│   ├── pako.min.js                 # 高性能 Zlib/Deflate 算法库
│   ├── omggif.min.js               # GIF 多帧读写引擎
│   └── jszip.min.js                # 纯前端 ZIP 打包库
├── dist/                           # 生产发布产物目录（一键生成）
│   ├── index.html                  # 生产部署主页面（已引入混淆脚本）
│   ├── app.core.min.js             # 高强度混淆商业核心文件
│   ├── index.standalone.html       # 离线便携独立版（混淆代码直接内联）
│   ├── lib/                        # 静态库副本（buffer/pngjs/upng/pako/omggif/jszip）
│   └── RELEASE_NOTES.txt           # 发布版本说明与合规记录
├── test-validate-html.js           # HTML 脚本语法校验
├── test-metadata-integration.js    # 元数据清洗引擎集成测试
├── test-compressors.js             # 各格式压缩算法单元测试（真无损 vs 极致体积）
├── test-browser-integration.js     # 浏览器 VM 环境端到端集成测试
├── test-dist-verification.js       # 发布产物完整性与防逆向验证测试
└── README.md                       # 中文技术文档与使用指南
```

---

## 🚀 快速启动与构建命令

### 本地运行开发版

直接双击根目录下的 `index.html` 即可在浏览器中使用，无需任何服务器或安装步骤。

### 执行混淆打包（生成生产包）

```bash
npm run obfuscate
# 等价于: node build-obfuscate.js
```

自动完成：
1. 清空并重构 `dist/` 目录
2. 解耦并复制原生第三方库至 `dist/lib/`
3. 对核心业务算法执行全维度混淆加固
4. 输出模块化生产版 `dist/index.html` + 离线便携单文件版 `dist/index.standalone.html`

### 一键完整构建（依赖打包 + 高强度混淆）

```bash
npm run build:all
```

### 运行全套测试

```bash
npm test
# 依次执行: HTML 校验 → 元数据集成 → 压缩算法单元 → 浏览器集成
```

---

## 📊 技术指标与效果实测

| 测试图像类型 | 原文件大小 | 真无损模式 | 极致体积模式 | 肉眼视觉差异 |
| :--- | :--- | :--- | :--- | :--- |
| 真实摄影照片 / 复杂渐变 PNG | 100.8 KB | 100.8 KB（已最优） | **27.2 KB（-73.0%）** | 极高保真，肉眼无差异 |
| 未优化 / Canvas 导出 PNG | 120.5 KB | **78.2 KB（-35.1%）** | **31.4 KB（-73.9%）** | 极高保真，肉眼无差异 |
| 高清拍摄相片 JPEG | 850.4 KB | 792.1 KB（-6.9%，剥离元数据） | **212.6 KB（-75.0%）** | 极高保真，100% 分辨率 |
| 设计软件导出 SVG | 45.8 KB | **28.3 KB（-38.2%）** | **28.3 KB（-38.2%）** | 100% 矢量路径一致 |
| 已极致优化的 PNG（兜底触发） | 65.2 KB | 65.2 KB（自动保留原图） | 65.2 KB（自动保留原图） | ✅ 100% 绝对一致 |

---

## 🛡️ 知识产权与版权声明

```
SR-DevBox 开发者效率工具箱 - PixZip 图片压缩工具
@author     Zhu Rui
@website    https://srdevbox.com
@email      30501250@qq.com
@date       2026-09-18
@copyright  © 2026 Zhu Rui. All Rights Reserved.

本文件为 SR-DevBox 项目的组成部分，版权归作者 Zhu Rui 所有。
未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
```
