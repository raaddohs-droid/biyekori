const fs = require('fs');
const path = require('path');

const FOLDER = 'C:\\Users\\tehsi\\Desktop\\biyekori\\Male Batch 3';

function main() {
  const files = fs.readdirSync(FOLDER).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📁 Found ${files.length} photos to rename\n`);

  let count = 0;
  for (let i = 0; i < files.length; i++) {
    const oldName = files[i];
    const ext = path.extname(oldName).toLowerCase();
    const newName = `male_batch3_${i + 1}${ext}`;
    
    const oldPath = path.join(FOLDER, oldName);
    const newPath = path.join(FOLDER, newName);

    if (oldName === newName) {
      console.log(`⏭️  Already named: ${newName}`);
      continue;
    }

    fs.renameSync(oldPath, newPath);
    console.log(`✅ ${oldName} → ${newName}`);
    count++;
  }

  console.log(`\n🎉 Done! Renamed ${count} files.`);
  console.log(`📸 Files are now: male_batch3_1 to male_batch3_${files.length}`);
}

main();
