# Mobile Like Dragging

A balatro mod that adds dragging support to use/sell/buy cards like on the mobile version of the game. Works great on Steam Deck using the touch display.

This repo is focused on development of the mod, if you just want to install the mod, see [nexus page](https://www.nexusmods.com/balatro/mods/133?tab=description).

If you need the patch file for some reason, you can use the `patch.diff` file in here and install it with `patch -p2 -d "BALATRO_FOLDER_NAME_GOES_HERE" < patch.diff`.

## Requirement

- Git for Windows (For `diff` & `patch` command support on Windows)
- Node.js with NPM

## Install

- Clone the repo.
  - My suggested location is in Balatro folder, but it's configurable in `.env.json` file.
  - Check in `.env.json` file that you balatro mod folder match yours.
- Once this is setup go in the mod folder and run `npm install`.
- You can then run `npm unpack` to unpack batatro sources.
  - This will unpack balatro into both the `src` and `balatroSrc`.
  - `balatroSrc` should never be modified, this is your base when creating the patch diff that you will commit in your PR.
- Run `npm run applyPatch`.
  - This will apply the patch over the file in `src`.
  - The mod is now in `src` where you can add your code.
- You can run `npm run watch` which will watch for changes in `src` and build the mod and copy it to Balatro mod folder automatically.
  - If you need for some reason to copy the `src` folder into the Balatro executable you can run `npm run repack`.
  - `npm run build` will build the mod into the `build` folder ready to be zipped up.

## What to commit

Once you are ready to commit simply run `npm run createPatch` and the you can simply commit the change made to `patch.diff`.

## How does the TOML comment system work

Basicaly it allow you to put the TOML patch directly in the lua file as comment.

You can then put javascript style string literal in the payload that will get replaced by code at the specified location relative to that comment.

See [./tools/parser/README.md](./tools/parser/README.md) for more detail and example on the format.

Note that currently only the `payload` support this, but I want to support it for the `target` as well, for the rare cases where that make sense.

-----------

`Any Vanilla Balatro lua code distributed here is the sole property of LocalThunk and the publisher. Consider also buying the game on mobile to to be fair.`
