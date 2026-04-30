const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function replaceColors() {
  const srcDir = path.join(__dirname, 'src');
  
  walkDir(srcDir, (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace gradients with flat colors
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#007AFF\]\s+(?:via-\[[^\]]+\]\s+)?to-\[[^\]]+\]/g, 'bg-[#007AFF]');
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#34c759\]\s+(?:via-\[[^\]]+\]\s+)?to-\[[^\]]+\]/g, 'bg-[#34c759]');
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#ff9500\]\s+(?:via-\[[^\]]+\]\s+)?to-\[[^\]]+\]/g, 'bg-[#ff9500]');
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#ff3b30\]\s+(?:via-\[[^\]]+\]\s+)?to-\[[^\]]+\]/g, 'bg-[#ff3b30]');
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#5856d6\]\s+(?:via-\[[^\]]+\]\s+)?to-\[[^\]]+\]/g, 'bg-[#5856d6]');
    
    // Also specific ones like from-[#f8fafc] to-white -> bg-[#f8fafc]
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#f8fafc\]\s+to-white/g, 'bg-[#f8fafc]');
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[#e8f4fd\]\s+to-\[#f0f8ff\]/g, 'bg-[#e8f4fd]');

    // Replace shadow values that look too extreme if any, though shadow-md is fine.
    // Example: shadow-[0_8px_24px_rgba(0,122,255,0.3)]
    content = content.replace(/shadow-\[0_8px_24px_rgba\([^\]]+\)\]/g, 'shadow-md');
    content = content.replace(/hover:shadow-\[0_12px_32px_rgba\([^\]]+\)\]/g, 'hover:shadow-lg');

    // Additional generic gradient remover just in case
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-\[([A-Za-z0-9#]+)\]\s+to-\[([A-Za-z0-9#]+)\]/g, 'bg-[$1]');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  });
}

replaceColors();
