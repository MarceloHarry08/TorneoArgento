// Automated test for keyboard controls integration
const fs = require('fs');

console.log('Testing new controls configuration...');

const mainJs = fs.readFileSync('js/main.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const uiJs = fs.readFileSync('js/ui.js', 'utf8');

let errors = [];

// 1. Check Movement keys (Red circle)
const moveKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
moveKeys.forEach(k => {
    if (!mainJs.includes(`e.code === '${k}'`)) {
        errors.push(`Missing movement key listener for ${k}`);
    }
});

// 2. Check Action keys (Blue circle)
const actionKeys = ['Insert', 'Home', 'Delete', 'End', 'PageDown', 'PageUp'];
actionKeys.forEach(k => {
    if (!mainJs.includes(`e.code === '${k}'`)) {
        errors.push(`Missing action key listener for ${k}`);
    }
});

// 3. Check Block / Cubrirse logic
if (!mainJs.includes("gameEngine.p1.block(true)") || !mainJs.includes("gameEngine.p1.block(false)")) {
    errors.push("Missing block(true) or block(false) call on Delete key");
}

// 4. Check preventDefault on navigation keys
if (!mainJs.includes("e.preventDefault()")) {
    errors.push("Missing preventDefault to prevent browser scrolling");
}

// 5. Check Controls guide updated in index.html
if (!indexHtml.includes("Círculo Rojo") || !indexHtml.includes("CUBRIRSE")) {
    errors.push("Controls guide in index.html not updated with new controls");
}

if (errors.length > 0) {
    console.error('FAIL: Found errors:');
    errors.forEach(e => console.error(' - ' + e));
    process.exit(1);
} else {
    console.log('SUCCESS: All new keyboard controls verified in code!');
}
