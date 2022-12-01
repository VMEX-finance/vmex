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

const TricryptoDeposit = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
const TricryptoABI = require("@vmex/contracts/localhost_tests/abis/tricrypto.json");
const Crv3Crypto = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_ROUTER_ABI = require("@vmex/contracts/localhost_tests/abis/uniswapAbi.json");
const USDCaddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const network = "localhost";


describe("Supply - end-to-end test", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const owner = provider.getSigner(0);
  

  it("1 - signer should receive 3 WETH so he can transact for LP tokens", async () => {
    // console.log(await owner.getAddress())
    const WETH = new ethers.Contract(WETHaddr, IERC20abi, owner);
    await WETH.connect(owner).deposit({
      value: ethers.utils.parseEther("3.0"),
    });
    await WETH.connect(provider.getSigner(2)).deposit({
        value: ethers.utils.parseEther("3.0"),
      });

    expect(await WETH.balanceOf(await owner.getAddress())).to.be.above(
      ethers.utils.parseEther("1.0")
    );
    expect(await WETH.balanceOf(await provider.getSigner(2).getAddress())).to.be.above(
        ethers.utils.parseEther("1.0")
      );
  });

  it("Uniswap ETH for USDC", async () => {
    const DAI = new ethers.Contract(USDCaddr,IERC20abi)
    const myWETH = new ethers.Contract(WETHaddr, IERC20abi);

    const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

    const path = [myWETH.address, DAI.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    //emergency deposits 100 WETH to pool to provide liquidity
    var options = {value: ethers.utils.parseEther("10000.0")}

    //10000 usdc
    await UNISWAP_ROUTER_CONTRACT.connect(owner).swapExactETHForTokens("10000000000", path, await owner.getAddress(), deadline,options)

    var signerDAI = await DAI.connect(owner).balanceOf(await owner.getAddress())

    expect(
        signerDAI.toString()
    ).to.not.be.bignumber.equal(0, "Did not get DAI");

    await UNISWAP_ROUTER_CONTRACT.connect(provider.getSigner(2)).swapExactETHForTokens("10000000000", path, await provider.getSigner(2).getAddress(), deadline,options)

  });

});
