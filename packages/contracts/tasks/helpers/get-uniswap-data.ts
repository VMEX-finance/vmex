import AaveConfig from "../../../src/markets/aave";
import { ICommonConfiguration, eNetwork, SymbolMap, eEthereumNetwork, iEthereumParamsPerNetwork, ITokenAddressTarget } from "../../helpers/types";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";

import {
  getUniswapAddress,
} from "../../helpers/get-uniswap-data";
import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import { string } from "hardhat/internal/core/params/argumentTypes";

task('get-uniswap-data', 'Gets uniswap data')
.addFlag("verify", "Verify contracts at Etherscan")
.addFlag(
  "skipRegistry",
  "Skip addresses provider registration at Addresses Provider Registry"
)
.setAction(async ({ verify, skipRegistry }, DRE) => {
    try{
      const pool = ConfigNames.Aave;
      await DRE.run("set-DRE");
      const network = <eNetwork>DRE.network.name;
      // console.log("network: ",network)
      const poolConfig = loadPoolConfig(pool);
      const {
        ProtocolGlobalParams: { UsdAddress },
        ReserveAssets,
        FallbackOracle,
        ChainlinkAggregator,
      } = poolConfig as ICommonConfiguration;
      // console.log("ReserveAssets: ",ReserveAssets)
      // const fallbackOracleAddress = await getParamPerNetwork(
      //   FallbackOracle,
      //   network
      // );
      const {main} = ReserveAssets as iEthereumParamsPerNetwork<SymbolMap<string>>;//await getParamPerNetwork(ReserveAssets, network);
      const reserveAssets = main;
      
      // console.log("reserveAssets: ",reserveAssets)

      

      const uniswapPools = await Promise.all(Object.entries(reserveAssets).map(
        ([tokenSymbol, tokenAddress]) => getUniswapAddress(tokenAddress, tokenSymbol))
        )
      // if (notFalsyOrZeroAddress(fallbackOracleAddress)) {
      //   uniswapOracle = await getAaveOracle(fallbackOracleAddress);
      //   await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
      // } else {
        const uniswapAddresses = uniswapPools.map((el) => el.poolAddress);
        const uniswapTokenToPrice = uniswapPools.map((el) => el.tokenToPrice);
        console.log("uniswapAddresses: ",uniswapAddresses)
        console.log("uniswapTokenToPrice: ",uniswapTokenToPrice)
        let myUniswapAddr: SymbolMap<string> = {};//new Map<string, AddressTarget>;
        let myUniswapTarget: SymbolMap<string> = {};//new Map<string, AddressTarget>;
        let i = 0;
      for(let [tokenSymbol, tokenAddress] of Object.entries(reserveAssets)) {
        myUniswapAddr[tokenSymbol] = uniswapAddresses[i];
        myUniswapTarget[tokenSymbol] = uniswapTokenToPrice[i];
        i+=1;

      }
      console.log(myUniswapAddr)
      console.log(myUniswapTarget)
    }
    catch(err){
      console.error(err)
    }
  });






