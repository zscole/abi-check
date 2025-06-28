import fetch from "node-fetch";

const EXPLORERS = {
  etherscan: 'https://api.etherscan.io',
  polygonscan: 'https://api.polygonscan.com', 
  arbiscan: 'https://api.arbiscan.io'
} as const;

type ExplorerName = keyof typeof EXPLORERS;

interface EtherscanResponse {
  status: string;
  result: string;
}

export async function fetchAbiFromExplorer(
  address: string, 
  apiKey: string, 
  explorer: string = 'etherscan'
): Promise<any[]> {
  const baseUrl = EXPLORERS[explorer as ExplorerName];
  if (!baseUrl) {
    throw new Error(`unsupported explorer: ${explorer}`);
  }
  
  const url = `${baseUrl}/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json() as EtherscanResponse;
  
  if (data.status !== '1') {
    throw new Error(data.result || 'unknown error');
  }
  
  return JSON.parse(data.result);
}

export const fetchAbiFromEtherscan = (address: string, apiKey: string) => 
  fetchAbiFromExplorer(address, apiKey, 'etherscan'); 