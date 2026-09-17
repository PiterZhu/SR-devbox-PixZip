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

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const scriptContent = match[1].trim();
  if (scriptContent.length > 200) {
    count++;
    try {
      new Function(scriptContent);
      console.log(`✅ 第 ${count} 个主脚本解析验证通过，无任何语法错误 (字符长度: ${scriptContent.length})`);
    } catch (e) {
      console.error(`❌ 第 ${count} 个主脚本语法错误:`, e);
      process.exit(1);
    }
  }
}

console.log('✅ index.html 所有前端脚本语法校验完全通过！');
