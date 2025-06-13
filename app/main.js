const readline = require("readline");
const fs = require("fs");
const {spawnSync} = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins ={
  echo: (args)=>{
  //   if(args[0] == "echo"){
    // const new_arg = args.slice(1).join(" ");
    //     // const regex = /'([^']+)'/g; // just match single quotes
    //     const regex = /^["']([^"']*)["']$/; // match double or single quotes
    //     const match = regex.exec(new_arg);
    //     if (match) {
      //       const result = match[1];
  //       console.log(result); 
  //     }
  //     else{
    //       console.log(new_arg);
    //     }
    //  }
      // const new_arg = args.slice(1).join(" ");
      // const arg = [];
      // let current = '';
      // let inSingle = false;
      // let inDouble = false;
      // let escape = false;

      // for (let i = 0; i < new_arg.length; i++) {
      //   const char = new_arg[i];

      //   if (escape) {
      //     current += char;
      //     escape = false;
      //   } else if (char === '\\') {
      //     escape = true;
      //   } else if (char === "'" && !inDouble) {
      //     inSingle = !inSingle;
      //   } else if (char === '"' && !inSingle) {
      //     inDouble = !inDouble;
      //   } else if (char === ' ' && !inSingle && !inDouble) {
      //     if (current.length > 0) {
      //       arg.push(current);
      //       current = '';
      //     }
      //   } else {
      //     current += char;
      //   }
      // }

      // if (current.length > 0) {
      //   arg.push(current);
      // }
      // console.log(arg);
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


// const parting =(answer)=>{
//   answer = answer.trim();
//   const args = answer.split(" ");
//   return args;
// }

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
        current += '\\' + char; // literal inside single quotes
      } else if (inDouble) {
        if ('"\\$`'.includes(char)) {
          current += char;
        } else {
          current += '\\' + char; // unrecognized escapes stay escaped
        }
      } else {
        // outside any quotes
        switch (char) {
          case 'n': current += '\n'; break;
          case 't': current += '\t'; break;
          case 'r': current += '\r'; break;
          case ' ': current += ' '; break;
          case '\\': current += '\\'; break;
          case "'": current += "'"; break;
          case '"': current += '"'; break;
          default: current += char; break;
        }
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
    const command_args = args.slice(1);
    // spawnSync(args[0], command_args, {
    //   stdio: 'inherit',
    //   encoding: 'utf8',
    // });
    const command = args[0];
    const paths = process.env.PATH.split(":");

    for (const dir of paths) {
      const fullPath = `${dir}/${command}`;
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const proc = spawnSync(args[0], args.slice(1), { stdio: "inherit", encoding: "utf8" });
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