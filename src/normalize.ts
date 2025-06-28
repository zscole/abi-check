import { keccak256, toUtf8Bytes } from 'ethers';

interface AbiFunction {
  type: 'function';
  name: string;
  inputs: AbiParam[];
  outputs?: AbiParam[];
  stateMutability?: string;
}

interface AbiParam {
  type: string;
  internalType?: string;
}

export function normalizeAbi(abi: any[]): AbiFunction[] {
  return abi
    .filter(item => item?.type === 'function')
    .map(item => ({
      type: 'function' as const,
      name: item.name,
      inputs: (item.inputs || []).map(cleanParam),
      outputs: (item.outputs || []).map(cleanParam),
      stateMutability: item.stateMutability || 'nonpayable'
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((item, index, arr) => 
      index === arr.findIndex(other => 
        item.name === other.name && 
        JSON.stringify(item.inputs) === JSON.stringify(other.inputs)
      )
    );
}

function cleanParam(param: any): AbiParam {
  return {
    type: param.type,
    internalType: param.internalType
  };
}

export function detectCollisions(abi: AbiFunction[]): Array<{selector: string; functions: string[]}> {
  const selectorMap = new Map<string, string[]>();
  
  abi.forEach(func => {
    const sig = `${func.name}(${func.inputs.map(i => i.type).join(',')})`;
    const selector = keccak256(toUtf8Bytes(sig)).slice(0, 10);
    
    if (!selectorMap.has(selector)) {
      selectorMap.set(selector, []);
    }
    selectorMap.get(selector)!.push(sig);
  });
  
  return Array.from(selectorMap.entries())
    .filter(([_, funcs]) => funcs.length > 1)
    .map(([selector, functions]) => ({ selector, functions }));
} 