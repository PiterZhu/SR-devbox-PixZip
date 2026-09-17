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
