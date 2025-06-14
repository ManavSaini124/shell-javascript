const readline = require("readline");
const fs = require("fs");
const {spawnSync} = require("child_process");
const path = require("path");

const builtinCommands = ["echo", "exit"];

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

let lastLine = "";
let tabPressCount = 0;

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

let lastToken = "";
// let tabPressCount = 0;

const completer = (line) => {
  const words = line.split(/\s+/);
  const current = words[words.length - 1] || "";

  const allCommands = [...builtinCommands, ...getExternalExecutables()];
  const matches = allCommands.filter(cmd => cmd.startsWith(current)).sort();

  if (current !== lastToken) {
    tabPressCount = 0;
    lastToken = current;
  }

  if (matches.length === 1) {
    tabPressCount = 0;
    const completed = matches[0];
    lastToken = completed;
    return [[completed + " "], current]; // ✅ return suggestion and matched prefix
  }
  
  if (matches.length > 1) {
    tabPressCount++;
    if (tabPressCount === 1) {
      process.stdout.write("\x07");
    } else if (tabPressCount === 2) {
      process.stdout.write("\n" + matches.join("  ") + "\n");
      rl.prompt(true);
    }
    return [[], current];
  }

  process.stdout.write("\x07");
  tabPressCount = 0;
  return [[], current];
};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '$ ',
  completer: completer,
});

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
  type: (args)=>{
    const validCommands = ["echo", "exit", "type" , "pwd"];
    if(args[0] === "type"){
      if(validCommands.includes(args[1])){
        console.log(`${args[1]} is a shell builtin`);
      }
      else{
        if (args.length < 2) {
          console.log("type: missing argument");
          return;
        }
        
        // access the PATH environment variable to find the command
        const dirs = process.env.PATH.split(':');
        for( const dir in dirs){
          const filePath = `${dirs[dir]}/${args[1]}`;
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            console.log(`${args[1]} is ${filePath}`);
            return;
          }
        }
        console.log(`${args[1]}: not found`);
      }
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

const prompt = () => {
  rl.question("$ ", (answer) => {
    const args = parting(answer);
    const command = args[0];

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

    prompt();
  });
};


prompt();