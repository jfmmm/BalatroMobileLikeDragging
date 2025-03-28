import parser from 'luaparse';
import fs from 'fs';
import { log } from 'console';
import { parse, stringify } from 'smol-toml';

// We use the `--[=[` lua's multiline comment so that it won't explode
// when toml uses `[[`. The `>` is so we know this is a lovely patch and
// not a normal comment.	
const specialComment = '--[=[>';

// https://regex101.com/r/PgcDbf/1
const templateLiteralCordRegex = /\${((?:(\d+)(?::(\d+))?;(\d+)(?::(\d+))?)+?)}/gm;

// https://regex101.com/r/Ej7nJZ/1
const cordRegex = /^(\d+)(?::(\d+))?;(\d+)(?::(\d+))?$/;

/**
 * Return the real location of a payload relative to a comment location
 * in the code.
 * @param {*} loc Relative location of the payload
 * @param {*} commentLoc Absolute location of the comment
 * @returns string
 */
function relativeToAbsoluteLocation(commentLoc, loc) {
  const result = {
    start: {
      line: commentLoc.end.line + loc.start.line,
      column: loc.start.column
    },
    end: {
      line: commentLoc.end.line + loc.end.line,
      column: loc.end.column
    }
  };

  return result;
}

/**
 * Get string representation of location
 * @param {*} lines 
 * @param {*} loc 
 * @returns string
 */
function getLoc(lines, loc) {
  const start = loc.start;
  const end = loc.end;

  if (start.line === end.line) {
    return lines[start.line - 1].substring(start.column, end.column);
  }

  const startLine = lines[start.line - 1].substring(start.column);
  const midLines = lines.slice(start.line, end.line - 1).join('\n');
  const endLine = (midLines ? '\n' : '') + lines[end.line - 1].substring(0, end.column);

  return startLine + '\n' + midLines + endLine;
}

/**
 * Convert string representation of location to vscode style location
 * @param {*} loc
 * @returns vscode location
 * @example
 * '1:1;3:4' => { start: { line: 1, column: 1 }, end: { line: 3, column: 4 } }
 * '1;3' => { start: { line: 1, column: 0 }, end: { line: 3, column: Infinity } }
 */
function convertStringLoc(loc) {
  const [start, end] = loc.split(';');
  const [startLine, startColumnMaybe] = start.split(':');
  const [endLine, endColumnMaybe] = end.split(':');

  // We want the whole line if no column is specified
  const startColumn = startColumnMaybe ? parseInt(startColumnMaybe) : 0;
  const endColumn = endColumnMaybe ? parseInt(endColumnMaybe) : Infinity;

  const result = {
    start: { line: parseInt(startLine), column: startColumn },
    end: { line: parseInt(endLine), column: endColumn }
  };

  return result;
}

/**
 * Convert a vscode style location to a luaparse location
 * Basically substract one to column because vscode is 1 based and luaparse is 0 based
 */
function convertVscodeLoc(vscodeLoc) {
  return {
    start: {
      line: vscodeLoc.start.line,
      column: vscodeLoc.start.column - 1
    },
    end: {
      line: vscodeLoc.end.line,
      column: vscodeLoc.end.column - 1
    }
  };
}

/**
 * Check if a line is a lua comment
 * @param {*} line The line to check
 * @returns boolean
 */
function isComment(line) {
  return line.startsWith('--');
}

/**
 * Find all template literals in a payload and replace them with the
 * actual value at the specified location.
 */
function resolvePayloadTemplateLiterals(payload, lines, commentLoc) {
  let match;

  let result = payload;

  while ((match = templateLiteralCordRegex.exec(result)) !== null) {
    // This is to avoid infinite loops with zero-width matches
    if (match.index === templateLiteralCordRegex.lastIndex) {
        templateLiteralCordRegex.lastIndex++;
    }

    const locString = match[1];
    const loc = convertVscodeLoc(convertStringLoc(locString));
    const absLoc = relativeToAbsoluteLocation(commentLoc, loc);
    result = result.replace(match[0], getLoc(lines, absLoc));
  }

  return result;
}

/**
 * Patch a payload by replacing the value with the payload at the location
 * Location are VSCode style where column is 1 based
 */
function patchPayloads(tomlObject, lines, commentLoc) {
  for (const key in tomlObject) {
    const value = tomlObject[key];

    if (typeof value === 'object') {
      patchPayloads(value, lines, commentLoc);
    } else if (typeof value === 'string') {
      if (key === 'payload') {
        if (cordRegex.test(value)) {
          const loc = relativeToAbsoluteLocation(commentLoc, convertVscodeLoc(convertStringLoc(value)));
          tomlObject[key] = getLoc(lines, loc);
        } else {
          tomlObject[key] = resolvePayloadTemplateLiterals(value, lines, commentLoc);
        }
      }
    }
  }
}

export default class Parser {
  static fileLines = [];
  static ast = {};

  /**
   * @param {string} file File to parse.
   */
  constructor(
    file,
  ) {
    const cleanedFile = file.replaceAll(/\r\n/g, '\n');
    this.fileLines = cleanedFile.split('\n');
    this.ast = parser.parse(cleanedFile, {
      comments: true,
      locations: true,
      luaVersion: '5.3'
    });
  }

  extractPatches() {
    const patches = [];

    for (const comment of this.ast.comments) {
      if (comment.raw.startsWith(specialComment)) {
        let lines = comment.raw.split('\n');
        lines.shift();
        lines.pop();

        const tomlLines = [];
        for (const line of lines) {
          if (!isComment(line)) {
            tomlLines.push(line);
          }
        }

        try {
          const parsedToml = parse(tomlLines.join('\n'));

          patchPayloads(parsedToml, this.fileLines, comment.loc);

          // @TODO manually convert the payload to a multiline string as smol-toml
          // doesn't support it yet.

          patches.push(stringify(parsedToml));
        } catch (e) {
          console.error(e);
        }
      }
    }

    return patches;
  }
}
