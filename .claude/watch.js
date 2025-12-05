#!/usr/bin/env node

const chokidar = require('chokidar');
const path = require('path');
const colors = require('colors');

// Set up colors for different file types
colors.setTheme({
  info: 'cyan',
  warn: 'yellow',
  success: 'green',
  error: 'red',
  src: 'magenta',
  config: 'blue'
});

// Get the pattern from command line args or use default
const pattern = process.argv[2] || 'src/**/*.{ts,tsx,js,jsx}';

console.log(`🔍 Watching for changes in: ${pattern.info}`);
console.log('Press Ctrl+C to stop\n');

// Initialize watcher
const watcher = chokidar.watch(pattern, {
  ignored: /node_modules|\.git/,
  persistent: true,
  ignoreInitial: true
});

// Add event handlers
watcher
  .on('add', path => {
    const fileType = path.includes('src/') ? 'src' : 'info';
    console.log(`➕ File ${path[fileType]}`);
  })
  .on('change', path => {
    const fileType = path.includes('src/') ? 'src' :
                     path.includes('package.json') || path.includes('.json') ? 'config' : 'info';
    console.log(`🔄 Changed ${path[fileType]}`);
  })
  .on('unlink', path => {
    console.log(`🗑️  Deleted ${path.error}`);
  })
  .on('error', error => {
    console.error(`Watcher error: ${error.error}`);
  });

console.log('⚡ Watcher is ready...'.success);