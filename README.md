# 🐚 Custom Shell
A fully-featured, interactive shell built from scratch in Node.js that mimics the behavior of popular Unix shells like Bash. This project demonstrates advanced systems programming concepts including process management, I/O redirection, and command-line parsing.

![My Screenshot](app/assess/Screenshot%202025-06-14%20233348.png.png)


## ✨ Features

### 🎯 Core Functionality
- **Interactive Command Line Interface** with custom prompt
- **Advanced Command Parsing** with proper quote and escape handling
- **External Command Execution** via PATH resolution
- **Built-in Commands** for essential shell operations
- **Error Handling** with informative messages

### 🚀 Advanced Features
- **Smart Tab Completion** with double-tab for multiple matches
- **Command Pipelines** (`cmd1 | cmd2 | cmd3`)
- **Output Redirection** (`>`, `2>`, `1>`)
- **Persistent Command History** with file operations
- **Bash-Compatible Argument Parsing**

## ✨ Features

### 🎯 Core Functionality
- **Interactive Command Line Interface** with custom prompt
- **Advanced Command Parsing** with proper quote and escape handling
- **External Command Execution** via PATH resolution
- **Built-in Commands** for essential shell operations
- **Error Handling** with informative messages

### 🚀 Advanced Features
- **Smart Tab Completion** with double-tab for multiple matches
- **Command Pipelines** (`cmd1 | cmd2 | cmd3`)
- **Output Redirection** (`>`, `2>`, `1>`)
- **Persistent Command History** with file operations
- **Bash-Compatible Argument Parsing**


## 🏗️ Architecture

The shell is built with a modular architecture for maintainability and extensibility:

```
app/
├── main.js                     # Entry point and main shell loop
├── utils/
│   ├── bashParser.js           # Advanced command parsing
│   └── pathUtils.js            # PATH resolution utilities
├── completion/
│   └── tabCompletion.js        # Tab completion logic
├── history/
│   └── historyManager.js       # Command history management
├── commands/
│   └── builtins.js             # Built-in command implementations
├── execution/
│   └── commandExecutor.js      # External command execution
├── redirection/
│   └── redirectionHandler.js   # I/O redirection handling
└── pipeline/
    └── pipelineHandler.js      # Pipeline execution
```
## 🚀 Installation & Usage

### Prerequisites
- Node.js (v14 or higher)
- Unix-like operating system (Linux, macOS, WSL)

### Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/custom-shell.git
cd custom-shell
```

2. Make the shell executable:
```bash
chmod +x app/main.js
```

3. Run the shell:
```bash
node app/main.js
```

### Environment Variables
The shell respects standard environment variables:
- `PATH` - Command search paths
- `HOME` - User home directory
- `HISTFILE` - History file location

## 💡 Usage Examples

### Basic Commands
```bash
$ pwd
/home/user/projects

$ echo "Hello, World!"
Hello, World!

$ cd ~
$ pwd
/home/user
```
### Tab Completion
```bash
$ ec<TAB>
echo

$ l<TAB><TAB>
ls    ln    less    locate
```

### Pipelines
```bash
$ echo "apple\nbanana\ncherry" | grep "a" | wc -l
2

$ ls -la | grep ".js" | head -5
```

### Output Redirection
```bash
$ echo "Hello World" > output.txt
$ ls -la > file_list.txt 2> errors.txt
```

### History Management
```bash
$ history
    1  pwd
    2  echo "Hello World"
    3  ls -la

$ history 5          # Show last 5 commands
$ history -w hist.txt # Write history to file
$ history -r hist.txt # Read history from file
```

## 🔧 Technical Implementation

### Command Parsing
The shell implements sophisticated parsing that handles:
- **Quoted strings** with both single (`'`) and double (`"`) quotes
- **Escape sequences** with backslash (`\`)
- **Space handling** in arguments
- **Nested quotes** and complex expressions

### Process Management
- **Child process spawning** for external commands
- **Process synchronization** for pipelines
- **Signal handling** for graceful shutdown
- **Stream management** for I/O operations

### Memory Management
- **Efficient string processing** for large command histories
- **Resource cleanup** on exit
- **File handle management** for redirection

## 🎓 Learning Outcomes

This project provided deep insights into:
- **Systems Programming** concepts and Unix process model
- **Stream Processing** and I/O redirection mechanisms
- **Command-Line Interface** design and user experience
- **File System Operations** and PATH resolution
- **Asynchronous Programming** with Node.js
- **Error Handling** in system-level applications

## 🤝 Contributing

Contributions are welcome! Here are some areas for improvement:

### Planned Enhancements
- [ ] **Job Control** - Background processes with `&`
- [ ] **Environment Variables** - Variable expansion (`$VAR`)
- [ ] **Command Aliases** - Custom command shortcuts
- [ ] **Configuration Files** - `.shellrc` support
- [ ] **Advanced Globbing** - Wildcard expansion (`*.js`)
- [ ] **Command Substitution** - `$(command)` syntax



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[CodeCrafters](https://app.codecrafters.io/courses/shell/overview)** - For providing the structured learning path and challenges that guided this implementation.
- **Unix Shell Pioneers** - For creating the foundational concepts this shell emulates
- **Node.js Community** - For the excellent runtime and documentation

## 📚 Resources

- [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/)
- [Unix Shell Programming](https://www.tutorialspoint.com/unix/unix-shell.htm)
- [Node.js Child Process Documentation](https://nodejs.org/api/child_process.html)
- [POSIX Shell Standard](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html)
- [GNU Operating System](https://www.gnu.org/software/bash/)
---

<div align="center">
  <strong>Built with ❤️ and lots of ☕</strong>
</div>