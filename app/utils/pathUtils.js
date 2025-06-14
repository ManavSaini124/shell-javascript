
const fs = require("fs");
const path = require("path");

const getExternalExecutables = () => {
  const path_dir = process.env.PATH.split(':');
  const Executables = new Set();
  
  for(const dir of path_dir){
    try{
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        try{
          const stats = fs.statSync(filePath);
          fs.accessSync(filePath, fs.constants.X_OK);
          if (stats.isFile()) {
            Executables.add(file);
          }
        }catch (err) {
          // Ignore errors for files that cannot be accessed
        }
      }
    }catch (err) {
      // Ignore directories that cannot be read
    }
  }
  return [...Executables];
};

const findExecutablePath = (command) => {
  const paths = process.env.PATH.split(":");
  
  for (const dir of paths) {
    const fullPath = `${dir}/${command}`;
    
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }
  
  return null;
};

const ensureDirExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

module.exports = {
  getExternalExecutables,
  findExecutablePath,
  ensureDirExists
};