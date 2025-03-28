import fs from 'fs';
import path from 'path';
import dotenvJson from 'dotenv-json';
import chalk from 'chalk';

dotenvJson();

function resolveEnvPath(inputPath) {
  return inputPath.replace(/%([^%]+)%/g, (_, envVar) => process.env[envVar] || `%${envVar}%`);
}

const modsFolder = resolveEnvPath(process.env.balatroModsFolder);

fs.rmSync(path.join(modsFolder, process.env.modName), { recursive: true, force: true });
fs.cpSync('./build', path.join(modsFolder, process.env.modName), {recursive: true});

console.log(chalk.green(`Build copied to ${path.join(modsFolder, process.env.modName)}.`));