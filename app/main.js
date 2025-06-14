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



const unexpected = (args,command) => {
  // If the first argument is not "echo" or "exit", print an error message
  if (!builtins[command]) {
    const runnable = externalCommand(args);
    if (!runnable) {
      console.log(`${args[0]}: command not found`);
    }
  }
};

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




const externalCommand = (args) => {
  if(args.length > 1){
    // const command_args = args.slice(1);
    // we have to implement Redirect stdout
    // dectecting >, 1>
    const indexOfRedirect = args.findIndex(arg => arg === '>' || arg === '1>');
    if (indexOfRedirect !== -1 && !args[indexOfRedirect + 1]) {
      console.log("Redirection error: no file specified");
      return 0;
    }

    let commandArgs = args[0];
    let output_file = null;
    if (indexOfRedirect !== -1) {
      output_file = args[indexOfRedirect + 1];
      if (!output_file) {
        console.log(`bash: ${commandArgs}: missing argument`);
        return 0;
      }
      commandArgs = args.slice(0, indexOfRedirect).join(" ");
    }

    if (commandArgs.length === 0) return 0;



    const command = commandArgs[0];
    const commandArguments = commandArgs.slice(1);
    const paths = process.env.PATH.split(":");

    for (const dir of paths) {
      const fullPath = `${dir}/${command}`;
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const option ={
          encoding: "utf8",
          stdio: output_file ?['inherit', fs.openSync(outputFile, 'w'), 'inherit']: 'inherit',
        }
        spawnSync(command, commandArguments, option);
        return 1;
      }
    }
    return 0;
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
      builtins[command](args);
    } else {
      unexpected(args,command);
    }
    prompt();
  });
}
// const prompt=()=>{
//   rl.question("$ ", (answer) => {
//     const args =parting (answer);
//     exit(args);
//     echo(args);
//     type(args);
//     pwd(args);
//     unexpected(args);
//     prompt();
//   });
// }

prompt();