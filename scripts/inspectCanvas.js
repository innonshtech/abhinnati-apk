const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/Abhinnati/figma_file_new.json', 'utf8'));
const canvas = data.document.children.find(c => c.type === 'CANVAS');
if (canvas) {
  console.log('Top level canvas elements:');
  canvas.children.forEach(c => {
    console.log(`- ID: ${c.id}, Name: "${c.name}", Type: ${c.type}`);
  });
} else {
  console.log('No CANVAS found');
}
