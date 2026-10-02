const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ARTIFACT_DIR = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99';

const strips = [
  { name: 'p1', file: 'jefa_spritestrip_idle_crouch_96x96.png', frames: 7, cols: 7, rows: 1 },
  { name: 'p2', file: 'jefa_spritestrip_punches_96x96.png', frames: 8, cols: 8, rows: 1 },
  { name: 'p3', file: 'jefa_spritestrip_kicks_96x96.png', frames: 8, cols: 8, rows: 1 },
  { name: 'p4', file: 'jefa_spritestrip_block_walk_run_96x96.png', frames: 11, cols: 11, rows: 1 },
  { name: 'p5', file: 'jefa_spritestrip_jump_turn_96x96.png', frames: 6, cols: 6, rows: 1 },
  { name: 'p6', file: 'jefa_spritesheet_specials_fatality_96x96.png', frames: 18, cols: 6, rows: 3 }
];

strips.forEach(stripInfo => {
  const filePath = path.join(ARTIFACT_DIR, stripInfo.file);
  const png = PNG.sync.read(fs.readFileSync(filePath));
  console.log(`Verifying ${stripInfo.file}: ${png.width} x ${png.height}`);
  
  if (stripInfo.rows === 1) {
    for (let f = 0; f < stripInfo.frames; f++) {
      const cell = new PNG({ width: 96, height: 96 });
      let minX = 96, maxX = 0, minY = 96, maxY = 0, count = 0;
      for (let y = 0; y < 96; y++) {
        for (let x = 0; x < 96; x++) {
          const sIdx = (y * png.width + (f * 96 + x)) << 2;
          const a = png.data[sIdx + 3];
          const dIdx = (y * 96 + x) << 2;
          cell.data[dIdx] = png.data[sIdx];
          cell.data[dIdx + 1] = png.data[sIdx + 1];
          cell.data[dIdx + 2] = png.data[sIdx + 2];
          cell.data[dIdx + 3] = a;
          if (a > 10) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      const previewName = `${stripInfo.name}_f${f + 1}.png`;
      fs.writeFileSync(path.join(ARTIFACT_DIR, previewName), PNG.sync.write(cell));
      console.log(`  Frame ${f + 1} (${previewName}): ${count} px, x: ${minX}..${maxX}, y: ${minY}..${maxY}`);
    }
  } else {
    // 2D grid
    for (let r = 0; r < stripInfo.rows; r++) {
      for (let c = 0; c < stripInfo.cols; c++) {
        const cell = new PNG({ width: 96, height: 96 });
        let minX = 96, maxX = 0, minY = 96, maxY = 0, count = 0;
        for (let y = 0; y < 96; y++) {
          for (let x = 0; x < 96; x++) {
            const sIdx = (((r * 96 + y) * png.width) + (c * 96 + x)) << 2;
            const a = png.data[sIdx + 3];
            const dIdx = (y * 96 + x) << 2;
            cell.data[dIdx] = png.data[sIdx];
            cell.data[dIdx + 1] = png.data[sIdx + 1];
            cell.data[dIdx + 2] = png.data[sIdx + 2];
            cell.data[dIdx + 3] = a;
            if (a > 10) {
              count++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        const previewName = `${stripInfo.name}_r${r + 1}_c${c + 1}.png`;
        fs.writeFileSync(path.join(ARTIFACT_DIR, previewName), PNG.sync.write(cell));
        console.log(`  Cell r${r + 1} c${c + 1} (${previewName}): ${count} px, x: ${minX}..${maxX}, y: ${minY}..${maxY}`);
      }
    }
  }
});

console.log("All previews successfully extracted and verified!");
