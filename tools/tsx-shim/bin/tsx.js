#!/usr/bin/env bun
import path from "path";
import { pathToFileURL } from "url";

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log("Usage: tsx <script> [...args]");
  if (args.length === 0) {
    process.exit(1);
  }
  process.exit(0);
}

const [scriptPath, ...rest] = args;
const resolved = path.resolve(process.cwd(), scriptPath);

process.argv = [process.argv[0], resolved, ...rest];

await import(pathToFileURL(resolved).href);
