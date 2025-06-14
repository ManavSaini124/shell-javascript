
const fs = require("fs");

class HistoryManager {
  constructor() {
    this.commandHistory = [];
    this.historyFilePositions = new Map();
    this.loadHistory();
  }

  loadHistory() {
    if (process.env.HISTFILE) {
      try {
        if (fs.existsSync(process.env.HISTFILE)) {
          const fileContent = fs.readFileSync(process.env.HISTFILE, 'utf8');
          const lines = fileContent.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);
          this.commandHistory.push(...lines);
        }
      } catch (err) {
        // Silently ignore errors when loading history file
      }
    }
  }

  addCommand(command) {
    this.commandHistory.push(command);
  }

  getHistory() {
    return this.commandHistory;
  }

  saveHistory() {
    if (process.env.HISTFILE && this.commandHistory.length > 0) {
      try {
        const historyContent = this.commandHistory.join('\n') + '\n';
        fs.writeFileSync(process.env.HISTFILE, historyContent, 'utf8');
      } catch (err) {
        // Silently ignore errors when saving history file
      }
    }
  }

  writeHistoryToFile(filePath) {
    try {
      fs.writeFileSync(filePath, this.commandHistory.join('\n') + '\n', 'utf8');
    } catch (err) {
      throw new Error(`cannot write ${filePath}: ${err.message}`);
    }
  }

  readHistoryFromFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0); 
        this.commandHistory.push(...lines);
      } else {
        throw new Error(`${filePath}: No such file`);
      }
    } catch (err) {
      throw new Error(`${filePath}: ${err.message}`);
    }
  }

  appendHistoryToFile(filePath) {
    try {
      const lastPosition = this.historyFilePositions.get(filePath) || 0;
      const newCommands = this.commandHistory.slice(lastPosition);
      
      if (newCommands.length > 0) {
        const historyContent = newCommands.join('\n') + '\n';
        fs.appendFileSync(filePath, historyContent, 'utf8');
      }
      
      this.historyFilePositions.set(filePath, this.commandHistory.length);
    } catch (err) {
      throw new Error(`cannot append to ${filePath}: ${err.message}`);
    }
  }
}

module.exports = { HistoryManager };