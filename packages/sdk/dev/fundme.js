// import { BigNumber, utils } from "ethers";
// NOTE: This fundme file is hardcoded to work for mainnet forks only
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
var curvePool2Abi = [
  "function add_liquidity(uint256[2] _amounts,uint256 _min_mint_amount) external payable",
  "function calc_token_amount(uint256[2] _amounts,bool deposit) external view",
];
var curvePool3Abi = [
  "function add_liquidity(uint256[3] _amounts,uint256 _min_mint_amount) external",
  "function calc_token_amount(uint256[3] _amounts,bool deposit) external view",
];

describe("Fund accounts", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  //allocate 1,000 eth for each asset (account has total of a million)
  const ethAmount = ethers.utils.parseEther("1000.0");
  const myWETH = new ethers.Contract(WETHaddr, IERC20abi);

  //emergency deposits 100 WETH to pool to provide liquidity
  var options = { value: ethAmount };
  const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(
    UNISWAP_ROUTER_ADDRESS,
    UNISWAP_ROUTER_ABI
  );

  const uniswapAssets = [
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
    "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
    "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
    "0x408e41876cCCDC0F92210600ef50372656052a38",
    "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
    "0x0000000000085d4780B73119b644AE5ecd22b376",
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
    "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", //steth
    "0x853d955aCEf822Db058eb8505911ED77F175b99e", //frax
    "0xba100000625a3754423978a60c9317c58a424e3D",
    "0xD533a949740bb3306d119CC777fa900bA034cd52",
    "0x3472A5A71965499acd81997a54BBA8D852C6E53d", //BADGER
    "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",
    "0x111111111117dC0aa78b770fA6A738034120C302",
  ];

  const curveAssets = [
    "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff", //tricrypto
    "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", //threepool
    "0x06325440D014e39736583c165C2963BA99fAf14E", //stetheth
    "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC", //frax usdc
    "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B", //frax 3crv
  ];

  const curvePools = [
    "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
    "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
    "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
    "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2",
    "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
  ];

  const CVX = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
  const CVX_SWAP = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
  var CVX_SWAP_ABI = [
    "function exchange_underlying(uint256 i, uint256 j, uint256 dx, uint256 min_dy) external payable returns (uint256)",
  ];

  it("Get WETH", async () => {
    for (let j = 0; j < 8; j++) {
      const signer = provider.getSigner(j);
      console.log(signer);
      await myWETH.connect(signer).deposit({
        value: ethAmount,
      });

      var signerWETH = await myWETH
        .connect(signer)
        .balanceOf(await signer.getAddress());
      const signerETH = await provider.getBalance(await signer.getAddress());
      console.log(
        "signer with address",
        await signer.getAddress(),
        "has weth balance",
        signerWETH.toString(),
        "and has ETH balance",
        signerETH.toString()
      );

      expect(signerWETH.toString()).to.not.be.bignumber.equal(
        0,
        "Did not get WETH"
      );
    }
  });

  it("Uniswap ETH for assets", async () => {
    const deadline = (await provider.getBlock("latest")).timestamp + 60 * 20; // 20 minutes from the current Unix time

    for (let j = 0; j < uniswapAssets.length; j++) {
      const assetAddr = uniswapAssets[j];
      console.log(assetAddr);
      const token = new ethers.Contract(assetAddr, IERC20abi, provider);
      const path = [myWETH.address, token.address];

      for (let i = 0; i < 8; i++) {
        if (assetAddr == "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF") {
          if (i >= 2) {
            break;
          }
        }
        try {
          await UNISWAP_ROUTER_CONTRACT.connect(
            provider.getSigner(i)
          ).swapExactETHForTokens(
            "0",
            path,
            await provider.getSigner(i).getAddress(),
            deadline,
            options
          );
        } catch (e) {
          console.log("Swap failed: ", e);
        }

        var signerAmount = await token
          .connect(provider.getSigner(i))
          .balanceOf(await provider.getSigner(i).getAddress());
        console.log("Amount: ", signerAmount);

        // expect(
        //   signerAmount.toString()
        // ).to.not.be.bignumber.equal(0, "Did not get token");
      }
    }
  });

  it("Curvefi to get curve tokens", async () => {
    for (let i = 0; i < curveAssets.length; i++) {
      const token = new ethers.Contract(curveAssets[i], IERC20abi, provider);
      console.log(curveAssets[i]);
      let curvePool;

      for (let j = 0; j < 8; j++) {
        let amounts;
        let ethSend = {
          value: ethers.utils.parseEther("0"),
          gasLimit: 80000000,
        };
        let approvalToken;
        const signer = provider.getSigner(j);
        if (i == 0) {
          amounts = [
            ethers.utils.parseEther("0"),
            ethers.utils.parseEther("0"),
            ethers.utils.parseEther("10.0"),
          ];
          approvalToken = myWETH;
          curvePool = new ethers.Contract(
            curvePools[i],
            curvePool3Abi,
            provider
          );
        }
        if (i == 1) {
          amounts = [
            ethers.utils.parseEther("1000"),
            ethers.utils.parseEther("0"),
            ethers.utils.parseEther("0"),
          ];
          approvalToken = new ethers.Contract(
            "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            IERC20abi
          );
          curvePool = new ethers.Contract(
            curvePools[i],
            curvePool3Abi,
            provider
          );
        }
        if (i == 2) {
          amounts = [
            ethers.utils.parseEther("100"),
            ethers.utils.parseEther("0"),
          ];
          ethSend = { value: ethers.utils.parseEther("100") };
          approvalToken = myWETH;
          curvePool = new ethers.Contract(
            curvePools[i],
            curvePool2Abi,
            provider
          );
        }
        if (i == 3) {
          var amountUSDC = ethers.utils.parseUnits("10000", 6);
          amounts = [ethers.utils.parseEther("0"), amountUSDC];
          approvalToken = new ethers.Contract(
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            IERC20abi
          );
          curvePool = new ethers.Contract(
            curvePools[i],
            curvePool2Abi,
            provider
          );
        }
        if (i == 4) {
          amounts = [
            ethers.utils.parseEther("3000"),
            ethers.utils.parseEther("0"),
          ];
          approvalToken = new ethers.Contract(
            "0x853d955aCEf822Db058eb8505911ED77F175b99e",
            IERC20abi
          );
          curvePool = new ethers.Contract(
            curvePools[i],
            curvePool2Abi,
            provider
          );
          if (j >= 1) {
            //not enough liquidity to fund all accounts
            break;
          }
        }
        await approvalToken
          .connect(signer)
          .approve(curvePool.address, ethers.utils.parseEther("10000.0"));
        console.log("amounts: ", amounts);
        await curvePool.connect(signer).add_liquidity(amounts, "0", ethSend);

        var signerAmount = await token
          .connect(signer)
          .balanceOf(await signer.getAddress());

        expect(signerAmount.toString()).to.not.be.bignumber.equal(
          0,
          "Did not get token"
        );
      }
    }
  });

  it("Swap ETH for CVX on curve fi", async () => {
    const DAI = new ethers.Contract(CVX, IERC20abi);
    const CURVE_CONTRACT = new ethers.Contract(
      CVX_SWAP,
      CVX_SWAP_ABI,
      provider
    );

    //emergency deposits 100 WETH to pool to provide liquidity
    var options = {
      value: ethers.utils.parseEther("1000.0"),
      gasLimit: 80000000,
    };

    for (let j = 0; j < 8; j++) {
      const signer = provider.getSigner(j);
      await CURVE_CONTRACT.connect(signer).exchange_underlying(
        0,
        1,
        ethers.utils.parseEther("1000.0"),
        ethers.utils.parseEther("1000.0"),
        options
      );

      var signerDAI = await DAI.connect(signer).balanceOf(
        await signer.getAddress()
      );

      expect(signerDAI.toString()).to.not.be.bignumber.equal(
        0,
        "Did not get DAI"
      );
    }
  });
});
