const fs = require("fs");
const { PNG } = require("pngjs");

const pLeon = "C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/.user_uploaded/media_1790728763010.png";
const pngLeon = PNG.sync.read(fs.readFileSync(pLeon));
console.log("Leon uploaded size:", pngLeon.width, "x", pngLeon.height);

const pJefa = "C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/.user_uploaded/media_1790732899037.png";
const pngJefa = PNG.sync.read(fs.readFileSync(pJefa));
console.log("Jefa uploaded size:", pngJefa.width, "x", pngJefa.height);
