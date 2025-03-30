import fs from 'fs';
import path from 'path';
import dotenvJson from 'dotenv-json';
import chalk from 'chalk';

const srcFolder = './src';

// @TODO Put a y/n prompt before cleaning the folder this could easily wipe out work.

if (fs.existsSync(srcFolder)) {
  fs.readdirSync(srcFolder).forEach((file) => {
    if (fs.lstatSync(path.join(srcFolder, file)).isDirectory()) {
      fs.rmdirSync(path.join(srcFolder, file), { recursive: true });
      return;
    }

    fs.rmSync(path.join(srcFolder, file));
  });
}

console.log(chalk.green(`-> \`.src/\` folder cleaned.`));
