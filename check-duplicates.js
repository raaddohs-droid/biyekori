const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FOLDER = 'C:\\Users\\tehsi\\Desktop\\biyekori\\Male Batch 3';

function getFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function main() {
  const files = fs.readdirSync(FOLDER).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📁 Total photos: ${files.length}\n`);

  const hashMap = {};
  const duplicates = [];

  for (const file of files) {
    const filePath = path.join(FOLDER, file);
    const hash = getFileHash(filePath);
    
    if (hashMap[hash]) {
      duplicates.push({ original: hashMap[hash], duplicate: file });
    } else {
      hashMap[hash] = file;
    }
  }

  if (duplicates.length === 0) {
    console.log('✅ No exact duplicate photos found! All 63 are unique.');
  } else {
    console.log(`⚠️  Found ${duplicates.length} exact duplicates:\n`);
    duplicates.forEach(d => {
      console.log(`  Original:  ${d.original}`);
      console.log(`  Duplicate: ${d.duplicate}\n`);
    });
    console.log(`\n💡 You can safely delete the duplicates listed above.`);
  }
}

main();
