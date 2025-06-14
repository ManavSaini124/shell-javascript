
const fs = require("fs");
const { findExecutablePath } = require("../utils/pathUtils");

const createBuiltins = (historyManager) => {
  return {
    echo: (args) => {
      console.log(args.slice(1).join(" "));
    },

    exit: (args) => {
      historyManager.saveHistory();
      
      if (args[0] === "exit" && args[1] === "0") {
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
        const builtinCommands = ["echo", "exit", "type", "pwd", "cd", "history"];
        
        // Check if it's a builtin
        if (builtinCommands.includes(command)) {
          console.log(`${command} is a shell builtin`);
          return;
        }
        
        // Check external commands in PATH
        const execPath = findExecutablePath(command);
        if (execPath) {
          console.log(`${command} is ${execPath}`);
        } else {
          console.log(`${command}: not found`);
        }
      }
    },

    pwd: (args) => {
      if (args[0] === "pwd") {
        console.log(process.cwd());
      }
    },

    cd: (args) => {
      if (args[0] === "cd") {
        if (args.slice(1).length === 0) {
          console.log("cd: missing argument");
          return;
        }
        
        if (args[1] === "~") {
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
        // Handle -r flag (read from file)
        if (args.length >= 3 && args[1] === "-r") {
          try {
            historyManager.readHistoryFromFile(args[2]);
          } catch (err) {
            console.log(`history: ${err.message}`);
          }
          return;
        }
        
        // Handle -w flag (write to file)
        if (args.length >= 3 && args[1] === "-w") {
          try {
            historyManager.writeHistoryToFile(args[2]);
          } catch (err) {
            console.log(`history: ${err.message}`);
          }
          return;
        }

        // Handle -a flag (append to file)
        if (args.length >= 3 && args[1] === "-a") {
          try {
            historyManager.appendHistoryToFile(args[2]);
          } catch (err) {
            console.log(`history: ${err.message}`);
          }
          return;
        }

        // Regular history display
        const commandHistory = historyManager.getHistory();
        let numToShow = commandHistory.length;
        
        if (args.length > 1) {
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
  };
};

module.exports = { createBuiltins };