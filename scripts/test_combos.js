function testCombos(facing_dir, inputs) {
  const TIEMPO_MAX_COMBO = 0.5;
  let input_buffer = [];
  let triggered = null;

  function _get_relative_buffer() {
    return input_buffer.map(inp => {
      if (inp === "left") return facing_dir > 0 ? "back" : "fwd";
      if (inp === "right") return facing_dir > 0 ? "fwd" : "back";
      return inp;
    });
  }

  function verificar_combos() {
    if (input_buffer.length < 3) return;
    const rel_last_3 = _get_relative_buffer().slice(-3);
    const raw_last_3 = input_buffer.slice(-3);
    
    const isEq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

    if (isEq(rel_last_3, ["back", "back", "p_high"]) || isEq(raw_last_3, ["left", "left", "p_high"])) {
      triggered = { move: "rugido", dmg: 10.0 };
      input_buffer = [];
      return;
    }
    if (isEq(rel_last_3, ["down", "back", "p_high"]) || isEq(raw_last_3, ["down", "left", "p_high"])) {
      triggered = { move: "motosierra", dmg: 12.0 };
      input_buffer = [];
      return;
    }
    if (isEq(rel_last_3, ["fwd", "back", "k_high"]) || isEq(raw_last_3, ["right", "left", "k_high"])) {
      triggered = { move: "mic", dmg: 0.0, stun: 2.0 };
      input_buffer = [];
      return;
    }
    if (isEq(rel_last_3, ["down", "fwd", "k_high"]) || isEq(raw_last_3, ["down", "right", "k_high"])) {
      triggered = { move: "mordisco", dmg: 16.0 };
      input_buffer = [];
      return;
    }
  }

  for (const inp of inputs) {
    input_buffer.push(inp);
    if (input_buffer.length > 8) input_buffer.shift();
    verificar_combos();
  }
  return triggered;
}

console.log("Facing RIGHT (facing_dir=1):");
console.log("1. Rugido:", testCombos(1, ["left", "left", "p_high"]));
console.log("2. Motosierra:", testCombos(1, ["down", "left", "p_high"]));
console.log("3. Micrófono:", testCombos(1, ["right", "left", "k_high"]));
console.log("4. Mordisco:", testCombos(1, ["down", "right", "k_high"]));

console.log("\nFacing LEFT (facing_dir=-1, relative back/fwd):");
console.log("1. Rugido (back,back):", testCombos(-1, ["right", "right", "p_high"]));
console.log("2. Motosierra (down,back):", testCombos(-1, ["down", "right", "p_high"]));
console.log("3. Micrófono (fwd,back):", testCombos(-1, ["left", "right", "k_high"]));
console.log("4. Mordisco (down,fwd):", testCombos(-1, ["down", "left", "k_high"]));

console.log("\nFacing LEFT (literal raw inputs fallback):");
console.log("1. Rugido literal:", testCombos(-1, ["left", "left", "p_high"]));
console.log("2. Motosierra literal:", testCombos(-1, ["down", "left", "p_high"]));
console.log("3. Micrófono literal:", testCombos(-1, ["right", "left", "k_high"]));
console.log("4. Mordisco literal:", testCombos(-1, ["down", "right", "k_high"]));
