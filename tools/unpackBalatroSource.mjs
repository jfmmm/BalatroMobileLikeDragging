import sevenBin from '7zip-bin';
import Seven from 'node-7z';
import dotenvJson from 'dotenv-json';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

dotenvJson();

// create src and balatroSrc folders if they don't exist
if (!fs.existsSync('./src')) {
  fs.mkdirSync('./src');
}
if (!fs.existsSync('./balatroSrc')) {
  fs.mkdirSync('./balatroSrc');
}

function convertCRLFToLF(basePath, data) {
  if (data.status === 'extracted') {
    const filePath = path.join(basePath, data.file);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      fs.writeFile(filePath, data.replace(/\r\n/g, '\n'), 'utf8', (err) => {
        if (err) throw err;
      });
    });
  }
}

const stream1 = Seven.extractFull(process.env.balatroExecutable, './src', {
  recursive: true,
  $cherryPick: '*.lua',
  $bin: sevenBin.path7za
});

const stream2 = Seven.extractFull(process.env.balatroExecutable, './balatroSrc', {
  recursive: true,
  $cherryPick: '*.lua',
  $bin: sevenBin.path7za
});

stream1.on('data', (data) => convertCRLFToLF('src', data));
stream2.on('data', (data) => convertCRLFToLF('balatroSrc', data));

console.log(chalk.green(`Unpacked ${process.env.balatroExecutable}.`));
