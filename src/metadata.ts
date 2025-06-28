// Strip compiler metadata that can cause false mismatches on recompiled contracts
export function stripMetadata(bytecode: string): string {
  if (!bytecode || bytecode.length < 4) return bytecode;
  
  const hex = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
  
  // Solidity metadata pattern: 0xa165627a7a72305820<32 bytes hash>0029
  const withoutMetadata = hex.replace(/a165627a7a72305820[0-9a-fA-F]{64}0029$/, '');
  
  // Constructor args often appear as repeated 00 or ff at the end
  const withoutConstructorArgs = withoutMetadata.replace(/(00|ff){10,}$/, '');
  
  return '0x' + withoutConstructorArgs;
} 