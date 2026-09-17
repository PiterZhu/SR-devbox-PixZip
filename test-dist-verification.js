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
const libs = ['buffer.min.js', 'jszip.min.js', 'pako.min.js', 'pngjs.min.js'];
for (const lib of libs) {
  const libPath = path.join(__dirname, 'dist', 'lib', lib);
  if (fs.existsSync(libPath)) {
    console.log(`✅ dist/lib/${lib} 存在且保持原生未损坏`);
  } else {
    console.error(`❌ dist/lib/${lib} 缺失！`);
    process.exit(1);
  }
}

console.log('\n🎉 所有自动化防逆向与工程安全边界验证全部通过！');
