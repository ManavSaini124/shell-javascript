
const fs = require("fs");
const { spawn } = require("child_process");
const { findExecutablePath } = require("../utils/pathUtils");
const { bashSplit } = require("../utils/bashParser");

const executePipeline = (input, historyManager) => {
  const pipelineParts = input.split('|').map(s => s.trim());
  const processes = [];
  let prevStdout = null;

  for (let i = 0; i < pipelineParts.length; i++) {
    const args = bashSplit(pipelineParts[i]);
    if (args.length === 0) continue;

    const cmd = args[0];
    const cmdArgs = args.slice(1);

    // Find the executable path
    let execPath = cmd;
    const builtins = ['echo', 'exit', 'type', 'pwd', 'cd', 'history'];
    
    if (!builtins.includes(cmd)) {
      execPath = findExecutablePath(cmd);
      if (!execPath) {
        console.log(`${cmd}: command not found`);
        return;
      }
    }

    const options = {
      stdio: [
        prevStdout ? 'pipe' : 'inherit',
        i === pipelineParts.length - 1 ? 'inherit' : 'pipe',
        'inherit'
      ]
    };

    let proc;
    if (builtins.includes(cmd)) {
      // Create a simple Node process for built-ins
      const commandHistory = historyManager.getHistory();
      const script = `
        const fs = require('fs');
        const args = ${JSON.stringify(args)};
        const cmd = args[0];
        
        if (cmd === 'type') {
          const builtins = ['echo', 'exit', 'type', 'pwd', 'cd', 'history'];
          const target = args[1];
          if (builtins.includes(target)) {
            console.log(target + ' is a shell builtin');
          } else {
            console.log(target + ': not found');
          }
        } else if (cmd === 'echo') {
          console.log(args.slice(1).join(' '));
        } else if (cmd === 'pwd') {
          console.log(process.cwd());
        } else if (cmd === 'history') {
          const history = ${JSON.stringify(commandHistory)};
          
          if (args.length >= 3 && args[1] === '-r') {
            const filePath = args[2];
            try {
              if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const lines = fileContent.split('\\n')
                  .map(line => line.trim())
                  .filter(line => line.length > 0);
                console.log('history: read operation completed');
              }
            } catch (err) {
              console.log('history: cannot read ' + filePath + ': ' + err.message);
            }
          } else if (args.length >= 3 && args[1] === '-w') {
            const filePath = args[2];
            try {
              const historyContent = history.join('\\n') + '\\n';
              fs.writeFileSync(filePath, historyContent, 'utf8');
            } catch (err) {
              console.log('history: cannot write ' + filePath + ': ' + err.message);
            }
          } else if (args.length >= 3 && args[1] === '-a') {
            const filePath = args[2];
            try {
              const historyContent = history.join('\\n') + '\\n';
              fs.appendFileSync(filePath, historyContent, 'utf8');
            } catch (err) {
              console.log('history: cannot append to ' + filePath + ': ' + err.message);
            }
          } else {
            let numToShow = history.length;
            
            if (args.length > 1) {
              const n = parseInt(args[1]);
              if (!isNaN(n) && n > 0) {
                numToShow = Math.min(n, history.length);
              }
            }
            
            const startIndex = Math.max(0, history.length - numToShow);
            for (let i = startIndex; i < history.length; i++) {
              console.log('    ' + (i + 1) + '  ' + history[i]);
            }
          }
        }
      `;
      proc = spawn('node', ['-e', script], options);
    } else {
      proc = spawn(execPath, cmdArgs, options);
    }

    if (prevStdout) {
      prevStdout.pipe(proc.stdin);
    }

    if (i !== pipelineParts.length - 1) {
      prevStdout = proc.stdout;
    }

    processes.push(proc);
  }

  const promises = processes.map(
    p => new Promise(resolve => p.on('close', resolve))
  );

  return Promise.all(promises);
};

module.exports = { executePipeline };
