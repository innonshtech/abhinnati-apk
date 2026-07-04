const fs = require('fs');
const path = 'd:/Abhinnati/figma_file_new.json';
const raw = fs.readFileSync(path, 'utf8');
const data = JSON.parse(raw);
const pages = data.document.children.filter(c => c.type === 'CANVAS');
let frames = [];
pages.forEach(page => {
  const traverse = (node) => {
    if (node.type === 'FRAME') {
      frames.push({ id: node.id, name: node.name });
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(page);
});
console.log(JSON.stringify(frames, null, 2));
