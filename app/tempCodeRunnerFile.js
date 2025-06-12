const prompt=()=>{
  rl.question("$ ", (answer) => {
    const args =parting (answer);
    const command = args[0];

    if (builtins[command]) {
      builtins[command](args);
    } else {
      unexpected(args);
    }
    prompt();
  });
}