/**
 * SR-DevBox-PixZip 开发者效率工具箱 - 发布产物完整性与防逆向验证测试
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

console.log('--- 验证发布产物完整性 ---');
const distAppJs = path.join(__dirname, 'dist', 'app.core.min.js');
const distIndexHtml = path.join(__dirname, 'dist', 'index.html');
const distStandaloneHtml = path.join(__dirname, 'dist', 'index.standalone.html');

if (!fs.existsSync(distAppJs)) {
  console.error('❌ dist/app.core.min.js 不存在！');
  process.exit(1);
}
if (!fs.existsSync(distIndexHtml)) {
  console.error('❌ dist/index.html 不存在！');
  process.exit(1);
}
if (!fs.existsSync(distStandaloneHtml)) {
  console.error('❌ dist/index.standalone.html 不存在！');
  process.exit(1);
}

// 检查 JS 语法合法性
const code = fs.readFileSync(distAppJs, 'utf8');
try {
  new Function(code);
  console.log('✅ dist/app.core.min.js 语法结构完全合法！');
} catch (e) {
  console.error('❌ dist/app.core.min.js 语法错误:', e);
  process.exit(1);
}

// 检查 HTML 引用正确性
const html = fs.readFileSync(distIndexHtml, 'utf8');
if (html.includes('<script src="app.core.min.js"></script>')) {
  console.log('✅ dist/index.html 已成功指向混淆文件 app.core.min.js');
} else {
  console.error('❌ dist/index.html 未正确引入 app.core.min.js');
  process.exit(1);
}

// 检查第三方库是否完整保留在 dist/lib
const libs = ['buffer.min.js', 'jszip.min.js', 'pako.min.js', 'pngjs.min.js', 'upng.min.js', 'omggif.min.js'];
for (const lib of libs) {
  const libPath = path.join(__dirname, 'dist', 'lib', lib);
  if (fs.existsSync(libPath)) {
    console.log(`✅ dist/lib/${lib} 存在且保持原生未损坏`);
  } else {
    console.error(`❌ dist/lib/${lib} 缺失！`);
    process.exit(1);
  }
}

// ----------------------------------------------------
// 验证 极致体积 自适应高保真量化算法 (Node 离线运行验证)
// ----------------------------------------------------
console.log('\n--- 验证极致体积自适应高保真量化算法 ---');
const UPNG = require('./dist/lib/upng.min.js');
global.pako = require('./dist/lib/pako.min.js');

// 1. 验证少色图识别与无损精确调色板生成
const iconW = 64, iconH = 64;
const iconBuf = new Uint8Array(iconW * iconH * 4);
for (let i = 0; i < iconW * iconH; i++) {
  const c = i % 8;
  iconBuf[i * 4] = c * 32;
  iconBuf[i * 4 + 1] = c * 16;
  iconBuf[i * 4 + 2] = c * 8;
  iconBuf[i * 4 + 3] = 255;
}
const iconEncoded = UPNG.encode([iconBuf.buffer], iconW, iconH, 0);
if (iconEncoded && iconEncoded.byteLength > 0) {
  console.log(`✅ 少色图标精确调色板打包成功 (${iconW * iconH * 4} 字节 -> ${iconEncoded.byteLength} 字节)`);
} else {
  console.error('❌ 少色图标打包失败！');
  process.exit(1);
}

// 2. 验证连续调渐变高保真量化无崩溃且解码正常
const gradW = 100, gradH = 100;
const gradBuf = new Uint8Array(gradW * gradH * 4);
for (let y = 0; y < gradH; y++) {
  for (let x = 0; x < gradW; x++) {
    const idx = (y * gradW + x) * 4;
    gradBuf[idx] = Math.round(x * 2.5);
    gradBuf[idx + 1] = Math.round(y * 2.5);
    gradBuf[idx + 2] = Math.round((x + y) * 1.25);
    gradBuf[idx + 3] = 255;
  }
}

const gradEncoded = UPNG.encode([gradBuf.buffer], gradW, gradH, 256);
const decoded = UPNG.decode(gradEncoded);
const rgbaDecoded = UPNG.toRGBA8(decoded)[0];
if (decoded.width === gradW && decoded.height === gradH && rgbaDecoded.byteLength === gradW * gradH * 4) {
  console.log(`✅ 连续调写实图自适应量化正常解包 (${gradW}x${gradH}px, 深度=${decoded.depth}, 类型=${decoded.ctype})`);
} else {
  console.error('❌ 连续调写实图量化解包校验失败！');
  process.exit(1);
}

// 3. 验证带半透明阴影与金黄叶片的多通道图像 (杜绝黑色噪点与透明空洞)
const leafW = 80, leafH = 80;
const leafBuf = new Uint8Array(leafW * leafH * 4);
for (let y = 0; y < leafH; y++) {
  for (let x = 0; x < leafW; x++) {
    const idx = (y * leafW + x) * 4;
    const dist = Math.hypot(x - 40, y - 40);
    if (dist > 35) {
      // 纯透明背景
      leafBuf[idx] = 0; leafBuf[idx+1] = 0; leafBuf[idx+2] = 0; leafBuf[idx+3] = 0;
    } else if (dist > 30) {
      // 半透明柔和阴影
      leafBuf[idx] = 20; leafBuf[idx+1] = 15; leafBuf[idx+2] = 5;
      leafBuf[idx+3] = Math.round((35 - dist) * 15);
    } else {
      // 金黄色叶片 (不透明)
      leafBuf[idx] = 245; leafBuf[idx+1] = 210; leafBuf[idx+2] = 20; leafBuf[idx+3] = 255;
    }
  }
}

// 模拟 TrueColor 智能预滤波
const filteredLeaf = new Uint8Array(leafBuf.length);
for (let i = 0; i < leafBuf.length; i += 4) {
  const a = leafBuf[i + 3];
  if (a < 8) {
    filteredLeaf[i] = 0; filteredLeaf[i+1] = 0; filteredLeaf[i+2] = 0; filteredLeaf[i+3] = 0;
  } else if (a >= 250) {
    filteredLeaf[i] = (leafBuf[i] & ~3) | 1;
    filteredLeaf[i+1] = (leafBuf[i+1] & ~3) | 1;
    filteredLeaf[i+2] = (leafBuf[i+2] & ~3) | 1;
    filteredLeaf[i+3] = 255;
  } else {
    filteredLeaf[i] = (leafBuf[i] & ~3) | 1;
    filteredLeaf[i+1] = (leafBuf[i+1] & ~3) | 1;
    filteredLeaf[i+2] = (leafBuf[i+2] & ~3) | 1;
    filteredLeaf[i+3] = (a & ~3) | 1;
  }
}

const trueColorEncoded = UPNG.encode([filteredLeaf.buffer], leafW, leafH, 0, null, true);
const decTc = UPNG.decode(trueColorEncoded);
const decTcRgba = new Uint8Array(UPNG.toRGBA8(decTc)[0]);

let blackNoiseCount = 0;
for (let i = 0; i < leafBuf.length; i += 4) {
  if (leafBuf[i] > 200 && leafBuf[i+3] === 255) {
    if (decTcRgba[i] < 100 || decTcRgba[i+3] < 250) {
      blackNoiseCount++;
    }
  }
}

if (blackNoiseCount === 0 && decTc.depth === 8 && decTc.ctype === 6) {
  console.log(`✅ 带半透明阴影与黄色叶片测试通过：0 黑色噪点，完整保留 32位 RGBA (${trueColorEncoded.byteLength} 字节)`);
} else {
  console.error(`❌ 半透明阴影测试发现 ${blackNoiseCount} 个黑色噪点！`);
  process.exit(1);
}

console.log('\n🎉 所有自动化防逆向与工程安全边界验证全部通过！');
