### ANALYTICS
`@vmexfinance/sdk/dist/src.ts/analytics`

- `async getTVL()` returns  { BigNumber: "0x..." }
- `async getWalletBalanceAcrossTranches()
``` Typescript
{
 _addresses: string[][];
 _balances: BigNumber[][];
}
```
- `async getTrancheTVL()` returns { BigNumber: "0x..." }
- `async getTrancheTokens()` returns `tuple(string[] aAddress, string[] uAddress)
