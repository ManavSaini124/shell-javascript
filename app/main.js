const readline = require("readline");
const fs = require("fs");
const {spawnSync} = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
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
//   const redirectIndex = args.findIndex(arg => arg === '>' || arg === '1>');
//   let commandArgs = args;
//   let outputFile = null;

//   if (redirectIndex !== -1) {
//     if (!args[redirectIndex + 1]) {
//       console.log("Redirection error: no output file specified");
//       return 0;
//     }
//     outputFile = args[redirectIndex + 1];
//     commandArgs = args.slice(0, redirectIndex);
//   }

//   if (commandArgs.length === 0) return 0;

//   const command = commandArgs[0];
//   const commandArguments = commandArgs.slice(1);
//   const paths = process.env.PATH.split(":");

//   for (const dir of paths) {
//     const fullPath = `${dir}/${command}`;
    
//       if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
//         const options = {
//           encoding: "utf8",
//           stdio: outputFile
//             ? ['inherit', fs.openSync(outputFile, 'w'), 'inherit']
//             : 'inherit',
//           argv0: command,
//         };

//         // ✅ Call the resolved path
//         spawnSync(fullPath, commandArguments, options);
//         return 1;
//       }
    
//   }

//   return 0;
// };

const externalCommand = (args) => {
  const stdout = null;
  const stderr = null;
  const arguments =[];
  for (let i = 1; i < args.length; i++) {
    if(args[i] === '>' && args[i] === '1>') {
      stdout = args[i + 1];
      i++;
    }
    else if(args[i] === '2>'){
      stderr = args[i + 1];
      i++;
    }else{
      arguments.push(args[i]);
    }
  }
  if (arguments.length === 0) return 0;

  const command = arguments[0];
  const commandArguments = arguments.slice(1);
  const paths = process.env.PATH.split(":");

  for (const dir of paths) {
    const fullPath = `${dir}/${command}`;
    
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const options = {
        encoding: "utrf8",
        studio : [
          'inherit',
          stdout ? fs.openSync(stdout, 'w') : 'inherit',
          stderr ? fs.openSync(stderr, 'w') : 'inherit'
        ],
        argv0: command
      }
      spawnSync(fullPath, commandArguments, options);
      return 1; 
    }
  }
  return 0;
}

const withRedirection =(args, callback) => {
  const redirectIndex = args.findIndex(arg => arg === '>' || arg === '1>');
  let outputFile = null;
  let commandArgs = args;

  if (redirectIndex !== -1) {
    outputFile = args[redirectIndex + 1];
    commandArgs = args.slice(0, redirectIndex);
  }

  // Redirect stdout if needed
  const originalWrite = process.stdout.write;
  if (outputFile) {
    try {
      const fd = fs.openSync(outputFile, 'w');
      process.stdout.write = (chunk, encoding, callbackWrite) => {
        fs.writeSync(fd, chunk);
        if (callbackWrite) callbackWrite();
      };
    } catch (err) {
      console.log(`Redirection error: ${err.message}`);
      return;
    }
  }

  // Execute the actual command logic
  callback(commandArgs);

  // Restore stdout
  if (outputFile) {
    process.stdout.write = originalWrite;
  }
}

const pwd = (args) => {
  if (args[0] === "pwd") {
    console.log(process.cwd());
  }
}

const prompt=()=>{
  rl.question("$ ", (answer) => {
    const args =parting (answer);
    const command = args[0];
    if (builtins[command]) {
      withRedirection(args, (commandArgs) => {
        builtins[commandArgs[0]](commandArgs);
      });
    } else {
      unexpected(args, command);
    }
    prompt();
  });
}

prompt();