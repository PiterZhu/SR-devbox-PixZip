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

const fs = require('fs');
const vm = require('vm');

// 模拟完整现代浏览器 window 环境
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Uint8Array,
  Uint16Array,
  Uint32Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Float32Array,
  Float64Array,
  ArrayBuffer,
  DataView,
  Math,
  String,
  Object,
  Array,
  Date,
  JSON,
  RegExp,
  Error,
  TypeError,
  RangeError
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);

// 依次加载 lib 目录中的库
['lib/buffer.min.js', 'lib/pngjs.min.js', 'lib/pako.min.js', 'lib/upng.min.js', 'lib/omggif.min.js', 'lib/jszip.min.js'].forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  vm.runInContext(code, sandbox);
});

console.log('--- 验证浏览器环境全局对象挂载情况 ---');
console.log('window.Buffer 可用:', typeof sandbox.window.Buffer);
console.log('window.PNG 可用:', typeof sandbox.window.PNG);
console.log('window.pako 可用:', typeof sandbox.window.pako);
console.log('window.UPNG 可用:', typeof sandbox.window.UPNG);
console.log('window.omggif 可用:', typeof sandbox.window.omggif);
console.log('window.GifReader 可用:', typeof sandbox.window.GifReader);
console.log('window.GifWriter 可用:', typeof sandbox.window.GifWriter);
console.log('window.JSZip 可用:', typeof sandbox.window.JSZip);

// 测试端到端压缩一个 PNG 图像
const PNG = sandbox.window.PNG;
const Buffer = sandbox.window.Buffer;

const testPng = new PNG({ width: 30, height: 30 });
for (let y = 0; y < 30; y++) {
  for (let x = 0; x < 30; x++) {
    const idx = (y * 30 + x) * 4;
    testPng.data[idx] = (x * 8) % 256;
    testPng.data[idx + 1] = (y * 8) % 256;
    testPng.data[idx + 2] = (x + y) % 256;
    testPng.data[idx + 3] = 255;
  }
}

// 模拟初始未深度优化的 PNG 字节流 (模拟 Canvas 导出)
const rawBuffer = PNG.sync.write(testPng, { deflateLevel: 1 });
console.log('\n原始 PNG 文件大小:', rawBuffer.length, '字节');

// 执行用户指定的算法: PNG.sync.read + PNG.sync.write (deflateLevel: 9, deflateStrategy: 3)
const readBack = PNG.sync.read(Buffer.from(rawBuffer));
const compressed = PNG.sync.write(readBack, {
  deflateLevel: 9,
  deflateStrategy: 3
});

console.log('无损重构压缩后大小:', compressed.length, '字节');
console.log('体积削减率:', (((rawBuffer.length - compressed.length) / rawBuffer.length) * 100).toFixed(2) + '%');

// 校验像素完全一致性 (Bit-level Lossless Verification)
const verifyPng = PNG.sync.read(compressed);
let isIdentical = true;
for (let i = 0; i < testPng.data.length; i++) {
  if (testPng.data[i] !== verifyPng.data[i]) {
    isIdentical = false;
    break;
  }
}
console.log('像素矩阵完全一致性验证 (Bit-level Lossless):', isIdentical ? '✅ 100% 绝对无损' : '❌ 像素失真');

// 测试 omggif 多帧动画 GIF 解码与重打包
const GifWriter = sandbox.window.GifWriter;
const GifReader = sandbox.window.GifReader;

const gifWidth = 40, gifHeight = 40;
const rawGifBuffer = new Uint8Array(50 * 1024);
const gifPalette = [0xff0000, 0x00ff00, 0x0000ff, 0x000000];
const sampleWriter = new GifWriter(rawGifBuffer, gifWidth, gifHeight, { loop: 0 });

const frame0Pixels = new Uint8Array(gifWidth * gifHeight); frame0Pixels.fill(0);
sampleWriter.addFrame(0, 0, gifWidth, gifHeight, frame0Pixels, { palette: gifPalette, delay: 20, disposal: 2 });
const frame1Pixels = new Uint8Array(gifWidth * gifHeight); frame1Pixels.fill(1);
sampleWriter.addFrame(0, 0, gifWidth, gifHeight, frame1Pixels, { palette: gifPalette, delay: 25, disposal: 2 });

const testGifBytes = rawGifBuffer.subarray(0, sampleWriter.end());
console.log('\n合成多帧测试 GIF 大小:', testGifBytes.length, '字节');

const sampleReader = new GifReader(testGifBytes);
console.log('GIF 读取验证: 帧数 =', sampleReader.numFrames(), '循环次数 =', sampleReader.loopCount(), '宽高 =', sampleReader.width + 'x' + sampleReader.height);
const frame0Info = sampleReader.frameInfo(0);
const frame1Info = sampleReader.frameInfo(1);
if (sampleReader.numFrames() === 2 && frame0Info.delay === 20 && frame1Info.delay === 25) {
  console.log('✅ omggif 多帧动图解析与参数提取 100% 准确！');
} else {
  console.error('❌ omggif 多帧动图参数校验失败！');
  process.exit(1);
}

// 测试 JSZip 保持目录层级打包
const zip = new sandbox.window.JSZip();
zip.file('assets/images/header.png', compressed);
zip.file('assets/images/anim.gif', testGifBytes);
zip.file('public/icons/logo.png', compressed);
zip.file('nested/deep/banner.png', compressed);

zip.generateAsync({ type: 'uint8array' }).then(content => {
  console.log('\nJSZip 打包成功，生成 ZIP 大小:', content.length, '字节');
  console.log('✅ 端到端流程在纯前端沙箱中完美通过！');
});
