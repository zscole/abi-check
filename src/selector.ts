export function extractSelectorsFromBytecode(bytecode: string): Set<string> {
  const selectors = new Set<string>();
  
  // Look for PUSH4 opcode (0x63) followed by 4-byte function selectors
  for (let i = 0; i < bytecode.length - 10; i += 2) {
    if (bytecode.slice(i, i + 4) === '63') {
      const selector = '0x' + bytecode.slice(i + 2, i + 10);
      selectors.add(selector);
    }
  }
  
  return selectors;
}
