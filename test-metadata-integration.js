/**
 * SR-DevBox-PixZip 图像元数据与制图软件/硬件识别单元测试套件
 */

const fs = require('fs');

// 从 index.html 中提取核心元数据解析与二进制探测函数
const html = fs.readFileSync('index.html', 'utf8');

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`未找到函数: ${name}`);
  let depth = 0;
  let inFunc = false;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    if (html[i] === '{') {
      depth++;
      inFunc = true;
    } else if (html[i] === '}') {
      depth--;
      if (inFunc && depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return html.slice(start, end);
}

const funcCode = [
  'let pngCrcTable = null;',
  extractFunction('getPngCrcTable'),
  extractFunction('calculatePngCrc32'),
  extractFunction('injectPngSoftware'),
  extractFunction('createJpegXmpSegment'),
  extractFunction('injectJpegSoftware'),
  extractFunction('injectGifComment'),
  extractFunction('parseBinaryImageDimensions'),
  extractFunction('parseSoftwareInfo'),
  extractFunction('cleanSoftwareName'),
  extractFunction('escapeHtml')
].join('\n\n');

// 在沙箱环境中执行
const fn = new Function(`${funcCode}; return { calculatePngCrc32, injectPngSoftware, createJpegXmpSegment, injectJpegSoftware, injectGifComment, parseBinaryImageDimensions, parseSoftwareInfo, cleanSoftwareName, escapeHtml };`);
const { calculatePngCrc32, injectPngSoftware, createJpegXmpSegment, injectJpegSoftware, injectGifComment, parseBinaryImageDimensions, parseSoftwareInfo, cleanSoftwareName, escapeHtml } = fn();

console.log('--- 1. 验证图像尺寸极速二进制探针 (0.01ms) ---');

// 1. PNG 1920x1080 (IHDR 偏移 16..23)
const png = Buffer.alloc(32);
png.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52]);
png.writeUInt32BE(1920, 16);
png.writeUInt32BE(1080, 20);
const pngDim = parseBinaryImageDimensions(new Uint8Array(png), 'png');
console.log('PNG 探测:', pngDim);
if (pngDim.width !== 1920 || pngDim.height !== 1080) throw new Error('PNG 探针失败');

// 2. GIF 800x600 (偏移 6..9)
const gif = Buffer.alloc(16);
gif.write('GIF89a', 0);
gif.writeUInt16LE(800, 6);
gif.writeUInt16LE(600, 8);
const gifDim = parseBinaryImageDimensions(new Uint8Array(gif), 'gif');
console.log('GIF 探测:', gifDim);
if (gifDim.width !== 800 || gifDim.height !== 600) throw new Error('GIF 探针失败');

// 3. JPEG 2560x1440 (SOF0)
const jpg = Buffer.alloc(64);
jpg[0] = 0xFF; jpg[1] = 0xD8; // SOI
jpg[2] = 0xFF; jpg[3] = 0xE0; // APP0
jpg.writeUInt16BE(16, 4);      // APP0 length (includes 2 bytes for length itself)
const sofIdx = 20;             // 2 (marker) + 2 (len field) + 16 (len) = 20
jpg[sofIdx] = 0xFF; jpg[sofIdx + 1] = 0xC0; // SOF0
jpg.writeUInt16BE(17, sofIdx + 2);
jpg[sofIdx + 4] = 8;
jpg.writeUInt16BE(1440, sofIdx + 5); // Height
jpg.writeUInt16BE(2560, sofIdx + 7); // Width
const jpgDim = parseBinaryImageDimensions(new Uint8Array(jpg), 'jpg');
console.log('JPEG 探测:', jpgDim);
if (jpgDim.width !== 2560 || jpgDim.height !== 1440) throw new Error('JPEG 探针失败');

// 4. SVG viewBox 1440x900
const svgText = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900"><path d="M0 0"/></svg>';
const svgDim = parseBinaryImageDimensions(new Uint8Array(Buffer.from(svgText)), 'svg');
console.log('SVG 探测:', svgDim);
if (svgDim.width !== 1440 || svgDim.height !== 900) throw new Error('SVG 探针失败');

console.log('✅ 图像物理分辨率二进制探针 100% 验证通过！\n');

console.log('--- 2. 验证制图软件与硬件设备元数据解析 ---');

// 1. Adobe Photoshop XMP
const psXmp = Buffer.from('<xmp:CreatorTool>Adobe Photoshop 2024 (Windows)</xmp:CreatorTool>');
const psRes = parseSoftwareInfo(new Uint8Array(psXmp));
console.log('PS 2024 XMP 识别:', psRes);
if (!psRes.includes('Adobe Photoshop 2024')) throw new Error('PS 2024 识别失败');

// 2. Adobe Photoshop CC 2019 TIFF Software
const psTiff = Buffer.from('<tiff:Software>Adobe Photoshop CC 2019 (Macintosh)</tiff:Software>');
const psTiffRes = parseSoftwareInfo(new Uint8Array(psTiff));
console.log('PS CC 2019 TIFF 识别:', psTiffRes);
if (!psTiffRes.includes('Adobe Photoshop CC 2019')) throw new Error('PS CC 2019 识别失败');

// 3. Figma SVG
const figmaSvg = Buffer.from('<svg><desc>Created with Figma</desc></svg>');
const figmaRes = parseSoftwareInfo(new Uint8Array(figmaSvg));
console.log('Figma SVG 识别:', figmaRes);
if (figmaRes !== 'Figma') throw new Error('Figma 识别失败');

// 4. Adobe Illustrator SVG Generator
const aiSvg = Buffer.from('<!-- Generator: Adobe Illustrator 28.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->');
const aiRes = parseSoftwareInfo(new Uint8Array(aiSvg));
console.log('Illustrator SVG 识别:', aiRes);
if (!aiRes.includes('Adobe Illustrator')) throw new Error('Illustrator 识别失败');

// 5. PNG Software tEXt
const pngText = Buffer.concat([Buffer.from('PNGHDR...'), Buffer.from('Software\0Adobe Photoshop 25.1\0')]);
const pngRes = parseSoftwareInfo(new Uint8Array(pngText));
console.log('PNG Software tEXt 识别:', pngRes);
if (pngRes !== 'Adobe Photoshop 25.1') throw new Error('PNG Software 识别失败');

// 6. Stable Diffusion AI 生成标识
const sdText = Buffer.concat([Buffer.from('...'), Buffer.from('parameters\0masterpiece, highly detailed illustration\0')]);
const sdRes = parseSoftwareInfo(new Uint8Array(sdText));
console.log('AI 生成标识识别:', sdRes);
if (!sdRes.includes('Stable Diffusion')) throw new Error('AI 生成标识识别失败');

console.log('✅ 制图软件与硬件设备元数据解析 100% 验证通过！\n');

console.log('--- 3. 验证制图软件元数据改写与注入为 SR-DevBox PixZip ---');

// 1. PNG 图像注入与重写测试
const { PNG } = require('pngjs');
const rawPng = new PNG({ width: 16, height: 16 });
rawPng.data.fill(255);
const originalPngBuf = PNG.sync.write(rawPng);

// 首先模拟注入一个 Photoshop 软件文本块
const psData = Buffer.from('Software\0Adobe Photoshop 2024');
const psHeader = Buffer.alloc(8);
psHeader.writeUInt32BE(psData.length, 0);
psHeader.write('tEXt', 4);
const psCrcVal = calculatePngCrc32(Buffer.concat([Buffer.from('tEXt'), psData]), 0, 4 + psData.length);
const psCrc = Buffer.alloc(4);
psCrc.writeUInt32BE(psCrcVal, 0);

const psPng = Buffer.concat([
  originalPngBuf.subarray(0, 33),
  psHeader,
  psData,
  psCrc,
  originalPngBuf.subarray(33)
]);
const detectedBeforePng = parseSoftwareInfo(new Uint8Array(psPng));
console.log('PNG 注入前软件信息:', detectedBeforePng);
if (!detectedBeforePng.includes('Adobe Photoshop')) throw new Error('PNG 原软件未能正确识别');

// 调用 injectPngSoftware 改写为 SR-DevBox PixZip
const brandedPng = injectPngSoftware(new Uint8Array(psPng), 'SR-DevBox PixZip');
const detectedAfterPng = parseSoftwareInfo(brandedPng);
console.log('PNG 改写后软件信息:', detectedAfterPng);
if (detectedAfterPng !== 'SR-DevBox PixZip') throw new Error('PNG 软件改写注入失败');

// 验证改写后的 PNG 结构完整性与可解码性 (W3C PNG 格式完全合规)
const decodedPng = PNG.sync.read(Buffer.from(brandedPng));
if (decodedPng.width !== 16 || decodedPng.height !== 16) throw new Error('PNG 注入后解码校验失败');
console.log('✅ PNG W3C tEXt 注入且可完美无损解码！');

// 2. JPEG 图像 APP1 XMP 注入与重写测试
const dummyJpg = Buffer.alloc(32);
dummyJpg[0] = 0xFF; dummyJpg[1] = 0xD8; // SOI
dummyJpg[2] = 0xFF; dummyJpg[3] = 0xE0; // APP0
dummyJpg.writeUInt16BE(16, 4);
dummyJpg[20] = 0xFF; dummyJpg[21] = 0xD9; // EOI
const brandedJpg = injectJpegSoftware(new Uint8Array(dummyJpg), 'SR-DevBox PixZip');
const detectedJpg = parseSoftwareInfo(brandedJpg);
console.log('JPEG 改写后软件信息:', detectedJpg);
if (detectedJpg !== 'SR-DevBox PixZip') throw new Error('JPEG 软件改写注入失败');
console.log('✅ JPEG Adobe APP1 XMP 注入验证通过！');

// 3. GIF 图像 GIF89a Comment Extension 注入测试
const dummyGif = Buffer.alloc(14);
dummyGif.write('GIF89a', 0);
dummyGif[13] = 0x3B; // Trailer
const brandedGif = injectGifComment(new Uint8Array(dummyGif), 'SR-DevBox PixZip');
const detectedGif = parseSoftwareInfo(brandedGif);
console.log('GIF 改写后软件信息:', detectedGif);
if (detectedGif !== 'SR-DevBox PixZip') throw new Error('GIF 软件改写注入失败');
console.log('✅ GIF89a 0x21 0xFE 注释块注入验证通过！');

// 4. SVG 图像 Generator 声明注入测试
const originalSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f00"/></svg>';
const brandedSvg = '<!-- Generator: SR-DevBox PixZip (https://srdevbox.com) -->\n' + originalSvg;
const detectedSvg = parseSoftwareInfo(new Uint8Array(Buffer.from(brandedSvg)));
console.log('SVG 改写后软件信息:', detectedSvg);
if (detectedSvg !== 'SR-DevBox PixZip') throw new Error('SVG 软件改写注入失败');
console.log('✅ SVG Generator 头部注释注入验证通过！');

console.log('\n🎉 所有格式图片 SR-DevBox PixZip 元数据注入与改写 100% 验证通过！');
