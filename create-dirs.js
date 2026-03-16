const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'apps', 'api', 'src', 'modules');
const dirs = [
  path.join(baseDir, 'jobs'),
  path.join(baseDir, 'students')
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Created: ${dir}`);
});

// List contents
const modules = fs.readdirSync(baseDir, { withFileTypes: true });
console.log('\nContents of modules directory:');
modules.forEach(entry => {
  const type = entry.isDirectory() ? '[DIR]' : '[FILE]';
  console.log(`${type}  ${entry.name}`);
});
