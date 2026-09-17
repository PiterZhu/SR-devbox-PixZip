/**
 * SR-DevBox-PixZip 开发者效率工具箱
 * @author     Zhu Rui
 * @website    https://srdevbox.com
 * @email      30501250@qq.com
 * @date       2026-09-17
 * @copyright  © 2026 Zhu Rui. All Rights Reserved.
 *
 * 本文件为 SR-DevBox-PixZip 项目的组成部分，版权归作者 Zhu Rui 所有。
 * 未经书面许可，禁止以任何形式复制、修改、分发或用于商业目的。
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// 确保输出目录 lib 存在
if (!fs.existsSync('lib')) {
  fs.mkdirSync('lib', { recursive: true });
}

// 1. 复制 JSZip 生产版代码 (MIT 协议，全商业可用)
fs.copyFileSync('node_modules/jszip/dist/jszip.min.js', 'lib/jszip.min.js');

// 2. 复制 Pako 生产版代码 (MIT 协议，全商业可用)
fs.copyFileSync('node_modules/pako/dist/pako.min.js', 'lib/pako.min.js');

// 3. 构建 Buffer 浏览器版 (MIT 协议)
esbuild.buildSync({
  entryPoints: ['node_modules/buffer/index.js'],
  bundle: true,
  outfile: 'lib/buffer.min.js',
  minify: true,
  format: 'iife',
  globalName: 'SR_Buffer_Module',
  footer: {
    js: 'if (typeof window !== "undefined") { window.Buffer = window.Buffer || SR_Buffer_Module.Buffer; } if (typeof globalThis !== "undefined") { globalThis.Buffer = globalThis.Buffer || SR_Buffer_Module.Buffer; }'
  }
});

// 4. 构建 pngjs 浏览器版 (基于官方 browser.js 并精简压缩，MIT 协议)
const pngjsMin = esbuild.buildSync({
  entryPoints: ['node_modules/pngjs/browser.js'],
  bundle: false,
  minify: true,
  write: false
});

// 确保在 window 上统一挂载 window.PNG
const pngjsCode = pngjsMin.outputFiles[0].text + '\n' +
  'if (typeof window !== "undefined" && window.png && window.png.PNG) { window.PNG = window.png.PNG; }\n' +
  'if (typeof globalThis !== "undefined" && globalThis.png && globalThis.png.PNG) { globalThis.PNG = globalThis.png.PNG; }\n';

fs.writeFileSync('lib/pngjs.min.js', pngjsCode, 'utf8');

console.log('✅ 前端所有核心商用库构建成功:');
fs.readdirSync('lib').forEach(f => {
  const stat = fs.statSync(path.join('lib', f));
  console.log(` - lib/${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
