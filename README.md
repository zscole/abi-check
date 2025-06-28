# abi-check

[![CI](https://github.com/YOUR_ORG/abi-check/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_ORG/abi-check/actions/workflows/test.yml)

Check if your ABI matches the deployed contract's function selectors.

## Why

- Catch ABI drift before deployments
- Verify contracts without trusting explorer APIs
- Automate ABI consistency in CI

## Install

```bash
npm install -g abi-check
```

## Usage

```bash
# Local ABI file
abi-check -a 0x... -r https://... --abi contract.json

# Fetch from Etherscan  
abi-check -a 0x... -r https://... -e YOUR_API_KEY

# Just show function signatures
abi-check -a 0x... -r https://... -e YOUR_API_KEY --functions

# Ignore compiler differences
abi-check -a 0x... -r https://... -e YOUR_API_KEY --ignore-metadata

# Fail only on missing functions
abi-check -a 0x... -r https://... -e YOUR_API_KEY --fail-on missing

# Multi-chain with Sourcify fallback
abi-check -a 0x... -r https://... -e YOUR_API_KEY --scan polygonscan --chain-id 137
```

## Options

- `-a, --address <addr>`: contract address
- `-r, --rpc <url>`: RPC endpoint  
- `--abi <file>`: local ABI file
- `-e, --etherscan <key>`: etherscan API key
- `--scan <explorer>`: etherscan, polygonscan, arbiscan
- `--chain-id <id>`: chain ID for sourcify fallback
- `--functions`: only show function signatures
- `--ignore-metadata`: strip compiler metadata
- `--fail-on <mode>`: exit 1 on missing, extra, or both
- `--diff`: show differences only
- `--strict`: fail on any extra selectors
- `--silent`: errors only
- `--json`: JSON output

## Features

**ABI Normalization**: Handles formatting differences automatically

**Collision Detection**: Warns about conflicting 4-byte selectors:
```
warning: selector collision: 0xa9059cbb used by transfer(address,uint256), transfer(bytes32)
```

**Sourcify Fallback**: Tries Sourcify when Etherscan fails

**Metadata Stripping**: Ignores compiler differences with `--ignore-metadata`

## Library

```ts
import { checkAbiAgainstAddress } from 'abi-check';

const result = await checkAbiAgainstAddress(abi, '0x...', 'https://...', false);
// { matches: [...], missing: [...], extra: [...] }
```

## Output

```
✔ transfer(address,uint256)
✔ approve(address,uint256) 
❌ Missing: burn(uint256)
⚠️  Extra: 0xa9059cbb
```

## Exit Codes

- `0`: ABI matches
- `1`: Mismatch found (based on `--fail-on`)
- `2`: Invalid usage

## CI

```bash
# Fail only on missing functions
abi-check -a 0x... -r https://... -e $API_KEY --fail-on missing --silent

# Show differences for logs
abi-check -a 0x... -r https://... -e $API_KEY --diff
```
