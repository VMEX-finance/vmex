VMEXBond.sol

- Extends ERC721

```js

address public vault;
/* token which can be locked to receive an NFT */

struct Bond {
  uint256 collateral;
  uint256 valueAtLock;
  uint256 maturesAt;
  uint256 underwrites;
}

mapping (uint256 => Bond) public bonds;
/* map tokenId to Bond object */

```


VMEXLendVault.sol

ERC4626 vault where LPs can supply assets to be eventually loaned out
