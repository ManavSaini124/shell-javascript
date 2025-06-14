const readline = require("readline");
const fs = require("fs");
const {spawnSync, spawn} = require("child_process");
const path = require("path");

const builtinCommands = ["echo", "exit", "type", "pwd", "cd","history"];

const getExternalExecutables = () => {
  const path_dir = process.env.PATH.split(':');
  // console.log("path_dir = ", path_dir);
  
  const Executables = new Set();
  for(const dir of path_dir){
    try{
      const files = fs.readdirSync(dir);
      // console.log("files = ",files);
      for (const file of files) {
        // console.log("file = ",file);
        const filePath = path.join(dir, file);
        // console.log("filePath = ",filePath);
        try{
          const stats = fs.statSync(filePath);
          fs.accessSync(filePath, fs.constants.X_OK);
          if (stats.isFile() ) {
            Executables.add(file);
          }
        }catch (err) {
          // Ignore errors for files that cannot be accessed
          // console.error(`Error accessing file ${filePath}: ${err.message}`);
        }
    }
  }catch (err) {
      // Ignore directories that cannot be read
      // console.error(`Error reading directory ${dir}: ${err.message}`);
    }
  }
  return [...Executables];
}

// let lastLine = "";
// let tabPressCount = 0;

// const completer = (line) => {
//   // Get all commands including builtins and external executables
//   const allCommands = [...builtinCommands, ...getExternalExecutables()];
//   // console.log("allCommands = ", allCommands);
//   const hits = allCommands.filter(cmd => cmd.startsWith(line)).sort();
//   if(line !== lastLine){
//     tabPressCount = 0; // Reset tab press count if line changes
//     lastLine = line;
//   }
//   if (hits.length === 1) {
//     // tabPressCount = 0;
//     // return [[hits[0] + " "], line];  // <-- autocomplete
//     tabPressCount = 0;
//     const completed = hits[0] + " ";
//     lastLine = completed;
//     return [[hits[0] + " "], line];  // <-- corrected


//   } else if (hits.length > 1) {
//     tabPressCount++;
//     if (tabPressCount === 1) {
//       process.stdout.write("\x07");
//     }
//     else if( tabPressCount === 2){
//       process.stdout.write("\n" + hits.join("  ") + "\n");
//       process.stdout.write(`$ ${line}`);

//     }
//     // return [hits.map(h => h + " "), line];    // <-- multiple suggestions
//     return [[], line]; // Keep the input unchanged
//   }
//   else{
//     process.stdout.write("\x07");
//     tabPressCount = 0; // Reset tab press count if no matches
//     return [[], line]; // Keep the input unchanged
//   }
//   // return [hits.length ? hits.map(h => h + " ") : [], line];
// };

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
// let lastToken = "";
// let tabPressCount = 0;

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
    if(hits[0] === "echo"){
      // console.log(`\n${[hits[0] + " "]}: missing argument`);
    }
    return [[hits[0] + " "], trimmedLine];
  }else{

    const commonPrefix = getLongestCommonPrefix(hits);
    if (commonPrefix.length > trimmedLine.length) {
      // If there's a common prefix longer than the current input
      lastCompletion.count = 0;
      return [[commonPrefix], trimmedLine];
    }else{
      if (lastCompletion.count === 1) {
        process.stdout.write("\x07"); // Bell sound on first tab
        return [[], line];
      }
      else if (lastCompletion.count === 2) {
        // Show matches on second tab
        process.stdout.write("\n" + hits.join("  ") + "\n");
        if (typeof rl !== 'undefined') {
          rl.prompt(true);
        }

        return [[], line];
      }
      return [[], line];

    }
  }
};

// let lastToken = "";
// let tabPressCount = 0;
// const completer = (line) => {
//   const tokens = line.split(/\s+/);
//   const current = tokens[tokens.length - 1] || "";
//   const allCommands = [...builtinCommands, ...getExternalExecutables()];
//   const matches = allCommands.filter(cmd => cmd.startsWith(current)).sort();

//   if (current !== lastToken) {
//     tabPressCount = 0;
//     lastToken = current;
//   }

//   if (matches.length === 1) {
//     tabPressCount = 0;
//     const completed = matches[0] + ' ';
//     lastToken = completed;
//     return [[completed], current];
//   }

//   if (matches.length > 1) {
//     const lcp = getLongestCommonPrefix(matches);
//     if (lcp.length > current.length) {
//       lastToken = lcp;
//       tabPressCount = 0;
//       return [[lcp], current];
//     } else {
//       tabPressCount++;
//       if (tabPressCount === 1) {
//         process.stdout.write('\x07'); // bell
//       } else if (tabPressCount === 2) {
//         process.stdout.write('\n' + matches.join('  ') + '\n');
//         rl.prompt(true);
//       }
//       return [[], current];
//     }
//   }

//   process.stdout.write('\x07'); // bell for no match
//   tabPressCount = 0;
//   return [[], current];
// };



// const completer = (line) => {
//   const words = line.split(/\s+/);
//   const current = words[words.length - 1] || "";

//   const allCommands = [...builtinCommands, ...getExternalExecutables()];
//   const matches = allCommands.filter(cmd => cmd.startsWith(current)).sort();

//   if (current !== lastToken) {
//     tabPressCount = 0;
//     lastToken = current;
//   }

//   if (matches.length === 1) {
//     tabPressCount = 0;
//     const completed = matches[0];
//     lastToken = completed;
//     return [[matches[0] + " "], current]; // ✅ return suggestion and matched prefix
//   }
  
//   if (matches.length > 1) {
//     tabPressCount++;
//     if (tabPressCount === 1) {
//       process.stdout.write("\x07");
//     } else if (tabPressCount === 2) {
//       process.stdout.write("\n" + matches.join("  ") + "\n");
//       rl.prompt(true);
//     }
//     return [[], current];
//   }

//   process.stdout.write("\x07");
//   tabPressCount = 0;
//   return [[], current];
// };


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '$ ',
  completer: completer,
});

const commandHistory = [];

const builtins ={
  echo: (args)=>{
      console.log(args.slice(1).join(" "));
  },
  exit:(args)=>{
    if (args[0] === "exit" && args[1] === "0") {
      rl.close();
      process.exit(0);
  }
  },
  type: (args) => {
    if (args[0] === "type") {
      if (args.length < 2) {
        console.log("type: missing argument");
        return;
      }

      const command = args[1];
      
      // Check if it's a builtin
      if (builtinCommands.includes(command)) {
        console.log(`${command} is a shell builtin`);
        return;
      }
      
      // Check external commands in PATH
      const dirs = process.env.PATH.split(':');
      for (const dir of dirs) {
        const filePath = `${dir}/${command}`;
        try {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            console.log(`${command} is ${filePath}`);
            return;
          }
        } catch (err) {
          // Continue checking other directories
        }
      }
      
      console.log(`${command}: not found`);
    }
  },
  pwd: (args) => {
    if (args[0] === "pwd") {
      console.log(process.cwd());
    }
  },
  cd : (args) => {
    if(args[0] === "cd"){
      // Check if the directory exists
      if(args.slice(1).length === 0){
        console.log("cd: missing argument");
        return;
      }
      if( args[1] === "~"){
        const homeDir = process.env.HOME || process.env.USERPROFILE;
        if (homeDir) {
          process.chdir(homeDir);
          return;
        } else {
          console.log("cd: HOME not set");
          return;
        }
      }
      const dir = args.slice(1).join(" ");
      if (!fs.existsSync(dir)) {
        console.log(`cd: ${dir}: No such file or directory`);
        return;
      }
      if (!fs.statSync(dir).isDirectory()) {
        console.log(`cd: ${dir}: Not a directory`);
        return;
      }
      process.chdir(dir);
    }
  },
  history: (args) => {
    if (args[0] === "history") {
      let numToShow = commandHistory.length;
      if(args.length > 1){
        const numArg = parseInt(args[1], 10);
        if (!isNaN(numArg) && numArg > 0) {
          numToShow = Math.min(numArg, commandHistory.length);
        } else {
          console.log(`history: ${args[1]}: invalid number`);
          return;
        }
      }

      const startIndex = Math.max(0, commandHistory.length - numToShow);
      for (let i = startIndex; i < commandHistory.length; i++) {
        console.log(`    ${i + 1}  ${commandHistory[i]}`);
      }
    }
  }

}

const parting =(answer)=> bashSplit(answer);




function bashSplit(input) {
  const args = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escape) {
      if (inSingle) {
        // backslashes are literal inside single quotes
        current += '\\' + char;
      } else if (inDouble) {
        // only ", \, $, ` are escapable in double quotes
        if ('"\\$`'.includes(char)) {
          current += char;
        } else {
          current += '\\' + char;
        }
      } else {
        // outside quotes, just escape next char
        current += char;
      }
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    
    if (char === ' ' && !inSingle && !inDouble) {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}



const unexpected = (args,command) => {
  // If the first argument is not "echo" or "exit", print an error message
  if (!builtins[command]) {
    const runnable = externalCommand(args);
    if (!runnable) {
      console.log(`${args[0]}: command not found`);
    }
  }
};
// const externalCommand = (args) => {
//   if(args.length > 1){
//     const command_args = args.slice(1);
//     // spawnSync(args[0], command_args, {
//     //   stdio: 'inherit',
//     //   encoding: 'utf8',
//     // });
//     const command = args[0];
//     const paths = process.env.PATH.split(":");

//     for (const dir of paths) {
//       const fullPath = `${dir}/${command}`;
//       if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
//         const proc = spawnSync(args[0], args.slice(1), { stdio: "inherit", encoding: "utf8" });
//         return 1;
//       }
//     }
//     return 0;
//   }
// }
const externalCommand = (args) => {
  
  const redirectIndex = args.findIndex(arg => arg === '>' || arg === '1>');
  let commandArgs = args;
  let outputFile = null;

  if (redirectIndex !== -1) {
    if (!args[redirectIndex + 1]) {
      console.log("Redirection error: no output file specified");
      return 0;
    }
    outputFile = args[redirectIndex + 1];
    commandArgs = args.slice(0, redirectIndex);
  }

  if (commandArgs.length === 0) return 0;

  const command = commandArgs[0];
  const commandArguments = commandArgs.slice(1);
  const paths = process.env.PATH.split(":");

  for (const dir of paths) {
    const fullPath = `${dir}/${command}`;
    
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const options = {
          encoding: "utf8",
          stdio: outputFile
            ? ['inherit', fs.openSync(outputFile, 'w'), 'inherit']
            : 'inherit',
          argv0: command,
        };

        // ✅ Call the resolved path
        spawnSync(fullPath, commandArguments, options);
        return 1;
      }
    
  }

  return 0;
};
const ensureDirExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

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
      if (cb){ 
        cb();
      }
    };
  }

  if (stderrTarget) {
    ensureDirExists(stderrTarget);
    const fd = fs.openSync(stderrTarget, 'w');
    process.stderr.write = (chunk, encoding, cb) => {
      fs.writeSync(fd, chunk);
      if (cb) cb();
    };
  }

  // Run command (built-in or external)
  callback(commandArgs);

  // Restore stdout/stderr
  process.stdout.write = originalStdout;
  process.stderr.write = originalStderr;
};


// const withRedirection =(args, callback) => {
//   const redirectIndex = args.findIndex(arg => arg === '>' || arg === '1>');
//   let outputFile = null;
//   let commandArgs = args;

//   if (redirectIndex !== -1) {
//     outputFile = args[redirectIndex + 1];
//     commandArgs = args.slice(0, redirectIndex);
//   }

//   // Redirect stdout if needed
//   const originalWrite = process.stdout.write;
//   if (outputFile) {
//     try {
//       const fd = fs.openSync(outputFile, 'w');
//       process.stdout.write = (chunk, encoding, callbackWrite) => {
//         fs.writeSync(fd, chunk);
//         if (callbackWrite) callbackWrite();
//       };
//     } catch (err) {
//       console.log(`Redirection error: ${err.message}`);
//       return;
//     }
//   }

//   // Execute the actual command logic
//   callback(commandArgs);

//   // Restore stdout
//   if (outputFile) {
//     process.stdout.write = originalWrite;
//   }
// }

const pwd = (args) => {
  if (args[0] === "pwd") {
    console.log(process.cwd());
  }
}

rl.prompt();

rl.on('line', (input) => {
  input = input.trim();
  if (!input) {
    rl.prompt();
    return;
  }

  commandHistory.push(input);

  // Check for pipeline
  if (input.includes('|')) {
    const pipelineParts = input.split('|').map(s => s.trim());
    const processes = [];

    let prevStdout = null;

    for (let i = 0; i < pipelineParts.length; i++) {
      const args = parting(pipelineParts[i]);
      if (args.length === 0) continue;

      const cmd = args[0];
      const cmdArgs = args.slice(1);

      // Find the executable path
      let execPath = cmd;
      if (!builtins[cmd]) {
        const paths = process.env.PATH.split(':');
        let found = false;
        for (const dir of paths) {
          const testPath = `${dir}/${cmd}`;
          if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
            execPath = testPath;
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`${cmd}: command not found`);
          rl.prompt();
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
      if (builtins[cmd]) {
        // Create a simple Node process for built-ins
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

    Promise.all(promises).then(() => rl.prompt());
    return;
  }


  // Handle normal (non-pipeline) command
  const args = parting(input);
  const command = args[0];

  if (command === 'exit' && (args[1] === '0' || args.length === 1)) {
    rl.close();
    process.exit(0);
  }


  withRedirection(args, (commandArgs) => {
    if (builtins[commandArgs[0]]) {
      builtins[commandArgs[0]](commandArgs);
    } else {
      const result = externalCommand(commandArgs);
      if (!result) {
        console.log(`${commandArgs[0]}: command not found`);
      }
    }
  });

  rl.prompt();
});

rl.on('close', () => {
  process.exit(0);
});


// const prompt = () => {
//   rl.question("$ ", (answer) => {
//     const args = parting(answer);
//     const command = args[0];

//     withRedirection(args, (commandArgs) => {
//       if (builtins[commandArgs[0]]) {
//         builtins[commandArgs[0]](commandArgs);
//       } else {
//         const result = externalCommand(commandArgs);
//         if (!result) {
//           console.log(`${commandArgs[0]}: command not found`);
//         }
//       }
//     });

//     prompt();
//   });
// };


// prompt();