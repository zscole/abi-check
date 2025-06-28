import { Interface } from "ethers";
import { getBytecode } from "./rpc.js";
import { extractSelectorsFromBytecode } from "./selector.js";
import { stripMetadata } from "./metadata.js";

interface ComparisonResult {
  matches: string[];
  missing: string[];
  extra: string[];
}

export async function checkAbiAgainstAddress(
  abi: any[], 
  address: string, 
  rpcUrl: string, 
  ignoreMetadata = false
): Promise<ComparisonResult> {
  const iface = new Interface(abi);
  const expected = new Set<string>();
  
  iface.forEachFunction((func) => {
    expected.add(func.selector);
  });
  
  let bytecode = await getBytecode(address, rpcUrl);
  
  if (ignoreMetadata) {
    bytecode = stripMetadata(bytecode);
  }
  
  const actual = extractSelectorsFromBytecode(bytecode);
  
  return {
    matches: [...expected].filter(s => actual.has(s)),
    missing: [...expected].filter(s => !actual.has(s)),
    extra: [...actual].filter(s => !expected.has(s))
  };
}
