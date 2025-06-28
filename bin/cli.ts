#!/usr/bin/env node
import { Command } from "commander";
import { checkAbiAgainstAddress } from "../src/index.js";
import { fetchAbiFromExplorer } from "../src/fetch.js";
import { fetchAbiFromSourceify } from '../src/sourcify.js';
import { normalizeAbi, detectCollisions } from '../src/normalize.js';
import { stripMetadata } from '../src/metadata.js';
import { readFileSync } from "fs";

const program = new Command();
program
  .requiredOption("-a, --address <addr>", "contract address")
  .requiredOption("-r, --rpc <url>", "RPC endpoint")
  .option("--abi <file>", "local ABI file")
  .option("-e, --etherscan <key>", "etherscan API key")
  .option("--scan <explorer>", "explorer (etherscan|polygonscan|arbiscan)", "etherscan")
  .option("--chain-id <id>", "chain ID for sourcify fallback", "1")
  .option("--functions", "only output function signatures")
  .option("--ignore-metadata", "strip compiler metadata from bytecode")
  .option("--fail-on <mode>", "exit 1 only on: missing, extra, both", "both")
  .option("--json", "output JSON")
  .option("--diff", "unified diff format")
  .option("--silent", "suppress non-error output")
  .option("--strict", "exit 1 if any extra selectors found")
  .action(async (options) => {
    let abi;
    
    if (options.abi) {
      try {
        abi = JSON.parse(readFileSync(options.abi, 'utf8'));
      } catch (err) {
        console.error(`error: cannot read ABI file: ${options.abi}`);
        process.exit(2);
      }
    } else if (options.etherscan) {
      if (!options.silent) {
        console.error(`fetching ABI from ${options.scan}...`);
      }
      
      try {
        abi = await fetchAbiFromExplorer(options.address, options.etherscan, options.scan);
      } catch (err) {
        if (!options.silent) {
          console.error(`${options.scan} failed, trying sourcify...`);
        }
        try {
          abi = await fetchAbiFromSourceify(options.address, parseInt(options.chainId));
        } catch (sourcifyErr) {
          console.error(`error: ${options.scan}: ${(err as Error).message}`);
          console.error(`error: sourcify: ${(sourcifyErr as Error).message}`);
          process.exit(2);
        }
      }
    } else {
      console.error('error: need --abi or --etherscan');
      process.exit(2);
    }
    
    abi = normalizeAbi(abi);
    
    const collisions = detectCollisions(abi);
    if (collisions.length > 0 && !options.silent) {
      collisions.forEach(({ selector, functions }) => {
        console.error(`warning: selector collision: ${selector} used by ${functions.join(', ')}`);
      });
    }
    
    if (options.functions) {
      const signatures = abi
        .filter(item => item.type === 'function')
        .map(func => `${func.name}(${(func.inputs || []).map((i: any) => i.type).join(',')})`)
        .sort();
      
      signatures.forEach(sig => console.log(sig));
      process.exit(0);
    }
    
    try {
      const result = await checkAbiAgainstAddress(abi, options.address, options.rpc, !!options.ignoreMetadata);
      
      if (options.json) {
        const output = { ...result, collisions };
        console.log(JSON.stringify(output, null, 2));
      } else if (options.diff) {
        result.missing.forEach(m => console.log(`- ${m}`));
        result.extra.forEach(m => console.log(`+ ${m}`));
      } else if (!options.silent) {
        result.matches.forEach(m => console.log(`✔ ${m}`));
        result.missing.forEach(m => console.log(`❌ Missing: ${m}`));
        result.extra.forEach(m => console.log(`⚠️  Extra: ${m}`));
      }
      
      const failOnMissing = options.failOn === 'missing' || options.failOn === 'both';
      const failOnExtra = options.failOn === 'extra' || options.failOn === 'both';
      
      if ((failOnMissing && result.missing.length > 0) ||
          (failOnExtra && result.extra.length > 0) ||
          (options.strict && result.extra.length > 0)) {
        process.exit(1);
      }
      
      process.exit(0);
    } catch (err) {
      console.error(`error: ${(err as Error).message}`);
      process.exit(2);
    }
  });

program.parse();
