// import { BigNumber, utils } from "ethers";

const { ethers, BigNumber } = require("ethers");
const chai = require("chai");
const { expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
chai.use(require("chai-bignumber")());
const WETHaddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const IERC20abi = [
  "function allowance(address owner, address spender) external view returns (uint256 remaining)",
  "function approve(address spender, uint256 value) external returns (bool success)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
  "function decimals() external view returns (uint8 decimalPlaces)",
  "function name() external view returns (string memory tokenName)",
  "function symbol() external view returns (string memory tokenSymbol)",
  "function totalSupply() external view returns (uint256 totalTokensIssued)",
  "function transfer(address to, uint256 value) external returns (bool success)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
  "function deposit() public payable",
  "function withdraw(uint wad) public",
];

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
];

describe("Fund_vault", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  //allocate 1,000 eth for each asset (account has total of a million)
  const myWETH = new ethers.Contract(WETHaddr, IERC20abi);

  //emergency deposits 100 WETH to pool to provide liquidity
  const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(
    UNISWAP_ROUTER_ADDRESS,
    UNISWAP_ROUTER_ABI
  );
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

  it("Supply USDC to rewards vault", async () => {
    const signer = provider.getSigner(0);
    const vaultAddress = await signer.getAddress();

    const assetAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const token = new ethers.Contract(assetAddr, IERC20abi, provider);
    const path = [myWETH.address, token.address];
    const deadline = (await provider.getBlock("latest")).timestamp + 60 * 20; // 20 minutes from the current Unix time

    await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(
      "0",
      path,
      vaultAddress,
      deadline,
      { value: ethers.utils.parseEther("100000.0") }
    );

    const vaultBalance = await token.balanceOf(vaultAddress);
    console.log("ending vault USDC balance", vaultBalance);
  });
});
