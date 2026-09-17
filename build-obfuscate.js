/**
 * SR-DevBox-PixZip 开发者效率工具箱 - 生产级自动化高强度混淆与防逆向打包引擎
 * @author     Zhu Rui
 * @website    https://srdevbox.com
 * @email      30501250@qq.com
 * @date       2026-09-17
 * @copyright  © 2026 Zhu Rui. All Rights Reserved.
 *
 * 本文件为 SR-DevBox-PixZip 项目的组成部分，版权归作者 Zhu Rui 所有。
 * 未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// 配置路径常量
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const LIB_DIR = path.join(ROOT_DIR, 'lib');
const DIST_LIB_DIR = path.join(DIST_DIR, 'lib');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');

// 生产级防逆向版权防伪 Banner 注释
const OBFUSCATED_BANNER = `/**
 * SR-DevBox 开发者效率工具箱 - PixZip 图片无损压缩工具 (Release Binary)
 * @author     Zhu Rui
 * @website    https://srdevbox.com
 * @email      30501250@qq.com
 * @date       2026-09-17
 * @copyright  © 2026 Zhu Rui. All Rights Reserved.
 *
 * 【安全警示】本软件核心商业代码已通过高强度控制流平坦化、RC4双重加密与反逆向加固技术保护。
 * 严禁未经授权的反编译、动态调试、格式化探测、破解重打包或用于非授权商业活动。
 */`;

/**
 * 格式化文件字节大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 递归复制目录
 */
function copyDirectorySync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 执行主构建流程
 */
async function runObfuscationPipeline() {
  const startTime = Date.now();
  console.log('\n======================================================================');
  console.log('🛡️  SR-DevBox - PixZip 图片无损压缩工具 生产级高强度混淆与防逆向打包流水线');
  console.log('   作者: Zhu Rui | 日期: 2026-09-17 | 许可: Commercial');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // 步骤 1: 清理并初始化目标发布目录 dist/
  // -------------------------------------------------------------------------
  console.log('[1/5] 正在清空并重构目标发布目录 dist/ ...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_LIB_DIR, { recursive: true });
  console.log('      ✓ 目标目录清理初始化完毕: ' + DIST_DIR);

  // -------------------------------------------------------------------------
  // 步骤 2: 第三方不可混淆静态依赖安全解耦与复制
  // -------------------------------------------------------------------------
  console.log('\n[2/5] 正在解耦并同步第三方静态公共库 (保持原生高性能，免受混淆破坏)...');
  if (fs.existsSync(LIB_DIR)) {
    copyDirectorySync(LIB_DIR, DIST_LIB_DIR);
    const copiedLibs = fs.readdirSync(DIST_LIB_DIR);
    copiedLibs.forEach(file => {
      const stat = fs.statSync(path.join(DIST_LIB_DIR, file));
      console.log(`      ✓ 静态安全库副本: dist/lib/${file} (${formatBytes(stat.size)})`);
    });
  } else {
    console.warn('      ⚠️ 未发现 lib/ 目录，请先运行 node build-bundle.js 构建底层库！');
  }

  // -------------------------------------------------------------------------
  // 步骤 3: 提取项目核心业务源代码
  // -------------------------------------------------------------------------
  console.log('\n[3/5] 正在从 index.html 解析并精确抽取核心业务逻辑代码...');
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    throw new Error('未找到主应用模板文件: ' + INDEX_HTML_PATH);
  }

  const rawHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // 精准定位主页面底部的核心业务 <script> 块
  const lastScriptOpen = rawHtml.lastIndexOf('<script>');
  const lastScriptClose = rawHtml.lastIndexOf('</script>');

  if (lastScriptOpen === -1 || lastScriptClose === -1 || lastScriptClose <= lastScriptOpen) {
    throw new Error('未能从 index.html 中定位到核心业务 <script> 代码块！');
  }

  const coreSourceCode = rawHtml.substring(lastScriptOpen + '<script>'.length, lastScriptClose).trim();
  const rawScriptSize = Buffer.byteLength(coreSourceCode, 'utf8');
  console.log(`      ✓ 成功抽取出核心业务代码 (原始大小: ${formatBytes(rawScriptSize)})`);

  // -------------------------------------------------------------------------
  // 步骤 4: 执行商业级高强度防逆向混淆 (严格遵循用户指定的技术规范)
  // -------------------------------------------------------------------------
  console.log('\n[4/5] 正在执行全维度商业级高强度混淆流水线...');
  console.log('      ⚡ 控制流平坦化 (Switch-Case 状态机转换, 阈值 0.8)...');
  console.log('      ⚡ 死代码注入 (虚构干扰分支, 阈值 0.35)...');
  console.log('      ⚡ 数字字面量转复合数学计算表达式 (numbersToExpressions)...');
  console.log('      ⚡ 全局字符串抽取 + 乱序重排 + Base64/RC4 双重加密...');
  console.log('      ⚡ 双层函数包装器解密链 (stringArrayWrappersCount: 2)...');
  console.log('      ⚡ 长字符串 8 字节切片拆分 (splitStrings)...');
  console.log('      ⚡ 反调试与防控制台嗅探 (debugProtection & disableConsoleOutput)...');
  console.log('      ⚡ 全局边界锁定 (renameGlobals: false 保留 DOM/Window 稳定交互)...');

  const obfuscationConfig = {
    // 基础压缩与语法树目标
    compact: true,
    target: 'browser',

    // 1. 控制流与代码结构混淆
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.8,    // 用户规范: 0.75 以上
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.35,      // 用户规范: 0.3 ~ 0.4
    numbersToExpressions: true,            // 数字字面量转换为复合数学计算表达式
    simplify: true,
    identifierNamesGenerator: 'hexadecimal',// 强制十六进制命名规范 (_0x1a2b)

    // 2. 字符串深度防御体系
    stringArray: true,
    stringArrayShuffle: true,              // 乱序重排
    stringArrayRotate: true,
    stringArrayEncoding: ['base64', 'rc4'],// 双重高强度加密编码
    stringArrayWrappersCount: 2,           // 多层函数链包装器解密
    stringArrayWrappersChainedCalls: true,
    stringArrayThreshold: 0.9,             // 90% 字符串抽入加密表
    splitStrings: true,                    // 开启长字符串按片段拆分
    splitStringsChunkLength: 8,            // chunk 长度设为 8

    // 3. 反调试与防篡改加固
    debugProtection: true,                 // 开启格式化检测与调试器陷入
    debugProtectionInterval: 2000,         // 防调试触发频率
    disableConsoleOutput: true,            // 拦截控制台嗅探，保护内部信息

    // 4. 工程安全边界（保证浏览器 DOM/Window 与第三方静态库交互 100% 稳定）
    renameGlobals: false,                  // 绝对保留全局变量与宿主接口
    reservedNames: [
      '^window$',
      '^document$',
      '^Buffer$',
      '^PNG$',
      '^UPNG$',
      '^pako$',
      '^JSZip$',
      '^omggif$',
      '^GifReader$',
      '^GifWriter$',
      '^state$',
      '^handleImageFilesSelected$',
      '^handleFolderSelected$',
      '^clearScanLogs$',
      '^clearAllImages$',
      '^filterImageCards$',
      '^setFormatFilter$',
      '^startBatchCompress$',
      '^exportZipArchive$',
      '^downloadSingleImage$',
      '^removeImage$',
      '^copyMachineCode$',
      '^openActivationModal$',
      '^closeActivationModal$',
      '^submitActivation$',
      '^selectExportMode$',
      '^selectCompressMode$',
      '^setExtremeQuality$',
      '^openCompareModal$',
      '^closeCompareModal$',
      '^zoomCompareImage$',
      '^resetCompareZoom$',
      '^compressGifExtreme$',
      '^compressGifLossless$'
    ]
  };

  const obfuscatedResult = JavaScriptObfuscator.obfuscate(coreSourceCode, obfuscationConfig);
  const obfuscatedCode = OBFUSCATED_BANNER + '\n' + obfuscatedResult.getObfuscatedCode();
  const obfuscatedSize = Buffer.byteLength(obfuscatedCode, 'utf8');

  console.log(`      ✓ 混淆加固完毕! 产物体积: ${formatBytes(obfuscatedSize)} (膨胀保护率: ${(obfuscatedSize / rawScriptSize).toFixed(2)}x)`);

  // 写入 dist/app.core.min.js
  const distScriptPath = path.join(DIST_DIR, 'app.core.min.js');
  fs.writeFileSync(distScriptPath, obfuscatedCode, 'utf8');
  console.log('      ✓ 核心混淆脚本已输出至: dist/app.core.min.js');

  // -------------------------------------------------------------------------
  // 步骤 5: 重构生产版发布网页 dist/index.html 与独立版 dist/index.standalone.html
  // -------------------------------------------------------------------------
  console.log('\n[5/5] 正在重构装配生产发布网页...');

  // 生产发布版：将末尾核心内联脚本替换为加载外部混淆文件 app.core.min.js
  const prodHtml = rawHtml.substring(0, lastScriptOpen) +
    '<script src="app.core.min.js"></script>' +
    rawHtml.substring(lastScriptClose + '</script>'.length);
  const distHtmlPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(distHtmlPath, prodHtml, 'utf8');
  console.log('      ✓ 模块化生产网页已构建: dist/index.html (外部链接 app.core.min.js)');

  // 独立单文件版：直接将高强度混淆代码内联，便于离线分发单文件
  const standaloneHtml = rawHtml.substring(0, lastScriptOpen) +
    '<script>\n' + obfuscatedCode + '\n</script>' +
    rawHtml.substring(lastScriptClose + '</script>'.length);
  const distStandaloneHtmlPath = path.join(DIST_DIR, 'index.standalone.html');
  fs.writeFileSync(distStandaloneHtmlPath, standaloneHtml, 'utf8');
  console.log('      ✓ 独立离线单文件版已构建: dist/index.standalone.html (混淆代码直接内联)');

  // -------------------------------------------------------------------------
  // 生成发布说明与清单
  // -------------------------------------------------------------------------
  const releaseInfo = `# SR-DevBox - PixZip 图片无损压缩工具 商业生产发布包
生成日期: 2026-09-17
版权归属: © 2026 Zhu Rui. All Rights Reserved.
官方站点: https://srdevbox.com

【发布文件说明】
1. index.html            : 推荐商业部署主页面 (已引入 dist/app.core.min.js 与 dist/lib/)
2. app.core.min.js       : 核心商业逻辑防逆向加固文件 (控制流平坦化、RC4加密、防调试)
3. index.standalone.html : 单文件离线便携版 (内联核心混淆代码，便于独立分发)
4. lib/                  : 纯商业可用底层支持库 (Buffer, PNG.js, Pako, JSZip, UPNG, omggif)
`;
  fs.writeFileSync(path.join(DIST_DIR, 'RELEASE_NOTES.txt'), releaseInfo, 'utf8');

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n======================================================================');
  console.log(`🎉 生产级代码混淆与防逆向打包成功完成！总用时: ${duration} 秒`);
  console.log('======================================================================');
  console.log('📦 发布产物目录结构 [dist/]:');
  fs.readdirSync(DIST_DIR).forEach(f => {
    const fPath = path.join(DIST_DIR, f);
    const isDir = fs.statSync(fPath).isDirectory();
    if (isDir) {
      console.log(`   📁 dist/${f}/`);
      fs.readdirSync(fPath).forEach(sub => {
        const subStat = fs.statSync(path.join(fPath, sub));
        console.log(`      ├── ${sub} (${formatBytes(subStat.size)})`);
      });
    } else {
      const fStat = fs.statSync(fPath);
      console.log(`   📄 dist/${f} (${formatBytes(fStat.size)})`);
    }
  });
  console.log('\n💡 部署使用提示: 直接将整个 dist/ 目录部署至静态 Web 服务器或 CDN 即可上线运营。');
}

// 启动打包执行
runObfuscationPipeline().catch(err => {
  console.error('\n❌ 打包混淆流水线发生严重错误:', err);
  process.exit(1);
});
