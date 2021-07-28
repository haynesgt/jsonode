#!/usr/bin/env node

const fs = require("fs");
const process = require("process");
const vm = require("vm");
const minimist = require("minimist");
const console = require("console");

function help() {
  console.error(`Usage:\n` +
    `  jsonode [(-r|--require) module]* [--raw-in] [--raw-out] [-u|--ugly] [-i|--indent=2] ((-f|--file) <file.js> | <code>)`,
    `  <command with json output> | jsonode <code>\n` +
    `  jsonode <code> < <json file>\n\n` +
    `  jsonode --file <file.js> < <json file>\n\n` +
    `Runs the code as javascript, where \`$\` contains input parsed as json. ` +
    `The output is converted to json by default. ` +
    `If the output is a function, it is called with the input as the argument. ` +
    `If the output is a promise, it is awaited. \n\n` +
    `Options:\n`
    `  --ugly\tsuppress indented output\n` +
    `  --raw-in\tmake \`$\` equal the input as a string rather than json\n`
    `  --raw-out\tprint the output as a string rather than json\n`
    `  --require\tinclude a module and make it available by its name\n`
  );
}

function argToArray(arg) {
  if (typeof arg === Array) {
    return arg;
  }
  if (arg === undefined) {
    return [];
  }
  return [ arg ];
}

function argToString(arg) {
  if (typeof arg === "string") {
    return arg;
  }
  if (arg instanceof Array) {
    return arg.join(" ");
  }
  return arg && arg.toString();
}

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

(async () => {
  try {
    const argOpts = {
      alias: { "f": "file", "u": "ugly", "r": "require" },
      boolean: ["ugly", "raw-in", "raw-out"]
    };
    const args = minimist(process.argv.slice(2), argOpts);

    if (args.help) {
      help();
      process.exit(1);
    }

    const code = args.file ? fs.readFileSync(args.file) : argToString(args._) || '$';

    const input = await read(process.stdin);
    const $ = args['raw-in'] ? input : JSON.parse(input);
    const modules = argToArray(args.require).reduce((accum, next) => ({[next.replace(/-/g, "_")]: require(next)}), {})
    const context = vm.createContext({$, require, ...modules});

    const result = await vm.runInContext(code, context);

    const data = typeof result === "function" ? await result($) : result;

    if (args['raw-out']) {
      console.dir(data, {depth: null});
    } else {
      const indent = args.ugly ? undefined : args.indent || 2;
      const output = JSON.stringify(data, null, indent);
      console.log(output);
    }
  } catch (e) {
    console.error(e);
  }
})();
