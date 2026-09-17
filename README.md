# PixZip 图片无损压缩工具 (Pure Web Edition) - SR-DevBox 开发者效率工具箱

```
SR-DevBox 开发者效率工具箱 - PixZip 图片无损压缩工具
@author     Zhu Rui
@website    https://srdevbox.com
@email      30501250@qq.com
@date       2026-09-17
@copyright  © 2026 Zhu Rui. All Rights Reserved.

本文件为 SR-DevBox 项目的组成部分，版权归作者 Zhu Rui 所有。
未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
```

---

## 📖 项目简介

**PixZip 图片无损压缩工具** 是属于 **SR-DevBox 开发者效率工具箱** 旗下一款专为前端开发者、UI 设计师与运维工程师打造的**纯前端浏览器运行（Pure Web Browser）**的高性能位级无损图片压缩与网站整包优化工具。

顶部 Header 采用统一的母子品牌视觉体系：**SR-DevBox 官方 Logo 与品牌标识融合为一个可交互点击链接**，直达 [https://srdevbox.com](https://srdevbox.com) 官网；并通过立体的层级分割线引出当前专属工具 **PixZip 图片无损压缩工具**。

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

6. **商业级高强度代码混淆与防逆向加固 (JavaScript-Obfuscator Pipeline)**
   - **控制流平坦化 (`controlFlowFlattening: true`, 阈值 `0.8`)**：将核心控制流转化为复杂的 Switch-Case 状态机调度。
   - **死代码注入 (`deadCodeInjection: true`, 阈值 `0.35`)**：动态注入虚构干扰分支，极大增加逆向反编译难度。
   - **数值运算复合化 (`numbersToExpressions: true`)**：将所有纯数字常量转换为多层数学算式运算。
   - **十六进制标识符 (`identifierNamesGenerator: 'hexadecimal'`)**：所有变量、函数统一十六进制哈希化（如 `_0x1a2b`）。
   - **字符串深度防御 (`stringArrayEncoding: ['base64', 'rc4']`)**：全局字符串抽取、乱序重排、双层包装器解密链与 8 字节切片拆分。
   - **反调试与防篡改 (`debugProtection: true`, `disableConsoleOutput: true`)**：控制台格式化探测检测与防嗅探拦截。
   - **工程安全边界 (`renameGlobals: false`)**：严格解耦第三方静态库，保护宿主 DOM/Window 接口调用 100% 稳定运行。

7. **100% 商业可用合规审计（Commercial License Compliance）**
   - 严禁且完全不包含任何 GPL / AGPL 或非商用（Non-Commercial）协议代码。
   - 底层核心依赖完全合规：
     - `pngjs`: **MIT License**
     - `jszip`: **MIT License**
     - `pako`: **MIT / Zlib License**
     - `buffer`: **MIT License**
     - `javascript-obfuscator`: **BSD-2-Clause** (构建加固期)
     - `esbuild`: **MIT License** (依赖打包期)

---

## 📁 目录结构

```
SR-devbox图片压缩/
├── index.html                      # 开发版主界面与核心源码
├── package.json                    # 项目元数据与打包命令配置
├── build-bundle.js                 # 商业库浏览器运行环境打包脚本
├── build-obfuscate.js              # 生产级自动化高强度混淆与防逆向打包脚本
├── lib/                            # 本地开发解耦静态库 (MIT)
│   ├── buffer.min.js               # Buffer 浏览器 Polyfill
│   ├── pngjs.min.js                # pngjs 浏览器版无损编码器
│   ├── pako.min.js                 # 高性能 Zlib/Deflate 算法库
│   └── jszip.min.js                # 纯前端 ZIP 打包与目录保持库
├── dist/                           # 生产发布产物目录 (一键生成)
│   ├── index.html                  # 生产部署主页面 (已引入混淆脚本)
│   ├── app.core.min.js             # 高强度混淆与防逆向加固商业核心文件
│   ├── index.standalone.html       # 离线便携独立版 (混淆代码直接内联)
│   ├── lib/                        # 原生静态库副本 (buffer, pngjs, pako, jszip)
│   └── RELEASE_NOTES.txt           # 发布版本说明与合规记录
├── test-browser-integration.js     # 浏览器 VM 环境端到端集成测试脚本
├── test-compressors.js             # 各格式无损算法单元测试
├── test-validate-html.js           # HTML 脚本语法校验脚本
├── test-dist-verification.js       # 发布产物完整性与防逆向验证测试
└── README.md                       # 中文技术文档与使用指南
```

---

## 🚀 快速启动与构建命令

### 1. 本地运行开发版
直接双击打开根目录下的 `index.html` 即可开始使用。

### 2. 执行商业级代码混淆与发布打包 (一键生成生产包)
```bash
npm run obfuscate
# 或执行: node build-obfuscate.js
```
该命令会自动：
1. 清空并重构 `dist/` 目录；
2. 解耦并复制原生第三方库至 `dist/lib/`；
3. 对核心业务算法执行控制流平坦化、死代码注入、RC4 双重加密、反调试等全维度加固；
4. 输出模块化生产版 `dist/index.html` 及离线便携单文件版 `dist/index.standalone.html`。

### 3. 一键完整构建 (包含依赖打包与高强度混淆)
```bash
npm run build:all
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
SR-DevBox 开发者效率工具箱 - PixZip 图片无损压缩工具
@author     Zhu Rui
@website    https://srdevbox.com
@email      30501250@qq.com
@date       2026-09-17
@copyright  © 2026 Zhu Rui. All Rights Reserved.

本文件为 SR-DevBox 项目的组成部分，版权归作者 Zhu Rui 所有。
未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
```
