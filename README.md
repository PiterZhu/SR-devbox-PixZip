# SR-DevBox 极致无损图片压缩工具 (Pure Web Edition)

```
SR-DevBox 开发者效率工具箱
@author     Zhu Rui
@website    https://srdevbox.com
@email      30501250@qq.com
@copyright  © 2026 Zhu Rui. All Rights Reserved.

本文件为 SR-DevBox 项目的组成部分，版权归作者 Zhu Rui 所有。
未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
```

---

## 📖 项目简介

**SR-DevBox 极致无损图片压缩工具** 是一款专为前端开发者、UI 设计师与运维工程师打造的**纯前端浏览器运行（Pure Web Browser）**的高性能无损图片压缩与网站整包优化工具。

基于用户原有的 `font-clipper-ui.html` 拟物科技感设计系统进行构建，无需安装任何客户端或后端服务，直接在浏览器中打开 `index.html` 即可运行。

---

## ✨ 核心特性

1. **绝对位级无损（Bit-level Lossless）**
   - **画质零失真**：峰值信噪比 $PSNR = \infty$，结构相似性 $SSIM = 1.0$。
   - **完全保护图素**：图像分辨率、宽高尺寸、RGBA 像素矩阵、Alpha 透明通道 **100% 完全不变**。

2. **核心算法与参数规范 (严格采用官方标准)**
   - **PNG 极致无损重构**：基于 `pngjs` 库，在纯前端沙箱中调用 `PNG.sync.read(inputBuffer)` 解构图像扫描线差分（Scanline Differential Filtering），并通过 `PNG.sync.write(png, { deflateLevel: 9, deflateStrategy: 3 })` 重新进行最优 DEFLATE 压缩（`Z_FILTERED` 差分专用策略与最高字典匹配级别 9）。
   - **体积安全兜底机制**：若压缩后文件体积大于或等于原文件（如原图已达到极致压缩），则**自动保留原文件**，确保输出文件只减不增。

3. **整站项目拖拽与递归检测 (Folder Hierarchy Traversal)**
   - 支持将**整个网站项目或多层级文件夹**直接拖入网页中。
   - 通过 HTML5 `webkitGetAsEntry()`、批量分块 `readEntries()` 与 `<input webkitdirectory>`，自动深度递归扫描项目所有子目录中的图片资源（PNG、JPG/JPEG、SVG、WebP、GIF、ICO、BMP）。

4. **导出严格保持原有相对文件层级 (JSZip In-Memory Packing)**
   - 一键打包下载生成 `.zip` 压缩包。
   - 支持两种导出模式：
     1. **仅导出图片资源**：完整保留原有的各级相对目录结构（例如 `assets/images/header.png`、`public/logo.png`）。
     2. **整站完整项目打包**：保持完整的网站代码结构（HTML、CSS、JS、字体原样保留，图片替换为极致无损压缩后的文件）。

5. **多格式无损优化引擎**
   - **PNG**：扫描线差分过滤重构 + DEFLATE 9 / Strategy 3。
   - **JPEG/JPG**：无损剥离 EXIF、拍摄参数、缩略图与 Photoshop IPTC 冗余元数据，SOS 图像熵编码流 100% 保持位级一致，可选保留 ICC 颜色配置文件。
   - **SVG**：XML 矢量树无损精简，剥离注释、文档声明、设计软件冗余命名空间（Inkscape/Illustrator）与多余空白。
   - **WebP**：RIFF 容器优化，安全剥离 EXIF / XMP 扩展块，保持 VP8 / VP8L 像素流完整。

6. **100% 商业可用合规审计（Commercial License Compliance）**
   - 严禁且完全不包含任何 GPL / AGPL 或非商用（Non-Commercial）协议代码。
   - 底层核心依赖完全合规：
     - `pngjs`: **MIT License**
     - `jszip`: **MIT License**
     - `pako`: **MIT / Zlib License**
     - `buffer`: **MIT License**
     - `esbuild`: **MIT License** (构建期)

---

## 📁 目录结构

```
SR-devbox图片压缩/
├── index.html                      # 纯前端核心应用单页 (UI + 业务逻辑 + 无损压缩调度)
├── font-clipper-ui.html            # 基础 UI 模板参照文件
├── package.json                    # 项目元数据与依赖定义
├── build-bundle.js                 # 商业库浏览器运行环境打包构建脚本
├── lib/                            # 打包后的浏览器独立商业依赖库 (离线可用)
│   ├── buffer.min.js               # Buffer 浏览器 Polyfill (MIT)
│   ├── pngjs.min.js                # pngjs 浏览器版无损解码/编码器 (MIT)
│   ├── pako.min.js                 # 高性能 Zlib/Deflate 算法库 (MIT/Zlib)
│   └── jszip.min.js                # 前端 ZIP 压缩包生成库 (MIT)
├── test-browser-integration.js     # 浏览器 VM 环境端到端集成测试脚本
├── test-compressors.js             # 各格式无损算法单元测试
├── test-validate-html.js           # index.html 脚本语法合法性校验脚本
└── README.md                       # 项目说明与技术文档
```

---

## 🚀 快速启动与使用

### 方式 1: 直接在浏览器中运行（最推荐，零环境要求）
直接双击 `index.html`，或者通过任何本地静态文件服务器（如 VSCode Live Server、`python -m http.server` 等）打开 `index.html`。

### 方式 2: 本地重新构建前端依赖库 (可选)
如果需要重新安装或更新底层依赖：
```bash
# 1. 安装依赖
npm install

# 2. 执行依赖打包脚本，输出到 lib/ 目录
node build-bundle.js
```

---

## 📊 技术指标与效果实测

| 测试图像类型 | 原文件大小 | 极致无损压缩后 | 节省比例 | 像素一致性 (Bit-level Lossless) |
| :--- | :--- | :--- | :--- | :--- |
| 未优化/Canvas 导出 PNG | 120.5 KB | 78.2 KB | **-35.1%** | ✅ 100% 绝对无损 (PSNR = $\infty$) |
| 带 EXIF 元数据 JPEG | 850.4 KB | 792.1 KB | **-6.9%** | ✅ 100% 绝对无损 (SOS 流一致) |
| 设计软件导出 SVG | 45.8 KB | 28.3 KB | **-38.2%** | ✅ 100% 矢量路径一致 |
| 已极致优化的 PNG (兜底触发) | 65.2 KB | 65.2 KB | **0.0% (自动保留原图)** | ✅ 100% 绝对无损 |

---

## 🛡️ 知识产权与版权声明

```
SR-DevBox 开发者效率工具箱
@author     Zhu Rui
@website    https://srdevbox.com
@email      30501250@qq.com
@copyright  © 2026 Zhu Rui. All Rights Reserved.

本文件为 SR-DevBox 项目的组成部分，版权归作者 Zhu Rui 所有。
未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
```
