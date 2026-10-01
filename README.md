![microStudio](static/img/microstudio_title_image.png)

microStudio is a free, open source game engine online.
It is also a platform to learn and practise programming.

microStudio can be used for free at https://microstudio.dev

You can also install your own copy, to work locally or on your own server
for your team or classroom. You will find instructions below.

# 3 ways to use microStudio

### Online service
microStudio is available online at https://microstudio.dev ; this is the simpler and the preferred way, you will have access to all the online collaboration features, online publishing and more export features. You don't even need to create an account, you can start working as a guest.

### Standalone application (offline)
Using the standalone, offline app ; download it in the Releases section of this repository, or on itch.io: https://microstudio.itch.io/microstudio ; helpful if you plan to use it in an environment without connection to internet.

### Set up your own microStudio server
You can clone this repository and start your own microStudio server, for a team or a classroom for example. See instructions below:

* Install Node JS (downloads and instructions: https://nodejs.org/en/download/)
* `git clone https://github.com/pmgl/microstudio.git`
* `cd microstudio`
* `git clone https://github.com/pmgl/microstudio.wiki.git`
* `cd server`
* `npm install`
* `npm start`
* Open browser on `http://localhost:8080`

For active development use:
* `npm run dev` instead of `npm start`

### TypeScript
A small set of hand-written client scripts (the service worker scripts under `static/`) are written in TypeScript, under the `ts-src/` folder at the root of the repository. They are compiled to their committed `static/*.js` counterparts as part of `npm run compile` (and therefore `npm run dev`).
* `npm run compile-ts` compiles the TypeScript sources into `static/`/`server/` (via three separate `tsconfig*.json` projects, see below)
* `npm run typecheck` type-checks the TypeScript sources without emitting output

Most of the application (editors, runtime, server) is written in CoffeeScript and compiled to JavaScript via `npm run compile`; this is unaffected by the TypeScript setup.

Some leaf CoffeeScript modules with few dependents are being incrementally converted to TypeScript as well, following one of two patterns depending on how the file is loaded:

* **Browser scripts** (e.g. `static/js/util/random.coffee` → `ts-src/js/util/random.ts`, compiled via `tsconfig.json`/`tsconfig.app.json`): the `.coffee` source is removed, its `.ts` replacement mirrors the original file path 1:1 under `ts-src/`, and it is compiled to the exact same `static/*.js` output path so no other file (e.g. `server/concatenator.coffee`) needs to change. Since the project has no bundler or module system for these files — compiled/concatenated scripts share a single global scope (see `server/concatenator.coffee`) — converted TypeScript modules keep emitting plain global-scope classes/declarations, not ES modules (a top-level `var X = ...`/function in the original CoffeeScript must stay `var`/`function`-based in TS, never a native top-level `class`/`const`/`let`, to avoid redeclaration clashes when files are concatenated together).
* **Server (Node) modules** (e.g. `server/db/record.coffee` → `ts-src/server/db/record.ts`, compiled via `tsconfig.server.json`): these are plain Node `require()`/`module.exports` CommonJS modules, each loaded independently by Node — not concatenated into a shared script scope — so they are written as normal TypeScript modules using `export = ...` (which compiles to `module.exports = ...`), compiled with `"module": "commonjs"` into their original `server/**/*.js` path.

### Configuration
To use specific configuration options, create a JSON file `config.json` in the root folder (same folder as this README.md).
You can find partial examples in this folder as config_local.json and config_prod.json.

#### Configuration options

|option|description|
|-|-|
|realm|`"local"` or `"production"`|
|run_domain|The run domain if you are running this in production ; must include protocol (e.g. `"https://microstudio.io"`)|
|dev_domain|The dev domain if you are running this in production ; must include protocol (e.g. `"https://microstudio.dev"`)|
|delegate_relay_service|set to true if you are running a separate relay server for the microStudio Networking features|
|relay-key|a secret key to use with the delegated relay service|
|default_project_language|The default language selected when a user creates a project. Can be set to `"microscript_v2"` (default), `"microscript"`, `"javascript"`, `"lua"` or `"python"`|
|tutorials_root_url|Sets a different URL for loading your own set of tutorials (note: if you use this option, in the toc.md, you must specify a complete URL with domain name for each tutorial)|
|brython_path|Sets a path to a custom folder for the Brython lib|
