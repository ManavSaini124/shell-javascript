
const { spawnSync } = require("child_process");
const { findExecutablePath } = require("../utils/pathUtils");

const executeExternalCommand = (args) => {
  if (args.length === 0) return false;

  const command = args[0];
  const commandArguments = args.slice(1);
  const fullPath = findExecutablePath(command);

  if (fullPath) {
    const options = {
      encoding: "utf8",
      stdio: 'inherit',
      argv0: command,
    };

    spawnSync(fullPath, commandArguments, options);
    return true;
  }

  return false;
};

module.exports = { executeExternalCommand };