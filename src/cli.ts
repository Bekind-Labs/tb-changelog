#!/usr/bin/env node

import consola from "consola";
import { main } from "./main";

consola.level = process.env.DEBUG === "true" ? 4 : 3;
consola.options.formatOptions.date = false;
consola.options.stdout = process.stderr;

main(process.argv.slice(2)).then();
