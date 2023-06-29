import AaveConfig from "../../markets/aave";
import { ICommonConfiguration, eNetwork, SymbolMap, eEthereumNetwork, iEthereumParamsPerNetwork, ITokenAddressTarget } from "../../helpers/types";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";

import {
  getUniswapAddress,
} from "../../helpers/get-uniswap-data";
import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import { string } from "hardhat/internal/core/params/argumentTypes";
import { ethers } from "ethers";
import { ZERO_ADDRESS } from "../../helpers/constants";

task('get-velo-gauge', 'Gets uniswap data')
.addFlag("verify", "Verify contracts at Etherscan")
.addFlag(
  "skipRegistry",
  "Skip addresses provider registration at Addresses Provider Registry"
)
.setAction(async ({ verify, skipRegistry }, DRE) => {
  const fs = require('fs');
  const sugar_abi = fs.readFileSync("./tasks/helpers/sugar_abi.json").toString()
    try{
      const sugar = new ethers.Contract("0x8b70c5e53235abbd1415957f7110fbfe5d0529d4",sugar_abi);
      const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

      const dat = await sugar.connect(provider).byAddress("0xAdF902b11e4ad36B227B84d856B229258b0b0465", ZERO_ADDRESS)
      console.log(dat)
    }
    catch(err){
      console.error(err)
    }
  });






