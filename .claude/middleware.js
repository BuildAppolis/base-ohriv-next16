const chokidar = require('chokidar');
const path = require('path');

// Auto-start file change detection when running dev server
if (process.env.NODE_ENV === 'development' && process.env.NEXT_MANUAL_SIG_HANDLE !== 'true') {
  console.log('🔍 Auto file-change monitoring enabled');

  const watcher = chokidar.watch('src/**/*.{ts,tsx,js,jsx}', {
    ignored: /node_modules|\.git/,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', (filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`\n📝 Changed: ${relativePath}`);
    console.log('⏳ Next.js hot reloading...\n');
  });

  watcher.on('add', (filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`\n➕ Added: ${relativePath}`);
    console.log('⏳ Next.js will detect new file...\n');
  });
}

// Export empty to make this a valid module
module.exports = {};