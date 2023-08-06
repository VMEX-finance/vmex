const { ethers } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const {
    getAssetPrices
} = require("../dist/utils");

const MAINNET_ASSET_MAPPINGS = new Map([
    ['AAVE', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'],
    ['BAT', '0x0d8775f648430679a709e98d2b0cb6250d2887ef'],
    ['BUSD', '0x4Fabb145d64652a948d72533023f6E7A623C7C53'],
    ['DAI', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
    ['ENJ', '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c'],
    ['KNC', '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'],
    ['LINK', '0x514910771AF9Ca656af840dff83E8264EcF986CA'],
    ['MANA', '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'],
    ['MKR', '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'],
    ['REN', '0x408e41876cCCDC0F92210600ef50372656052a38'],
    ['SNX', '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'],
    ['SUSD', '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'],
    ['TUSD', '0x0000000000085d4780B73119b644AE5ecd22b376'],
    ['UNI', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'],
    ['USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    ['USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
    ['WBTC', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
    ['WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    ['YFI', '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'],
    ['ZRX', '0xE41d2489571d322189246DaFA5ebDe1F4699F498'],
    ['Tricrypto2', '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff'],
    ['ThreePool', '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490'],
    ['StethEth', '0x06325440D014e39736583c165C2963BA99fAf14E'],
    ['Steth', '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
    ['FraxUSDC', '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC'],
    ['Frax3Crv', '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B'],
    ['FRAX', '0x853d955aCEf822Db058eb8505911ED77F175b99e'],
    ['BAL', '0xba100000625a3754423978a60c9317c58a424e3D'],
    ['CRV', '0xD533a949740bb3306d119CC777fa900bA034cd52'],
    ['CVX', '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B'],
    ['BADGER', '0x3472A5A71965499acd81997a54BBA8D852C6E53d'],
    ['LDO', '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'],
    ['ALCX', '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF'],
    ['Oneinch', '0x111111111117dC0aa78b770fA6A738034120C302'],
]);

describe("Utils - get all asset prices", () => {
    it("1 - should be able to get all asset prices", async () => {
        const assets = Array.from(MAINNET_ASSET_MAPPINGS.keys());
        const data = await getAssetPrices({
            assets: assets,
            network: 'localhost',
            test: true
        });

        Array.from(data.entries()).map((item) => {
            console.log(item[0], ethers.utils.formatUnits(item[1].priceUSD, 18));
        })
    })
})
