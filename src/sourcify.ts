import fetch from 'node-fetch';

interface SourceifyMetadata {
  output?: {
    abi?: any[];
  };
}

export async function fetchAbiFromSourceify(address: string, chainId: number = 1): Promise<any[]> {
  const url = `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/metadata.json`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  
  const metadata = await res.json() as SourceifyMetadata;
  
  if (!metadata.output?.abi) {
    throw new Error('no ABI found');
  }
  
  return metadata.output.abi;
} 