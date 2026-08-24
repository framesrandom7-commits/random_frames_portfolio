const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const regex1 = /      \/\/ Video hover play\/pause logic[\s\S]*?      \}\);\n/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (regex1.test(content)) {
    content = content.replace(regex1, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned ${file}`);
  }
});
