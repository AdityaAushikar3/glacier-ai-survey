const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', '.antigravity_backup');
const SRC_DIR = path.join(__dirname, '..', 'src');

const mappings = [
  { from: 'globals.css', to: path.join(SRC_DIR, 'app', 'globals.css') },
  { from: 'layout.tsx', to: path.join(SRC_DIR, 'app', 'layout.tsx') },
  { from: 'page.tsx', to: path.join(SRC_DIR, 'app', 'page.tsx') },
  { from: 'creator.tsx', to: path.join(SRC_DIR, 'components', 'creator.tsx') },
  { from: 'mascot.tsx', to: path.join(SRC_DIR, 'components', 'mascot.tsx') },
];

console.log('🔄 Restoring Goofy Retro Neon Arcade Theme from checkpoint...');

try {
  mappings.forEach(({ from, to }) => {
    const backupPath = path.join(BACKUP_DIR, from);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    // Ensure destination directory exists
    const destDir = path.dirname(to);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(backupPath, to);
    console.log(`✅ Restored ${from} -> ${path.relative(path.join(__dirname, '..'), to)}`);
  });
  console.log('🎉 Successfully restored the visual layout checkpoint!');
} catch (error) {
  console.error('❌ Error restoring layout checkpoint:', error.message);
  process.exit(1);
}
