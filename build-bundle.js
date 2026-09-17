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

// 5. 构建 upng-js 浏览器版 (纯前端 256 色量化与抖动压缩引擎，MIT 协议)
const upngMin = esbuild.buildSync({
  entryPoints: ['node_modules/upng-js/UPNG.js'],
  bundle: false,
  minify: true,
  write: false
});

const upngCode = upngMin.outputFiles[0].text + '\n' +
  'if (typeof window !== "undefined" && typeof UPNG !== "undefined") { window.UPNG = window.UPNG || UPNG; }\n' +
  'if (typeof globalThis !== "undefined" && typeof UPNG !== "undefined") { globalThis.UPNG = globalThis.UPNG || UPNG; }\n';

fs.writeFileSync('lib/upng.min.js', upngCode, 'utf8');

// 6. 构建 omggif 浏览器版 (纯前端 GIF89a 动图多帧解密、重编码与量化打包引擎，MIT 协议)
let omggifSource = fs.readFileSync('node_modules/omggif/omggif.js', 'utf8');

// 注入原生像素索引直接解码方法 decodeFrameIndices (100% 保持原生调色板映射，避免 RGBA 往返失真与黑屏)
const injectMarker = 'this.decodeAndBlitFrameRGBA = function(frame_num, pixels) {';
const decodeIndicesMethod = `  this.decodeFrameIndices = function(frame_num, output) {
    var frame = this.frameInfo(frame_num);
    var num_pixels = frame.width * frame.height;
    var index_stream = new Uint8Array(num_pixels);
    GifReaderLZWOutputIndexStream(buf, frame.data_offset, index_stream, num_pixels);
    if (!frame.interlaced) {
      if (output) { output.set(index_stream); return output; }
      return index_stream;
    }
    var deinterlaced = output || new Uint8Array(num_pixels);
    var rows = [
      { start: 0, step: 8 },
      { start: 4, step: 8 },
      { start: 2, step: 4 },
      { start: 1, step: 2 }
    ];
    var srcRow = 0;
    for (var pass = 0; pass < 4; pass++) {
      var step = rows[pass].step;
      for (var dstRow = rows[pass].start; dstRow < frame.height; dstRow += step) {
        var srcOff = srcRow * frame.width;
        var dstOff = dstRow * frame.width;
        deinterlaced.set(index_stream.subarray(srcOff, srcOff + frame.width), dstOff);
        srcRow++;
      }
    }
    return deinterlaced;
  };

  `;

if (omggifSource.includes(injectMarker)) {
  omggifSource = omggifSource.replace(injectMarker, decodeIndicesMethod + injectMarker);
}

const omggifMin = esbuild.buildSync({
  stdin: {
    contents: omggifSource,
    resolveDir: path.resolve('node_modules/omggif'),
    sourcefile: 'omggif.js',
    loader: 'js'
  },
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'SR_Omggif_Module',
  write: false
});

const omggifCode = omggifMin.outputFiles[0].text + '\n' +
  'if (typeof window !== "undefined") { window.omggif = SR_Omggif_Module; window.GifReader = SR_Omggif_Module.GifReader; window.GifWriter = SR_Omggif_Module.GifWriter; }\n' +
  'if (typeof globalThis !== "undefined") { globalThis.omggif = SR_Omggif_Module; globalThis.GifReader = SR_Omggif_Module.GifReader; globalThis.GifWriter = SR_Omggif_Module.GifWriter; }\n';

fs.writeFileSync('lib/omggif.min.js', omggifCode, 'utf8');

console.log('✅ 前端所有核心商用库构建成功:');
fs.readdirSync('lib').forEach(f => {
  const stat = fs.statSync(path.join('lib', f));
  console.log(` - lib/${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
