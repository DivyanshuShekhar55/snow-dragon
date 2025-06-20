/* global process*/
import path from "path";
import alias from "@rollup/plugin-alias";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import esbuild from "rollup-plugin-esbuild";

const extensions = [".js", ".ts", ".jsx", ".tsx"];
const { root } = path.parse(process.cwd());

export const entries = [
  { find: /.*\/vanilla\.ts$/, replacement: "snow-dragon/vanilla" },
  { find: /.*\/react\.ts$/, replacement: "snow-dragon/react" },
];

function external(id) {
  // all external libs import like import React from "react"
  // so if import doesn't start with '.'
  // but files like C:/users/... may exist so also include files with root
  return !id.startsWith(".") && !id.startsWith(root);
}

function getEsbuild() {
  return esbuild({
    target: "es2018",
    supported: { "import-meta": true },
  });
}

// create the es-module func
function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: "esm" },
    external,
    plugins: [
      alias({ entries: entries.filter((entry) => !entry.find.test(input)) }),
      resolve({ extensions }),
      replace({
        // no env used in this codebase as of writing it, but following is for making codebase future-proof
        // makes the library useful for both users of libraries Node (which uses process.env.NODE_ENV)
        // also for some frameworks like Vite where we use import.meta.env?.MODE
        ...(output.endsWith(".js")
          ? {
              "import.meta.env?.MODE": "process.env.NODE_ENV",
            }
          : {
              "import.meta.env?.MODE":
                "(import.meta.env ? import.meta.env.MODE : undefined)",
            }),

        // replace the full word only
        // also don't touch if there is an assignment to the value happening
        delimiters: ["\\b", "\\b(?!(\\.|/))"],
        preventAssignment: true,
      }),
      getEsbuild(),
    ],
  };
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: "cjs" },
    external,
    plugins: [
      alias({ entries: entries.filter((entry) => !entry.find.test(input)) }),
      resolve({ extensions }),
      replace({
        "import.meta.env?.MODE": "process.env.NODE_ENV",
        delimiters: ["\\b", "\\b(?!(\\.|/))"],
        preventAssignment: true,
      }),
      getEsbuild(),
    ],
  };
}

// create the es and common-js configs
export default function (args) {
  let c = Object.keys(args).find((key) => key.startsWith("config-"));
  if (c) {
    c = c.slice("config-".length).replace(/_/g, "/");
  } else {
    c = "index";
  }
  return [
    // ...(c === "index" ? [createDeclarationConfig(`src/${c}.ts`, "dist")] : []),
    createCommonJSConfig(`src/${c}.js`, `dist/${c}.js`),
    createESMConfig(`src/${c}.js`, `dist/esm/${c}.mjs`),
  ];
}
