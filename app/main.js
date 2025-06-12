const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Uncomment this block to pass the first stage
const prompt=()=>{
  rl.question("$ ", (answer) => {
    // i want to take the input as a string and then trim it and then split it by space
    answer = answer.trim();
    const args = answer.split(" ");
    // if the first argument is "exit" and the second argument is "0" then close the readline interface
    if (args[0] === "exit" && args[1] === "0") {
      rl.close();
      process.exit(0);
    }
    // if the first argument is echo the print the rest of the arguments
    else if(args[0] == "echo"){
      console.log(args.slice(1).join(" "));
    }

    else if(args[0] == "type"){
      if(args[1] == "echo" || args[1] == "exit" || args[1] == "type"){
        // if the second argument is echo or exit then print the shell builtin message
        console.log(`${args[1]} is a shell builtin`);
      }
      else{
        // if the second argument is not echo or exit then print the command not found message
        console.log(`${args[1]}: not found`);
      }
    }
    
    else{ 
      // if any invali argument then print the command not found message
      console.log(`${answer}: command not found`)
    }
    prompt();
    // rl.close();
  });
}

prompt();