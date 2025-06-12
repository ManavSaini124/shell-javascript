const readline = require("readline");
const fs = require("fs");
const {spawn, spawnSync} = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const parting =(answer)=>{
  answer = answer.trim();
  const args = answer.split(" ");
  return args;
}

const exit = (args) => {
  if (args[0] === "exit" && args[1] === "0") {
    rl.close();
    process.exit(0);
  }
};

const echo = (args) => {
  // Join the arguments with a space and print them
   if(args[0] == "echo"){
      console.log(args.slice(1).join(" "));
   }
};
const unexpected = (args) => {
  // If the first argument is not "echo" or "exit", print an error message
  if (args[0] !== "echo" && args[0] !== "exit" && args[0] !== "type") {
    const runnable = externalCommand(args);
    if (!runnable) {
      console.log(`${args[0]}: command not found`);
    }
  }
};

const type = (args) => {
  const validCommands = ["echo", "exit", "type"];
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
}

const externalCommand = (args) => {
  if(args.length > 1){
    const command_args = args.slice(1);
    // spawnSync(args[0], command_args, {
    //   stdio: 'inherit',
    //   encoding: 'utf8',
    // });
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const proc = spawnSync(fullPath, args.slice(1), { stdio: "inherit" });
      proc.on("exit", () => prompt()); // async
      return 1;
    }
  }
  return 0;
}


const prompt=()=>{
  rl.question("$ ", (answer) => {
    const args =parting (answer);
    exit(args);
    echo(args);
    type(args);
    unexpected(args);
    prompt();
  });
}

prompt();