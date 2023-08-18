"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const chai = require("chai");
const { expect } = chai;
const make_suite_1 = require("../test-suites/test-aave/helpers/make-suite");
const misc_utils_1 = require("../helpers/misc-utils");
const types_1 = require("../helpers/types");
const almostEqual_1 = require("./helpers/almostEqual");
const optimism_1 = __importDefault(require("../markets/optimism"));
const contracts_helpers_1 = require("../helpers/contracts-helpers");
const contracts_getters_1 = require("../helpers/contracts-getters");
const mint_tokens_1 = require("./helpers/mint-tokens");
const constants_1 = require("../helpers/constants");
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json");
chai.use(function (chai, utils) {
    chai.Assertion.overwriteMethod("almostEqualOrEqual", function (original) {
        return function (expected) {
            const actual = this._obj;
            almostEqual_1.almostEqualOrEqual.apply(this, [expected, actual]);
        };
    });
});
(0, make_suite_1.makeSuite)("general oracle test ", () => {
    const testSwapping = false;
    const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = types_1.ProtocolErrors;
    const fs = require('fs');
    const contractGetters = require('../helpers/contracts-getters.ts');
    // const lendingPool = await contractGetters.getLendingPool();
    // Load the first signer
    const VELO_ROUTER_ADDRESS = "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
    const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_OP/abis/velo_v2.json").toString();
    const BALANCER_POOL_ABI = fs.readFileSync("./localhost_tests_OP/abis/balancer_pool.json").toString();
    const BALANCER_VAULT_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    const BALANCER_VAULT_ABI = fs.readFileSync("./localhost_tests_OP/abis/balancer_vault.json").toString();
    const VeloAbi = [
        "function allowance(address owner, address spender) external view returns (uint256 remaining)",
        "function approve(address spender, uint256 value) external returns (bool success)",
        "function balanceOf(address owner) external view returns (uint256 balance)", "function decimals() external view returns (uint8 decimalPlaces)",
        "function name() external view returns (string memory tokenName)",
        "function symbol() external view returns (string memory tokenSymbol)",
        "function totalSupply() external view returns (uint256 totalTokensIssued)",
        "function transfer(address to, uint256 value) external returns (bool success)",
        "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
        "function tokens() external returns (address, address)",
        "function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external",
        "function metadata() external view returns (uint dec0, uint dec1, uint r0, uint r1, bool st, address t0, address t1)"
    ];
    const BeethovenAbi = [
        "function allowance(address owner, address spender) external view returns (uint256 remaining)",
        "function approve(address spender, uint256 value) external returns (bool success)",
        "function balanceOf(address owner) external view returns (uint256 balance)",
        "function decimals() external view returns (uint8 decimalPlaces)",
        "function name() external view returns (string memory tokenName)",
        "function symbol() external view returns (string memory tokenSymbol)",
        "function totalSupply() external view returns (uint256 totalTokensIssued)",
        "function transfer(address to, uint256 value) external returns (bool success)",
        "function getPoolId() external returns (bytes32 poolID)",
        "function getVault() external returns (IVault vaultAddress)",
        "function getRate() external view returns (uint256)"
    ];
    const ERC20abi = [
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
        "function withdraw(uint wad) public"
    ];
    const CurvePoolAbi = [
        `function add_liquidity(uint256[2] calldata amounts,uint256 min_mint_amount) external payable`,
        `function add_liquidity(uint256[3] calldata amounts,uint256 min_mint_amount) external payable`,
        `function coins(uint256 arg0) external view returns (address out)`,
        `function get_virtual_price() external view returns (uint256 out)`,
        `function claim_admin_fees() external`,
        `function withdraw_admin_fees() external`,
        `function owner() external view returns(address)`,
    ];
    const beefyAddr = [
        '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF',
        '0x0892a178c363b4739e5Ac89E9155B9c30214C0c0',
    ];
    const beefyAbi = [
        "function totalAssets() external view returns(uint256)",
        "function totalSupply() external view returns(uint256)",
        "function getPricePerFullShare() external view returns(uint256)",
        "function want() external view returns(address)",
        "function decimals() external view returns(uint256)",
        "function balanceOf(address owner) external view returns (uint256 balance)",
        "function deposit() external returns(uint256)",
        "function approve(address spender, uint256 value) external returns (bool success)",
    ];
    const yvAbi = [
        "function totalAssets() external view returns(uint256)",
        "function totalSupply() external view returns(uint256)",
        "function pricePerShare() external view returns(uint256)",
        "function token() external view returns(address)",
        "function decimals() external view returns(uint256)",
        "function balanceOf(address owner) external view returns (uint256 balance)",
        "function deposit() external returns(uint256)",
        "function approve(address spender, uint256 value) external returns (bool success)",
    ];
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const testLTVs = {
        '0x4200000000000000000000000000000000000006': 0.8,
        '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': 0.8,
        '0x4200000000000000000000000000000000000042': 0.3,
        '0xc40F949F8a4e094D1b49a23ea9241D289B7b2819': 0.6 //LUSD
    };
    it("set heartbeat higher", async () => {
        var signer = await contractGetters.getFirstSigner();
        const addProv = await contractGetters.getLendingPoolAddressesProvider();
        const oracleAdd = await addProv.connect(signer).getPriceOracle();
        const oracle = new misc_utils_1.DRE.ethers.Contract(oracleAdd, oracleAbi.abi);
        const network = "optimism";
        const { ProtocolGlobalParams: { UsdAddress }, ReserveAssets, ChainlinkAggregator, SequencerUptimeFeed, ProviderId } = optimism_1.default;
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        const chainlinkAggregators = await (0, contracts_helpers_1.getParamPerNetwork)(ChainlinkAggregator, network);
        let tokensToWatch = {
            ...reserveAssets,
            USD: UsdAddress,
        };
        if (!chainlinkAggregators) {
            throw "chainlinkAggregators is undefined. Check configuration at config directory";
        }
        const [tokens2, aggregators] = (0, contracts_getters_1.getPairsTokenAggregator)(tokensToWatch, chainlinkAggregators, optimism_1.default.OracleQuoteCurrency);
        const ag2 = aggregators.map((el) => {
            return {
                feed: el.feed,
                heartbeat: 86400000
            };
        });
        await oracle.connect(signer).setAssetSources(tokens2, ag2);
    });
    it("test pricing", async () => {
        const tokens = await (0, contracts_helpers_1.getParamPerNetwork)(optimism_1.default.ReserveAssets, types_1.eOptimismNetwork.optimism);
        var signer = await contractGetters.getFirstSigner();
        const { ReserveAssets, ReservesConfig } = optimism_1.default;
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, types_1.eOptimismNetwork.optimism);
        if (!reserveAssets) {
            throw "reserveAssets not defined";
        }
        const addProv = await contractGetters.getLendingPoolAddressesProvider();
        const oracleAdd = await addProv.connect(signer).getPriceOracle();
        const oracle = new misc_utils_1.DRE.ethers.Contract(oracleAdd, oracleAbi.abi);
        for (let [symbol, strat] of Object.entries(ReservesConfig)) {
            const currentAsset = reserveAssets[symbol];
            console.log("currentAsset: ", currentAsset);
            if (!currentAsset)
                continue;
            console.log("Pricing ", symbol);
            const price = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
            console.log("Price: ", price);
            let expectedPrice;
            // skip curve tokens too cause we test that separately
            //  if(symbol!="velo_USDTUSDC") continue;
            //  if( strat.assetType != 5) continue;
            if (strat.assetType == 0 || strat.assetType == 1 || strat.assetType == 2) {
                continue;
            }
            else if (strat.assetType == 3) { //yearn
                const yVault = new misc_utils_1.DRE.ethers.Contract(currentAsset, yvAbi);
                const pricePerUnderlying = await oracle.connect(signer).callStatic.getAssetPrice(yVault.connect(signer).token());
                const pricePerShare = await yVault.connect(signer).pricePerShare();
                //decimals will be the decimals in chainlink aggregator (8 for USD, 18 for ETH)
                expectedPrice = Number(pricePerUnderlying) * Number(pricePerShare.toString()) / Math.pow(10, Number(await yVault.connect(signer).decimals()));
            }
            else if (strat.assetType == 4) { //beefy
                const beefyVault = new misc_utils_1.DRE.ethers.Contract(currentAsset, beefyAbi);
                const pricePerUnderlying = await oracle.connect(signer).callStatic.getAssetPrice(beefyVault.connect(signer).want());
                const pricePerShare = await beefyVault.connect(signer).getPricePerFullShare();
                //decimals will be the decimals in chainlink aggregator (8 for USD, 18 for ETH)
                expectedPrice = Number(pricePerUnderlying) * Number(pricePerShare.toString()) / Math.pow(10, 18);
            }
            else if (strat.assetType == 5) { //velodrome
                const vel = new misc_utils_1.DRE.ethers.Contract(currentAsset, VeloAbi);
                let met = await vel.connect(signer).metadata();
                const dec = await vel.connect(signer).decimals();
                const totalSupply = await vel.connect(signer).totalSupply();
                // console.log("metadata: ", met);
                const price0 = await oracle.connect(signer).callStatic.getAssetPrice(met.t0);
                const price1 = await oracle.connect(signer).callStatic.getAssetPrice(met.t1);
                console.log("price0: ", price0);
                console.log("price1: ", price1);
                const token0 = new misc_utils_1.DRE.ethers.Contract(met.t0, ERC20abi);
                const token1 = new misc_utils_1.DRE.ethers.Contract(met.t1, ERC20abi);
                const factor1 = Math.pow(10, Number(dec)) / Number(met.dec0);
                const factor2 = Math.pow(10, Number(dec)) / Number(met.dec1); //convert to same num decimals as total supply
                const tvl = (Number(met.r0) * factor1 * Number(price0) + Number(met.r1) * factor2 * Number(price1));
                const tvlReadable = tvl / Number(ethers_1.ethers.utils.parseUnits("1", 18 + 8));
                console.log("TVL in USD: ", tvlReadable);
                expect(tvlReadable).gte(1000000); //make sure tvl is greater than 1million
                let naivePrice = Math.round(tvl / Number(totalSupply));
                let percentDiff = Math.abs(Number(naivePrice) - Number(price)) / Number(price);
                console.log("Naive pricing: ", naivePrice);
                console.log("percent diff: ", percentDiff);
                expect(percentDiff).lte(1e-4, "velo token price not consistent with naive pricing (mainly decimals issue)");
                expect((Number(price) - naivePrice) / naivePrice).lte(1e-4, "naive price should always be higher than fair reserves price");
                await token0.connect(signer).approve(VELO_ROUTER_ADDRESS, constants_1.MAX_UINT_AMOUNT);
                await token1.connect(signer).approve(VELO_ROUTER_ADDRESS, constants_1.MAX_UINT_AMOUNT);
                const checkExpectedPrice = async (met) => {
                    console.log('metadata: ', met);
                    const totalSupply = await vel.connect(signer).totalSupply();
                    console.log("totalSupply: ", totalSupply);
                    let expectedPriceLocal = 0;
                    let k = 0;
                    if (met.st == false) {
                        console.log("volatile");
                        const a = Math.sqrt(Number(met.r0) * Number(met.r1) * factor1 * factor2);
                        // console.log("a: ",a)
                        const b = Math.sqrt(Number(price0) * Number(price1));
                        // console.log("b: ",b)
                        // console.log("totalSupply: ", totalSupply)
                        k = Number(met.r0) * Number(met.r1) * factor1 * factor2;
                        expectedPriceLocal = 2 * a * b / Number(totalSupply);
                        const LPvalue = 2 * Math.sqrt(k / 1e36 * testLTVs[met.t0] / testLTVs[met.t1]) * b / 1e8;
                        const holdValue = (Number(met.r0) / Number(met.dec0) * Number(price0) / 1e8 * testLTVs[met.t0] + Number(met.r1) / Number(met.dec1) * Number(price1) / 1e8 / testLTVs[met.t1]);
                        const impermanentLoss = LPvalue / holdValue;
                        console.log("LPvalue: ", LPvalue);
                        console.log("holdValue: ", holdValue);
                        console.log("impermanentLoss: ", impermanentLoss);
                    }
                    else { //stable
                        console.log("stable");
                        let r0 = Number(met[2]) * 1e18 / Number(met[0]);
                        let r1 = Number(met[3]) * 1e18 / Number(met[1]);
                        let p0 = price0;
                        let p1 = price1;
                        k = ((r0 ** 3) * r1) + ((r1 ** 3) * r0);
                        let fair = (k * (p0 ** 3) * (p1 ** 3)) / ((p0 ** 2) + (p1 ** 2));
                        expectedPriceLocal = 2 * Math.pow(fair, 1 / 4) / totalSupply;
                        // console.log("exepected price", price / 1e18); 
                    }
                    console.log("Expected price: ", expectedPriceLocal);
                    console.log("K: ", k / 1e36);
                    // const diff = Math.abs(expectedPriceLocal-Number(price));
                    // const percentDiff = diff/expectedPriceLocal
                    // console.log("percentDiff math: ",percentDiff)
                    // expect(percentDiff).to.be.lte(1e-5) // 8 most significant digits are accurate
                    return [expectedPriceLocal, k];
                };
                let beginningK;
                [expectedPrice, beginningK] = await checkExpectedPrice(met);
                if (!testSwapping)
                    continue;
                var route = [{
                        from: met.t0,
                        to: met.t1,
                        stable: met.st,
                        factory: "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a"
                    }];
                // try swapping. Should not change the price
                const VELO_ROUTER_CONTRACT = new misc_utils_1.DRE.ethers.Contract(VELO_ROUTER_ADDRESS, VELO_ROUTER_ABI);
                console.log("try swapping ", met.t0);
                console.log("_________******____________");
                for (let j = 1; j <= 10; ++j) { //try multiple values
                    let amtSwap = (1000 * 5 ** j);
                    if (price0.lt(ethers_1.ethers.utils.parseUnits("1000", 8))) {
                        amtSwap *= 1000;
                    }
                    if (amtSwap * Number(price0) / 1e8 > 1e9) { //if we are swapping less than a billion of value
                        break;
                    }
                    const amt0 = misc_utils_1.DRE.ethers.utils.parseUnits((amtSwap).toString(), await token0.connect(signer).decimals());
                    console.log("amount to swap: ", amtSwap);
                    await (0, mint_tokens_1.setBalance)(met.t0, signer, amt0);
                    try {
                        await expect(VELO_ROUTER_CONTRACT.connect(signer).swapExactTokensForTokens(amt0, "0", route, signer.address, deadline))
                            .to.be.reverted;
                        break;
                    }
                    catch {
                    }
                    met = await vel.connect(signer).metadata();
                    let currentMathPrice, newK;
                    [currentMathPrice, newK] = await checkExpectedPrice(met);
                    const diffK = Math.abs(Number(newK) - Number(beginningK)) / Number(beginningK);
                    console.log("percent diff in K: ", diffK);
                    const manipPrice = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
                    percentDiff = Math.abs(Number(manipPrice) - Number(price)) / Number(price);
                    console.log("manip price 1: ", manipPrice);
                    console.log("percent diff: ", percentDiff);
                    const diffPrice = Math.abs(Number(currentMathPrice) - Number(manipPrice)) / Number(manipPrice);
                    expect(diffPrice).lte(1e-6, "Make sure rounding on chain isn't too bad during huge swaps");
                    expect(percentDiff).lte(1e-4, "swapping induces velo price change 0");
                    naivePrice = Math.round((Number(met.r0) * factor1 * Number(price0) + Number(met.r1) * factor2 * Number(price1)) / Number(totalSupply));
                    console.log("Naive pricing after big swap: ", naivePrice);
                    expect(Number(price)).lte(naivePrice, "naive price should always be higher than fair reserves price");
                    console.log("_____________________");
                }
                console.log("try swapping ", met.t1);
                route = [{
                        from: met.t1,
                        to: met.t0,
                        stable: met.st,
                        factory: "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a"
                    }];
                console.log("_________******____________");
                for (let j = 1; j <= 10; ++j) { //try multiple values
                    let amtSwap = (1000 * 5 ** j);
                    if (price1.lt(ethers_1.ethers.utils.parseUnits("1000", 8))) {
                        amtSwap *= 1000;
                    }
                    if (amtSwap * Number(price1) / 1e8 > 1e9) { //if we are swapping less than a billion of value
                        break;
                    }
                    let amt1 = misc_utils_1.DRE.ethers.utils.parseUnits(amtSwap.toString(), await token1.connect(signer).decimals());
                    await (0, mint_tokens_1.setBalance)(met.t1, signer, amt1);
                    console.log("amount to swap: ", amtSwap);
                    try {
                        await expect(VELO_ROUTER_CONTRACT.connect(signer).swapExactTokensForTokens(amt1, "0", route, signer.address, deadline)).to.be.reverted;
                        break;
                    }
                    catch {
                    }
                    met = await vel.connect(signer).metadata();
                    let currentMathPrice, newK;
                    [currentMathPrice, newK] = await checkExpectedPrice(met);
                    const diffK = Math.abs(Number(newK) - Number(beginningK)) / Number(beginningK);
                    console.log("percent diff in K: ", diffK);
                    const manipPrice = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
                    percentDiff = Math.abs(Number(manipPrice) - Number(price)) / Number(price);
                    console.log("manip price 2: ", manipPrice, "percent diff: ", percentDiff);
                    // expect(percentDiff).lte(1e-2, "swapping induces velo price change 1 greater than 1%")
                    const diffPrice = Math.abs(Number(currentMathPrice) - Number(manipPrice)) / Number(manipPrice);
                    expect(diffPrice).lte(1e-6, "Make sure rounding on chain isn't too bad during huge swaps");
                    expect(percentDiff).lte(1e-4, "swapping induces velo price change 0");
                    naivePrice = Math.round((Number(met.r0) * factor1 * Number(price0) + Number(met.r1) * factor2 * Number(price1)) / Number(totalSupply));
                    console.log("Naive pricing after big swap: ", naivePrice);
                    expect(Number(price)).lte(naivePrice, "naive price should always be higher than fair reserves price");
                    console.log("_____________________");
                }
                console.log("try adding liquidity");
                for (let j = 1; j <= 5; ++j) { //try multiple values
                    const amt0 = misc_utils_1.DRE.ethers.utils.parseUnits((10 * 2 ** j).toString(), await token0.connect(signer).decimals());
                    const amt1 = misc_utils_1.DRE.ethers.utils.parseUnits((10 * 2 ** j).toString(), await token1.connect(signer).decimals());
                    await (0, mint_tokens_1.setBalance)(met.t0, signer, amt0);
                    await (0, mint_tokens_1.setBalance)(met.t1, signer, amt1);
                    try {
                        await expect(VELO_ROUTER_CONTRACT.connect(signer).addLiquidity(met.t0, met.t1, met.st, amt0, amt1, 0, 0, signer.address, deadline)).to.be.reverted;
                        break;
                    }
                    catch {
                    }
                    const manipPrice = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
                    console.log("adding liquidity: ", manipPrice);
                    percentDiff = Math.abs(Number(manipPrice) - Number(price)) / Number(price);
                    expect(percentDiff).lte(1e-6, "adding liquidity induces velo price change 0");
                }
            }
            else if (strat.assetType == 6) { //beethoven
                const beet = new misc_utils_1.DRE.ethers.Contract(currentAsset, BeethovenAbi);
                const rate = await beet.connect(signer).getRate();
                if (currentAsset == "0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2") {
                    const price0 = await oracle.connect(signer).callStatic.getAssetPrice("0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb");
                    const price1 = await oracle.connect(signer).callStatic.getAssetPrice("0x4200000000000000000000000000000000000006");
                    expectedPrice = 188923679685;
                }
                if (currentAsset == "0x4Fd63966879300caFafBB35D157dC5229278Ed23") {
                    //rETH pool
                    expectedPrice = 190343506319; //should be around the same as wstETH
                }
                if (currentAsset == "0x39965c9dAb5448482Cf7e002F583c812Ceb53046") {
                    expectedPrice = 2363882259;
                }
                if (!testSwapping)
                    continue;
                const bal_pool = new misc_utils_1.DRE.ethers.Contract(currentAsset, BALANCER_POOL_ABI);
                const dec = await bal_pool.connect(signer).decimals();
                const bal_vault = new misc_utils_1.DRE.ethers.Contract(BALANCER_VAULT_ADDRESS, BALANCER_VAULT_ABI);
                const poolId = await bal_pool.connect(signer).getPoolId();
                let dat = await bal_vault.connect(signer).getPoolTokens(poolId);
                let naivePrice = 0;
                for (let i = 0; i < dat.tokens.length; ++i) {
                    const tokenAdd = dat.tokens[i];
                    const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAdd);
                    const token = new misc_utils_1.DRE.ethers.Contract(tokenAdd, ERC20abi);
                    const factor = Math.pow(10, Number(dec) - Number(await token.connect(signer).decimals()));
                    naivePrice += factor * Number(tokenPrice) * Number(dat.balances[i]);
                }
                naivePrice = Math.round(naivePrice / await bal_pool.connect(signer).totalSupply());
                let percentDiff = Math.abs(Number(naivePrice) - Number(price)) / Number(price);
                console.log("Naive pricing: ", naivePrice);
                console.log("percent diff: ", percentDiff);
                expect(percentDiff).lte(1e-2, "velo token price not consistent with naive pricing (mainly decimals issue)");
                expect((Number(price) - naivePrice) / naivePrice).lte(1e-4, "naive price should always be higher than fair reserves price");
                //give funds to user
                for (let i = 0; i < dat.tokens.length; ++i) {
                    const tokenAdd = dat.tokens[i];
                    const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAdd);
                    const token = new misc_utils_1.DRE.ethers.Contract(tokenAdd, ERC20abi);
                    await token.connect(signer).approve(BALANCER_VAULT_ADDRESS, constants_1.MAX_UINT_AMOUNT);
                    for (let j = 1; j <= 100; ++j) { //try multiple values
                        let amt;
                        if (tokenPrice.gte(ethers_1.ethers.utils.parseUnits("1000", 8))) {
                            amt = misc_utils_1.DRE.ethers.utils.parseUnits((2 ** j).toString(), await token.connect(signer).decimals());
                        }
                        else {
                            amt = misc_utils_1.DRE.ethers.utils.parseUnits((2 ** (j + 10)).toString(), await token.connect(signer).decimals());
                        }
                        await (0, mint_tokens_1.setBalance)(tokenAdd, signer, amt);
                        const singleSwap = {
                            poolId: poolId,
                            kind: 0,
                            assetIn: tokenAdd,
                            assetOut: dat.tokens[(i + 1) % dat.tokens.length],
                            amount: amt,
                            userData: []
                        };
                        const funds = {
                            sender: signer.address,
                            fromInternalBalance: true,
                            recipient: signer.address,
                            toInternalBalance: true
                        };
                        console.log("Try beethoven swapping ", amt);
                        let successfulSwap = true;
                        try {
                            await expect(bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)).to.be.reverted;
                            console.log("too much to swap, exiting");
                            successfulSwap = false;
                        }
                        catch {
                            // await bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)
                        }
                        try {
                            await expect(oracle.connect(signer).callStatic.getAssetPrice(currentAsset)).to.be.reverted;
                            console.log("too much to swap, exiting");
                            successfulSwap = false;
                        }
                        catch {
                            // await bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)
                        }
                        console.log("successfulSwap: ", successfulSwap);
                        if (!successfulSwap)
                            break;
                        // await bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)
                        const manipPrice = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
                        let percentDiffPrice = Math.abs(Number(manipPrice) - Number(price)) / Number(price);
                        console.log(`manip price swapping in ${tokenAdd}: `, manipPrice);
                        dat = await bal_vault.connect(signer).getPoolTokens(poolId);
                        naivePrice = 0;
                        for (let i = 0; i < dat.tokens.length; ++i) {
                            const tokenAdd = dat.tokens[i];
                            const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAdd);
                            const token = new misc_utils_1.DRE.ethers.Contract(tokenAdd, ERC20abi);
                            const factor = Math.pow(10, Number(dec) - Number(await token.connect(signer).decimals()));
                            naivePrice += factor * Number(tokenPrice) * Number(dat.balances[i]);
                        }
                        naivePrice = Math.round(naivePrice / await bal_pool.connect(signer).totalSupply());
                        let percentDiff = Math.abs(Number(naivePrice) - Number(price)) / Number(price);
                        console.log("Naive pricing after swap: ", naivePrice);
                        // expect(percentDiffPrice).lte(1e-4, "swapping induces beethoven price change")
                        expect((Number(price) - naivePrice) / naivePrice).lte(0, "naive price should always be higher than fair reserves price");
                    }
                }
                //swap
            }
            else if (strat.assetType == 7) { //rETH
                expectedPrice = 202185432577;
            }
            else {
                continue;
            }
            console.log("Expected price: ", expectedPrice);
            const diff = Math.abs(expectedPrice - Number(price));
            const percentDiff = diff / expectedPrice;
            console.log("percentDiff: ", percentDiff);
            expect(percentDiff).to.be.lte(1 / 1e8); // 8 most significant digits are accurate
            console.log("_____________________");
            console.log("*********************");
            console.log("_____________________");
        }
    });
});
//# sourceMappingURL=test-oracle.spec.js.map