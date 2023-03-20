// import { BigNumber, utils } from "ethers";
//Require dotenv
require('dotenv').config();
const {deployments} = require("../dist/constants.js")
const { ethers, BigNumber, Wallet } = require("ethers");
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
  "function mint(uint256 value) public returns(bool)",
];



describe("Fund accounts", () => {
  const network = "goerli";
  console.log("key: ",process.env.ALCHEMY_KEY)
  let provider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_KEY);
  const assets = [
    "AAVE",
    "BAT",
    "BUSD",
    "DAI",
    "ENJ",
    "KNC",
    "LINK",
    "MANA",
    "MKR",
    "REN",
    "SNX",
    "SUSD",
    "TUSD",
    "UNI",
    "USDC",
    "USDT",
    "WETH",
    "WBTC",
    "YFI",
    "ZRX",
    "UniDAIWETH",
    "UniWBTCWETH",
    "UniAAVEWETH",
    "UniBATWETH",
    "UniDAIUSDC",
    "UniCRVWETH",
    "UniLINKWETH",
    "UniMKRWETH",
    "UniRENWETH",
    "UniSNXWETH",
    "UniUNIWETH",
    "UniUSDCWETH",
    "UniWBTCUSDC",
    "UniYFIWETH",
    "BptWBTCWETH",
    "BptBALWETH",
    "WMATIC",
    "STAKE",
    "WAVAX",
    "USD",
    "Tricrypto2",
    "ThreePool",
    "StethEth",
    "Steth",
    "FraxUSDC",
    "Frax3Crv",
    "FRAX",
    "BAL",
    "CRV",
    "CVX",
    "BADGER",
    "LDO",
    "ALCX",
    "Oneinch",
    "yvTricrypto2",
    "yvThreePool",
    "yvStethEth",
    "yvFraxUSDC",
    "yvFrax3Crv",
  ]


  it("Get_goerli", async () => {

    let token = [];
    for(let i =0;i<assets.length;i++){
      // console.log(assets[i].toUpperCase())
      // console.log(deployments[assets[i].toUpperCase()])
       token.push(
          new ethers.Contract(
            deployments[assets[i].toUpperCase()][
              "goerli"
            ].address,
            IERC20abi,
            provider
          )
        )
    }

    // console.log("Tokens: ",token)

      for(let j =0;j<2;j++){
        const wallet = Wallet.fromMnemonic(process.env.MNEMONIC,`m/44'/60'/0'/0/${j}`);
        const signer = wallet.connect(provider);
        // console.log(signer)
        for(let i = 0;i<token.length;i++){
          await token[i].connect(signer).mint(ethers.utils.parseUnits("1000.0",await token[i].decimals()));
          console.log("Signer: ",signer.address," token: ",await token[i].name()," amount: ",(await token[i].connect(signer).balanceOf(signer.address)).toString());
        }

      }
  });

});
