const { getExternalExecutables } = require("../utils/pathUtils");

const builtinCommands = ["echo", "exit", "type", "pwd", "cd", "history"];

const getLongestCommonPrefix = (strings) => {
  if (!strings.length) return "";
  if (strings.length === 1) return strings[0];
  
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
};

let lastCompletion = { prefix: "", count: 0, hits: [] };

const completer = (line) => {
  // Get all executables (builtins + external)
  const trimmedLine = line.trim();
  const allCommands = [...builtinCommands, ...getExternalExecutables()];
  const hits = allCommands.filter((c) => c.startsWith(trimmedLine)).sort();

  // Track completion state
  if (lastCompletion.prefix === trimmedLine) {
    lastCompletion.count++;
  } else {
    lastCompletion.prefix = trimmedLine;
    lastCompletion.count = 1;
    lastCompletion.hits = hits;
  }

  if (hits.length === 0) {
    process.stdout.write("\x07"); // Bell sound
    return [[], line];
  } else if (hits.length === 1) {
    // Single match - autocomplete
    lastCompletion.count = 0;
    return [[hits[0] + " "], trimmedLine];
  } else {
    const commonPrefix = getLongestCommonPrefix(hits);
    if (commonPrefix.length > trimmedLine.length) {
      // If there's a common prefix longer than the current input
      lastCompletion.count = 0;
      return [[commonPrefix], trimmedLine];
    } else {
      if (lastCompletion.count === 1) {
        process.stdout.write("\x07"); // Bell sound on first tab
        return [[], line];
      }
      else if (lastCompletion.count === 2) {
        // Show matches on second tab
        process.stdout.write("\n" + hits.join("  ") + "\n");
        return [[], line];
      }
      return [[], line];
    }
  }
};

module.exports = { completer };