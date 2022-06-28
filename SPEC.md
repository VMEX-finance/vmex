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

ERC4626 vault where LPs can supply assets to be loaned out.

Standard ERC4626 except for the existence of these functions

```js

uint256 public loaned;

loan(uint256 amount) public onlyBond;
/* loans funds out to msg.sender, increases value of loaned */

repay(uint256 amount) public;
/* calls ERC20(token).transferFrom(msg.sender, amount), decreases value of loaned */

```

All functions to compute the price per full share or vice versa should consider the balance held in the vault to be `ERC20(token).balanceOf(address(this)).add(loaned)`
  
