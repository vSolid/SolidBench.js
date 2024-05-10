const {getAllFilesInFolder} = require('./file-system.js');
const fs = require("fs");

const arguments = process.argv.slice(2);

const pathToFolder = arguments[0] || "./out-fragments/http/localhost_3000/test/"
const serverRootPath = arguments[1] || "./out-fragments/http/localhost_3000/"
const files = getAllFilesInFolder(pathToFolder, serverRootPath)
const outPath = './k6/helpers/files.txt';

try {
  const content = JSON.stringify(files)
  fs.writeFileSync(outPath, content);
  console.log(`${files.length} file paths cached successfully.`);
} catch (error) {
  console.error('Error writing file:', error);
}
