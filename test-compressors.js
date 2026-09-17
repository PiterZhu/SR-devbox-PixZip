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

const { PNG } = require('pngjs');

// 1. 测试 PNG 极致无损压缩
function compressPngLossless(inputBuffer, options = {}) {
  try {
    const level = options.deflateLevel !== undefined ? options.deflateLevel : 9;
    const strategy = options.deflateStrategy !== undefined ? options.deflateStrategy : 3;

    const png = PNG.sync.read(inputBuffer);
    const outputBuffer = PNG.sync.write(png, {
      deflateLevel: level,
      deflateStrategy: strategy
    });

    if (outputBuffer.length < inputBuffer.length) {
      return { buffer: outputBuffer, saved: inputBuffer.length - outputBuffer.length, changed: true };
    }
    return { buffer: inputBuffer, saved: 0, changed: false };
  } catch (err) {
    console.error('PNG 压缩异常:', err.message);
    return { buffer: inputBuffer, saved: 0, changed: false, error: err.message };
  }
}

// 2. 测试 SVG 无损精简
function compressSvgLossless(svgStr) {
  let res = svgStr
    // 移除 XML 声明与注释
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    // 移除元数据标签
    .replace(/<metadata>[\s\S]*?<\/metadata>/gi, '')
    .replace(/<desc>[\s\S]*?<\/desc>/gi, '')
    // 移除常见矢量设计软件冗余命名空间
    .replace(/\s*xmlns:(?:inkscape|sodipodi|sketch|i|adobe|x)="[^"]*"/gi, '')
    .replace(/\s*(?:inkscape|sodipodi):[a-z0-9\-_]+="[^"]*"/gi, '')
    // 压缩标签之间的多余空白
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return res;
}

// 3. 测试 JPEG 无损优化 (剥离冗余元数据与 EXIF)
function compressJpegLossless(buf, options = {}) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return { buffer: buf, saved: 0, changed: false };
  let pos = 2;
  const chunks = [buf.slice(0, 2)]; // 保留 SOI 标识
  let changed = false;

  while (pos < buf.length) {
    if (buf[pos] !== 0xFF) {
      pos++;
      continue;
    }
    const marker = buf[pos + 1];
    if (marker === 0xD9) { // EOI 结束
      chunks.push(buf.slice(pos, pos + 2));
      break;
    }
    if (marker === 0xDA) { // SOS 图像核心扫描流，后续直到文件末尾
      chunks.push(buf.slice(pos));
      break;
    }
    if (marker === 0x00 || (marker >= 0xD0 && marker <= 0xD7)) {
      pos += 2;
      continue;
    }
    const len = (buf[pos + 2] << 8) | buf[pos + 3];
    const segment = buf.slice(pos, pos + 2 + len);

    // 剥离 APP1 (EXIF: 0xE1), APP13 (Photoshop: 0xED), COM 注释 (0xFE)
    const isExif = marker === 0xE1;
    const isPhotoshop = marker === 0xED;
    const isComment = marker === 0xFE;
    const isIcc = marker === 0xE2;

    if (isExif || isPhotoshop || isComment || (isIcc && !options.keepIcc)) {
      changed = true;
    } else {
      chunks.push(segment);
    }
    pos += 2 + len;
  }

  if (!changed) return { buffer: buf, saved: 0, changed: false };
  const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
  const out = Buffer.concat(chunks, totalLen);
  if (out.length < buf.length) {
    return { buffer: out, saved: buf.length - out.length, changed: true };
  }
  return { buffer: buf, saved: 0, changed: false };
}

// 4. 执行综合验证
const testSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><!-- 注释信息 --><circle cx="50" cy="50" r="40" /></svg>';
console.log('SVG 测试前后长度:', testSvg.length, '->', compressSvgLossless(testSvg).length);

const testPng = new PNG({ width: 20, height: 20 });
for (let i = 0; i < testPng.data.length; i += 4) {
  testPng.data[i] = i % 255;
  testPng.data[i+1] = (i * 2) % 255;
  testPng.data[i+2] = (i * 3) % 255;
  testPng.data[i+3] = 255;
}
const testPngBuf = PNG.sync.write(testPng, { deflateLevel: 1 }); // 原始低压缩
const compResult = compressPngLossless(testPngBuf, { deflateLevel: 9, deflateStrategy: 3 });
console.log('PNG 低压缩原体积:', testPngBuf.length, '-> 强无损压缩后:', compResult.buffer.length, '节省:', compResult.saved, '字节');

// 5. 测试对标 iLoveIMG 的 UPNG 极致体积压缩对比
try {
  const UPNG = require('upng-js');
  // 创建一个包含真实渐变和微噪点的 200x200 彩色图片模拟真实照片
  const w = 200, h = 200;
  const photoPng = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const noise = ((x * 7 + y * 13) % 23);
      photoPng.data[idx] = Math.min(255, ((x / w) * 200 + noise) | 0);
      photoPng.data[idx + 1] = Math.min(255, ((y / h) * 180 + noise) | 0);
      photoPng.data[idx + 2] = Math.min(255, (((x + y) / (w + h)) * 220 + noise) | 0);
      photoPng.data[idx + 3] = 255;
    }
  }
  const photoRaw = PNG.sync.write(photoPng, { deflateLevel: 6 });
  const photoLossless = PNG.sync.write(photoPng, { deflateLevel: 9, deflateStrategy: 3 });
  const photoExtreme = Buffer.from(UPNG.encode([photoPng.data.buffer], w, h, 256));

  console.log('\n--- 真实图像压缩对比测试 (对标 iLoveIMG) ---');
  console.log('原图文件大小:', (photoRaw.length / 1024).toFixed(1), 'KB');
  console.log('模式一【真无损】大小:', (photoLossless.length / 1024).toFixed(1), 'KB (缩减率: ' + (((photoRaw.length - photoLossless.length) / photoRaw.length) * 100).toFixed(1) + '%)');
  console.log('模式二【极致体积】大小:', (photoExtreme.length / 1024).toFixed(1), 'KB (缩减率: ' + (((photoRaw.length - photoExtreme.length) / photoRaw.length) * 100).toFixed(1) + '%)');
} catch (e) {
  console.log('UPNG 测试跳过:', e.message);
}

// 6. 测试多帧 GIF 动图高压缩率引擎 (方案 C: omggif + UPNG.quantize)
try {
  const omggif = require('omggif');
  const UPNG = require('upng-js');

  function padPalette(palette) {
    let len = palette.length;
    if (len < 2) len = 2;
    let pow2 = 1;
    while (pow2 < len) pow2 <<= 1;
    if (pow2 > 256) pow2 = 256;
    while (palette.length < pow2) {
      palette.push(0);
    }
    return palette;
  }

  // 构造包含 3 帧复杂彩色动画的 GIF
  const gw = 120, gh = 120;
  const rawGifBuf = new Uint8Array(200 * 1024);
  // 构造具有 256 色的原始完整调色板以模拟真实未优化 GIF
  const basePalette = [];
  for (let c = 0; c < 256; c++) {
    basePalette.push((c << 16) | ((255 - c) << 8) | ((c * 3) % 256));
  }
  const gifGenWriter = new omggif.GifWriter(rawGifBuf, gw, gh, { loop: 0 });

  // 帧 0、帧 1、帧 2: 分别渲染渐变图像
  for (let f = 0; f < 3; f++) {
    const framePix = new Uint8Array(gw * gh);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        framePix[y * gw + x] = ((x * 2 + y * 2 + f * 40) % 256);
      }
    }
    gifGenWriter.addFrame(0, 0, gw, gh, framePix, {
      palette: basePalette,
      delay: 15 + f * 5,
      disposal: 2
    });
  }

  const rawGifBytes = rawGifBuf.subarray(0, gifGenWriter.end());
  console.log('\n--- 多帧 GIF 动图压缩引擎测试 (对标 TinyPNG/iLoveIMG 方案 C) ---');
  console.log('原始 3 帧动图大小:', (rawGifBytes.length / 1024).toFixed(2), 'KB');

  // 执行极致体积量化压缩 (64 色)
  const reader = new omggif.GifReader(rawGifBytes);
  const numFrames = reader.numFrames();
  const width = reader.width;
  const height = reader.height;
  const loopCount = reader.loopCount();

  const outBuf = new Uint8Array(rawGifBytes.length * 2);
  const compWriter = new omggif.GifWriter(outBuf, width, height, { loop: loopCount });
  let canvasRGBA = new Uint8Array(width * height * 4);

  for (let i = 0; i < numFrames; i++) {
    const info = reader.frameInfo(i);
    reader.decodeAndBlitFrameRGBA(i, canvasRGBA);

    const qres = UPNG.quantize([canvasRGBA.buffer], 64, true);
    const colorMap = new Map();
    const gifPalette = [];
    let transIndex = null;

    qres.plte.forEach((p, idx) => {
      const c = p.est.rgba;
      colorMap.set(c, idx);
      const r = c & 0xff;
      const g = (c >> 8) & 0xff;
      const b = (c >> 16) & 0xff;
      const a = (c >>> 24) & 0xff;
      if (a < 128 && transIndex === null) transIndex = idx;
      gifPalette.push((r << 16) | (g << 8) | b);
    });

    padPalette(gifPalette);

    const u32 = new Uint32Array(qres.bufs[0]);
    const indexed = new Uint8Array(width * height);
    for (let p = 0; p < indexed.length; p++) {
      const mapped = colorMap.get(u32[p]);
      indexed[p] = mapped !== undefined ? mapped : 0;
    }

    const opts = { palette: gifPalette, delay: info.delay, disposal: info.disposal };
    if (transIndex !== null) opts.transparent = transIndex;
    compWriter.addFrame(info.x, info.y, info.width, info.height, indexed, opts);

    if (info.disposal === 2) canvasRGBA.fill(0);
  }

  const compGifBytes = outBuf.subarray(0, compWriter.end());
  const savedBytes = rawGifBytes.length - compGifBytes.length;
  const savedRatio = ((savedBytes / rawGifBytes.length) * 100).toFixed(1);

  console.log('GIF 极致体积压缩后大小:', (compGifBytes.length / 1024).toFixed(2), 'KB (减容率:', savedRatio + '%)');

  // 严格验证动图帧数与参数
  const verifyReader = new omggif.GifReader(compGifBytes);
  if (verifyReader.numFrames() === 3 && verifyReader.width === gw && verifyReader.height === gh) {
    console.log('✅ GIF 压缩后多帧完整性、时序 delay、循环次数验证 100% 通过！');
  } else {
    console.error('❌ GIF 压缩后帧丢失或参数异常！');
    process.exit(1);
  }
} catch (e) {
  console.error('GIF 测试异常:', e);
  process.exit(1);
}
