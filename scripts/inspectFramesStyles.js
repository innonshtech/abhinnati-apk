const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/Abhinnati/figma_file_new.json', 'utf8'));
const canvas = data.document.children.find(c => c.type === 'CANVAS');

const targetFrames = ['91:520', '91:241', '91:375'];
let output = '';

targetFrames.forEach(frameId => {
  const frame = canvas.children.find(c => c.id === frameId);
  if (!frame) {
    output += `Frame ${frameId} not found\n`;
    return;
  }
  
  output += `\n================ STYLE DETAILS FOR FRAME: "${frame.name}" (ID: ${frame.id}) ================\n`;
  
  const printNodeDetails = (node, depth = 0) => {
    const indent = ' '.repeat(depth * 2);
    let extra = '';
    
    if (node.type === 'TEXT') {
      const ts = node.style || {};
      extra = ` -> Text: "${node.characters}" | Font: ${ts.fontFamily} ${ts.fontWeight} sz:${ts.fontSize} lh:${ts.lineHeightPx} color:${JSON.stringify(node.fills?.[0]?.color)}`;
    } else {
      const box = node.absoluteBoundingBox || {};
      const fills = node.fills || [];
      const fillColors = fills.map(f => f.color ? JSON.stringify(f.color) : f.type).join(', ');
      extra = ` -> Box: ${box.width}x${box.height} @ [${box.x}, ${box.y}] | Fills: [${fillColors}] | Radius: ${node.cornerRadius || node.rectangleCornerRadii || 0}`;
    }
    
    output += `${indent}- [${node.type}] "${node.name}" (ID: ${node.id})${extra}\n`;
    
    if (node.children) {
      node.children.forEach(c => printNodeDetails(c, depth + 1));
    }
  };
  
  printNodeDetails(frame);
});

fs.writeFileSync('./frames_info.txt', output, 'utf8');
console.log('Done!');

