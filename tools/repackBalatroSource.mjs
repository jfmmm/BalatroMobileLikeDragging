import sevenBin from '7zip-bin';
import Seven from 'node-7z';
import dotenvJson from 'dotenv-json';

dotenvJson();

Seven.add(process.env.balatroExecutable, './src/*.lua', {
  recursive: true,
  overwrite: 'true',
  $bin: sevenBin.path7za
});

console.log(chalk.green(`Unpacked ${process.env.balatroExecutable}.`));