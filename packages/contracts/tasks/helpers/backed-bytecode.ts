import { task } from 'hardhat/config';
import { ConfigNames } from '../../helpers/configuration';
import {BaseConfig} from '../../markets/base/index'
import { getAssetMappings, getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy, getVMEXOracle } from '../../helpers/contracts-getters';
import { IChainlinkInternal, eNetwork, tEthereumAddress } from '../../helpers/types';
import * as fs from 'fs';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { BigNumberish, ethers } from 'ethers';

task('vmex:backed-bytecode', 'Set asset sources for base backed oracles, then add to assetmappings and create new tranche')
  .setAction(async ({ }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    
    const addressesProvider = await getLendingPoolAddressesProvider();

    const oracle = await getVMEXOracle(await addressesProvider.getPriceOracle());
    const assetMappings = await getAssetMappings(await addressesProvider.getAssetMappings())
    const lendingPoolconfigurator = await getLendingPoolConfiguratorProxy();
    const backedTokens: string[] = ["0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5", "0x52d134c6DB5889FaD3542A09eAf7Aa90C0fdf9E4"]
    const tokenAddresses = getParamPerNetwork(BaseConfig.ReserveAssets, "base" as eNetwork)
    const reservesParams = BaseConfig.ReservesConfig
    const reserves = Object.entries(reservesParams)

    const agg = getParamPerNetwork(BaseConfig.ChainlinkAggregator, "base" as eNetwork)
    if(agg == undefined || tokenAddresses == undefined) throw "stuff is undefined"

    const backedAggregators: { feed: string; heartbeat: BigNumberish }[] = [agg["bIB01"] as IChainlinkInternal, agg["bIBTA"] as IChainlinkInternal]
    // set chainlink oracle for backed
    let dat = oracle.interface.encodeFunctionData("setAssetSources", [backedTokens, backedAggregators, false])
    console.log("setting chainlink oracle: ", dat)
    fs.writeFileSync('tasks/helpers/encodedFunctionCalls/setBackedChainlink.txt', dat, { flag: 'w' });

    // add backed to asset mappings
    let initInputParams: {
      asset: string;
      defaultInterestRateStrategyAddress: string;
      supplyCap: BigNumberish; //1,000,000
      borrowCap: BigNumberish; //1,000,000
      baseLTV: BigNumberish;
      liquidationThreshold: BigNumberish;
      liquidationBonus: BigNumberish;
      borrowFactor: BigNumberish;
      borrowingEnabled: boolean;
      assetType: BigNumberish;
      VMEXReserveFactor: BigNumberish;
      tokenSymbol: string;
    }[] = [];

    
    for (let [symbol, params] of reserves) {
      if(!symbol.startsWith("bIB")) continue //only process backed tokens
      if (!tokenAddresses[symbol]) {
        console.log(
          `- Skipping init of ${symbol} due token address is not set at markets config`
        );
        continue;
      }
      console.log("processing ",symbol)
      const {
        strategy,
        assetType,
        supplyCap, //1,000,000
        borrowCap,
        reserveDecimals,
        baseLTVAsCollateral,
        borrowFactor,
        liquidationBonus,
        liquidationThreshold,
        borrowingEnabled,
        reserveFactor,
      } = params;

      const input = {
        asset: tokenAddresses[symbol],
        defaultInterestRateStrategyAddress: "0x7671B8296722a9609152cc35AB15FB2d2e4D13B9", //unborrowable
        assetType: assetType,
        supplyCap: ethers.utils.parseUnits(supplyCap, reserveDecimals), 
        borrowCap: ethers.utils.parseUnits(borrowCap, reserveDecimals), 
        baseLTV: baseLTVAsCollateral,
        liquidationThreshold: liquidationThreshold,
        liquidationBonus: liquidationBonus,
        borrowFactor: borrowFactor,
        borrowingEnabled: borrowingEnabled,
        VMEXReserveFactor: reserveFactor,
        tokenSymbol: symbol
      }
      initInputParams.push(input);
    }

    dat = assetMappings.interface.encodeFunctionData("addAssetMapping", [initInputParams])
    console.log("add to asset mappings: ", dat)
    fs.writeFileSync('tasks/helpers/encodedFunctionCalls/addAssetMappingBacked.txt', dat, { flag: 'w' });


    // adding backed to tranche 1
    let initTrancheInputParams: {
      underlyingAsset: string;
      reserveFactor: string;
      canBorrow: boolean;
      canBeCollateral: boolean;
    }[] = [];

    let configureCollateralParamsInput:{
      underlyingAsset: string;
      collateralParams: {
        baseLTV: BigNumberish;
        liquidationThreshold: BigNumberish;
        liquidationBonus: BigNumberish;
        borrowFactor: BigNumberish;
      };
    }[] = []

    for (let [symbol, params] of reserves) {
      if(!symbol.startsWith("bIB")) continue //only process backed tokens
      configureCollateralParamsInput.push({
        underlyingAsset: tokenAddresses[symbol],
        collateralParams: {
          baseLTV: ethers.utils.parseUnits('0.8',18).toString(),
          liquidationThreshold: params.liquidationThreshold,
          liquidationBonus: params.liquidationBonus,
          borrowFactor: params.borrowFactor
        }
      })
      initTrancheInputParams.push(
        {
          underlyingAsset: tokenAddresses[symbol],
          reserveFactor: "0",
          canBorrow: false,
          canBeCollateral: true,
        }
      );
    }

    dat = lendingPoolconfigurator.interface.encodeFunctionData("batchInitReserve", [initTrancheInputParams, "1"])
    console.log("add backed to tranche 1: ", dat)
    fs.writeFileSync('tasks/helpers/encodedFunctionCalls/initBackedReserve.txt', dat, { flag: 'w' });

    dat = lendingPoolconfigurator.interface.encodeFunctionData("batchConfigureCollateralParams", [configureCollateralParamsInput, "1"])
    console.log("configure collateral params for tranche 1: ", dat)
    fs.writeFileSync('tasks/helpers/encodedFunctionCalls/configureBackedVerifiedParams.txt', dat, { flag: 'w' });
  });
