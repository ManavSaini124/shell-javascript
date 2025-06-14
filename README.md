<!-- [![progress-banner](https://backend.codecrafters.io/progress/shell/818f2788-f817-4bff-aae4-d09fd0bba289)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

This is a starting point for JavaScript solutions to the
["Build Your Own Shell" Challenge](https://app.codecrafters.io/courses/shell/overview).

In this challenge, you'll build your own POSIX compliant shell that's capable of
interpreting shell commands, running external programs and builtin commands like
cd, pwd, echo and more. Along the way, you'll learn about shell command parsing,
REPLs, builtin commands, and more.

**Note**: If you're viewing this repo on GitHub, head over to
[codecrafters.io](https://codecrafters.io) to try the challenge.

# Passing the first stage

The entry point for your `shell` implementation is in `app/main.js`. Study and
uncomment the relevant code, and push your changes to pass the first stage:

```sh
git commit -am "pass 1st stage" # any msg
git push origin master
```

Time to move on to the next stage!

# Stage 2 & beyond

Note: This section is for stages 2 and beyond.

1. Ensure you have `node (21)` installed locally
1. Run `./your_program.sh` to run your program, which is implemented in
   `app/main.js`.
1. Commit your changes and run `git push origin master` to submit your solution
   to CodeCrafters. Test output will be streamed to your terminal. -->

🐚 Custom Shell
A fully-featured, interactive shell built from scratch in Node.js that mimics the behavior of popular Unix shells like Bash. This project demonstrates advanced systems programming concepts including process management, I/O redirection, and command-line parsing.
Show Image
Show Image
Show Image
✨ Features
🎯 Core Functionality

Interactive Command Line Interface with custom prompt
Advanced Command Parsing with proper quote and escape handling
External Command Execution via PATH resolution
Built-in Commands for essential shell operations
Error Handling with informative messages

🚀 Advanced Features

Smart Tab Completion with double-tab for multiple matches
Command Pipelines (cmd1 | cmd2 | cmd3)
Output Redirection (>, 2>, 1>)
Persistent Command History with file operations
Bash-Compatible Argument Parsing

🛠️ Built-in Commands
CommandDescriptionUsageechoDisplay textecho "Hello World"cdChange directorycd /path/to/dir or cd ~pwdPrint working directorypwdtypeShow command typetype lshistoryCommand history managementhistory, history 10, history -w fileexitExit shellexit or exit 0
🏗️ Architecture
The shell is built with a modular architecture for maintainability and extensibility:
app/
├── main.js                     # Entry point and main shell loop
├── utils/
│   ├── bashParser.js          # Advanced command parsing
│   └── pathUtils.js           # PATH resolution utilities
├── completion/
│   └── tabCompletion.js       # Tab completion logic
├── history/
│   └── historyManager.js      # Command history management
├── commands/
│   └── builtins.js           # Built-in command implementations
├── execution/
│   └── commandExecutor.js    # External command execution
├── redirection/
│   └── redirectionHandler.js # I/O redirection handling
└── pipeline/
    └── pipelineHandler.js    # Pipeline execution
🚀 Installation & Usage
Prerequisites

Node.js (v14 or higher)
Unix-like operating system (Linux, macOS, WSL)

Setup

Clone the repository:

bashgit clone https://github.com/yourusername/custom-shell.git
cd custom-shell

Make the shell executable:

bashchmod +x app/main.js

Run the shell:

bashnode app/main.js
Environment Variables
The shell respects standard environment variables:

PATH - Command search paths
HOME - User home directory
HISTFILE - History file location

💡 Usage Examples
Basic Commands
bash$ pwd
/home/user/projects

$ echo "Hello, World!"
Hello, World!

$ cd ~
$ pwd
/home/user
Tab Completion
bash$ ec<TAB>
echo

$ l<TAB><TAB>
ls    ln    less    locate
Pipelines
bash$ echo "apple\nbanana\ncherry" | grep "a" | wc -l
2

$ ls -la | grep ".js" | head -5
Output Redirection
bash$ echo "Hello World" > output.txt
$ ls -la > file_list.txt 2> errors.txt
History Management
bash$ history
    1  pwd
    2  echo "Hello World"
    3  ls -la

$ history 5          # Show last 5 commands
$ history -w hist.txt # Write history to file
$ history -r hist.txt # Read history from file
🔧 Technical Implementation
Command Parsing
The shell implements sophisticated parsing that handles:

Quoted strings with both single (') and double (") quotes
Escape sequences with backslash (\)
Space handling in arguments
Nested quotes and complex expressions

Process Management

Child process spawning for external commands
Process synchronization for pipelines
Signal handling for graceful shutdown
Stream management for I/O operations

Memory Management

Efficient string processing for large command histories
Resource cleanup on exit
File handle management for redirection

🎓 Learning Outcomes
This project provided deep insights into:

Systems Programming concepts and Unix process model
Stream Processing and I/O redirection mechanisms
Command-Line Interface design and user experience
File System Operations and PATH resolution
Asynchronous Programming with Node.js
Error Handling in system-level applications

🤝 Contributing
Contributions are welcome! Here are some areas for improvement:
Planned Enhancements

 Job Control - Background processes with &
 Environment Variables - Variable expansion ($VAR)
 Command Aliases - Custom command shortcuts
 Configuration Files - .shellrc support
 Advanced Globbing - Wildcard expansion (*.js)
 Command Substitution - $(command) syntax

How to Contribute

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

CodeCrafters - For providing the structured learning path and challenges that guided this implementation
Unix Shell Pioneers - For creating the foundational concepts this shell emulates
Node.js Community - For the excellent runtime and documentation

📚 Resources

Advanced Bash-Scripting Guide
Unix Shell Programming
Node.js Child Process Documentation
POSIX Shell Standard


<div align="center">
  <strong>Built with ❤️ and lots of ☕</strong>
</div>
