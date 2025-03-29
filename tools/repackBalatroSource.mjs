import sevenBin from '7zip-bin';
import Seven from 'node-7z';
import dotenvJson from 'dotenv-json';
import chalk from 'chalk';

dotenvJson();

Seven.add(process.env.balatroExecutable, './src/*.lua', {
  recursive: true,
  $bin: sevenBin.path7za
});

console.log(chalk.green(`Repacked ${process.env.balatroExecutable}.`));