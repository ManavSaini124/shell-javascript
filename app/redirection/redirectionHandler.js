
const fs = require("fs");
const { ensureDirExists } = require("../utils/pathUtils");

const withRedirection = (args, callback) => {
  let commandArgs = [];
  let stdoutTarget = null;
  let stderrTarget = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if ((arg === '>' || arg === '1>') && next) {
      stdoutTarget = next;
      i++; // skip next (file path)
    } else if (arg === '2>' && next) {
      stderrTarget = next;
      i++;
    } else {
      commandArgs.push(arg);
    }
  }

  const originalStdout = process.stdout.write;
  const originalStderr = process.stderr.write;

  if (stdoutTarget) {
    ensureDirExists(stdoutTarget);
    const fd = fs.openSync(stdoutTarget, 'w');
    process.stdout.write = (chunk, encoding, cb) => {
      fs.writeSync(fd, chunk);
      if (cb) cb();
      return true;
    };
  }

  if (stderrTarget) {
    ensureDirExists(stderrTarget);
    const fd = fs.openSync(stderrTarget, 'w');
    process.stderr.write = (chunk, encoding, cb) => {
      fs.writeSync(fd, chunk);
      if (cb) cb();
      return true;
    };
  }

  try {
    callback(commandArgs);
  } finally {
    // Restore stdout/stderr
    process.stdout.write = originalStdout;
    process.stderr.write = originalStderr;
  }
};

module.exports = { withRedirection };