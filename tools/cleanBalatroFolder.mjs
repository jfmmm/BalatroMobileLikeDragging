import fs from 'fs';
import path from 'path';
import dotenvJson from 'dotenv-json';
import chalk from 'chalk';

const srcFolder = './balatroSrc';

fs.readdirSync(srcFolder).forEach((file) => {
  if (fs.lstatSync(path.join(srcFolder, file)).isDirectory()) {
    fs.rmdirSync(path.join(srcFolder, file), { recursive: true });
    return;
  }

  fs.rmSync(path.join(srcFolder, file));
});

console.log(chalk.green(`-> \`.balatroSrc/\` folder cleaned.`));
