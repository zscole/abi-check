import { JsonRpcProvider } from 'ethers';

export async function getBytecode(address: string, rpcUrl: string): Promise<string> {
  const provider = new JsonRpcProvider(rpcUrl);
  return provider.getCode(address);
}
