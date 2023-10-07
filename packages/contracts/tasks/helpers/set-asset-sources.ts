import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import {BaseConfig} from '../../markets/base/index'
import { getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy, getVMEXOracle, getVMEXOracle } from '../../helpers/contracts-getters';
import { eContractid, eNetwork } from '../../helpers/types';
import * as fs from 'fs';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';

task('vmex:set-asset-sources', 'Set asset sources for base backed oracles')
  .setAction(async ({ }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    
    const addressesProvider = await getLendingPoolAddressesProvider();

    const oracle = await getVMEXOracle(await addressesProvider.getPriceOracle());
    const backedTokens = ["0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5", "0x52d134c6DB5889FaD3542A09eAf7Aa90C0fdf9E4"]

    const agg = getParamPerNetwork(BaseConfig.ChainlinkAggregator, "base" as eNetwork)
    if(agg == undefined) throw "aggregatoers undefined"

    const dat = oracle.interface.encodeFunctionData("setAssetSources", [backedTokens, [agg["bIB01"], agg["bIBTA"]], false])
    console.log("dat: ", dat)
    fs.writeFileSync('tasks/helpers/encodedFunctionCalls/setBackedChainlink.txt', dat, { flag: 'wx' });
  });
