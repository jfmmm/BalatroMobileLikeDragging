import fs from 'fs';
import path from 'path';
import dotenvJson from 'dotenv-json';
import { globSync } from 'glob';
import packageJson from '../package.json' with { type: "json" };
import Parser from './parser/parser.mjs';

dotenvJson();

const verbose = process.env.verboseParser === 'true';

const srcFolder = './src';
const buildFolder = './build';
const templateFolder = './template';
const manifestFile = './build/manifest.json';

// Remove the build directory
fs.rmSync(buildFolder, { recursive: true, force: true });
fs.mkdirSync(buildFolder);

// Copy the template files to the build directory
fs.readdirSync(templateFolder).forEach((file) => {
  fs.cpSync(templateFolder, buildFolder, {recursive: true});
});

// Update the manifest version
const data = fs.readFileSync(manifestFile, { encoding: 'utf-8' }).toString().replace(/%MOD_VERSION%/g, packageJson.version);
fs.writeFileSync(manifestFile, data);

// Parse the lua files and generate the patches
const luaFiles = globSync('**/*.lua', { cwd: srcFolder });

for (const luaFile of luaFiles) {
  const file = fs.readFileSync(path.join(srcFolder, luaFile), { encoding: 'utf-8' }).toString();
  const parser = new Parser(file);
  const header = `\
[manifest]
version = "1.0.0"
dump_lua = true
priority = 1`;

  const patches = [header, ...parser.extractPatches()];

  if (patches.length > 1) {
    if (verbose) console.info('');
    console.info('====================');
    if (verbose) console.info('');
    console.info(luaFile);

    if (verbose) console.info(patches.join('\n\n'));
    fs.writeFileSync(`build/lovely/${path.basename(luaFile, '.lua')}.toml`, patches.join('\n\n'));

    if (verbose) console.info('');
  }
}
