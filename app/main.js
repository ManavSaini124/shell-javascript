const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Uncomment this block to pass the first stage
const prompt=()=>{
  rl.question("$ ", (answer) => {
    if(answer === "exit 0") {
      rl.close();
      return;
    }
    console.log(`${answer}: command not found`)
    prompt();
    // rl.close();
  });
}

prompt();