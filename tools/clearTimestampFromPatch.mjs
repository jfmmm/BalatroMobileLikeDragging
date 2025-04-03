// This whole file is a copilot fever dream don't trust it.. but it works..
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const patchFilePath = './patch.diff';

if (!fs.existsSync(patchFilePath)) {
  console.log(chalk.red(`-> File not found: ${patchFilePath}`));
  throw new Error(`File not found: ${patchFilePath}`);
}

const patchContent = fs.readFileSync(patchFilePath, 'utf-8');

const cleanedContent = patchContent.replace(
  /--- .*?\t\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ [+-]\d{4}\n\+\+\+ .*?\t\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ [+-]\d{4}/g,
  (match) => match.replace(/\t\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ [+-]\d{4}/g, '')
);

fs.writeFileSync(patchFilePath, cleanedContent);
console.log(chalk.green(`-> Timestamps removed from: ${patchFilePath}`));
