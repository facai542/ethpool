const fs = require('fs');
const path = require('path');

// 递归查找所有需要修复的文件
function findFiles(dir, extensions) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 修复重复字段名
function fixDuplicateFields(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // 修复重复的字段名
    const fieldMappings = [
      // 修复重复的wallet_address
      { from: /wallet_wallet_address/g, to: 'wallet_address' },
      { from: /wallet_wallet_wallet_address/g, to: 'wallet_address' },
      { from: /wallet_wallet_wallet_wallet_address/g, to: 'wallet_address' },
      { from: /wallet_wallet_wallet_wallet_wallet_address/g, to: 'wallet_address' },
      
      // 修复重复的address
      { from: /address_address/g, to: 'address' },
      { from: /address_address_address/g, to: 'address' },
      
      // 修复其他重复字段
      { from: /created_at_created_at/g, to: 'created_at' },
      { from: /updated_at_updated_at/g, to: 'updated_at' },
      { from: /user_id_user_id/g, to: 'user_id' },
    ];
    
    for (const mapping of fieldMappings) {
      if (mapping.from.test(content)) {
        content = content.replace(mapping.from, mapping.to);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ 无需修复: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🔧 开始修复重复字段名...');
  
  const files = findFiles('src', ['.ts', '.tsx']);
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixDuplicateFields(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ 修复完成！共处理 ${files.length} 个文件，成功修复 ${fixedCount} 个文件`);
}

main();
