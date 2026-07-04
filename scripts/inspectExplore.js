const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/Abhinnati/figma_file_new.json', 'utf8'));
const canvas = data.document.children.find(c => c.type === 'CANVAS');
const explore = canvas.children.find(c => c.id === '91:241');

if (explore) {
  console.log(`\n================ EXPLORE ID: ${explore.id} ================`);
  const traverse = (node, depth = 0) => {
    const indent = ' '.repeat(depth * 2);
    let details = '';
    if (node.type === 'TEXT') {
      details = ` -> Text: "${node.characters}"`;
    } else if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
      details = ` -> Size: ${node.absoluteBoundingBox?.width}x${node.absoluteBoundingBox?.height}`;
    }
    console.log(`${indent}- [${node.type}] ${node.name} (ID: ${node.id})${details}`);
    
    if (node.children && depth < 3) {
      node.children.forEach(c => traverse(c, depth + 1));
    }
  };
  traverse(explore);
} else {
  console.log('Explore frame not found');
}
