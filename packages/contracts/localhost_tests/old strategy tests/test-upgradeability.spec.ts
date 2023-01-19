const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../../helpers/misc-utils";
import rawBRE from "hardhat";
import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../../helpers/types';
import {getCurvePrice} from "../helpers/curve-calculation";
import {UserAccountData} from "../interfaces/index";
import {
  getAToken,
  getEmergencyAdminT0,
  getLendingPoolConfiguratorProxy,
  getMockStableDebtToken,
  getMockVariableDebtToken,
  getStableDebtToken,
  getVariableDebtToken,
} from '../../helpers/contracts-getters';
import {
  deployMockStrategy,
  deployMockAToken,
} from '../../helpers/contracts-deployments';
import { BigNumberish } from 'ethers';
import {ZERO_ADDRESS} from '../../helpers/constants';

makeSuite('Upgradeability', () => {
  const { CALLER_NOT_GLOBAL_ADMIN } = ProtocolErrors;
  let newStrategyAddress: string;
  let newATokenAddress: string;

  const DAIadd = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  // const DAI_ABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()

  const tranche = 1;
  const contractGetters = require('../helpers/contracts-getters.ts');
  const triCryptoDepositAdd = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff" //0xD51a44d3FaE010294C616388b506AcdA1bfAAE46 this is the address given on curve.fi/contracts

  it('deploying mock strategy instances', async () => {
    const pool = await contractGetters.getLendingPool();
    const addressProvider = await contractGetters.getLendingPoolAddressesProvider();
    const configurator = await getLendingPoolConfiguratorProxy();

    const strategyInstance = await deployMockStrategy([
      addressProvider.address,
      triCryptoDepositAdd,
      tranche.toString()
    ]);

    const aTokenInstance = await deployMockAToken([
      pool.address,
      configurator.address,
      DAIadd,
      tranche.toString(),
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      "1000",
      ZERO_ADDRESS,
      'Aave Interest bearing DAI updated',
      'aDAI'
    ]);

    console.log(strategyInstance);

    console.log("mock Strategy revision: ",await strategyInstance.baseStrategyVersion())
    console.log("mock Strategy name: ",await strategyInstance.getName())

    newStrategyAddress = strategyInstance.address;
    newATokenAddress = aTokenInstance.address;
  });

  it('Tries to update the tricrypto strategy implementation with a different address than the lendingPoolManager', async () => {
    const emergencyAdminT0 = await getEmergencyAdminT0();
    const configurator = await getLendingPoolConfiguratorProxy();


    const updateStrategyParams: {
      asset: string;
      trancheId: BigNumberish;
      implementation: string;
      strategyAddress: string;
    } = {
      asset: triCryptoDepositAdd,
      trancheId: tranche,
      implementation: newStrategyAddress,
      strategyAddress: ZERO_ADDRESS,
    };


    await expect(
      configurator.connect((await DRE.ethers.getSigners())[1]).updateStrategy(updateStrategyParams)
    ).to.be.revertedWith(CALLER_NOT_GLOBAL_ADMIN);
  });

  it('Upgrades the tricrypto strategy implementation ', async () => {
    const configurator = await getLendingPoolConfiguratorProxy();

    const lendingPool = await contractGetters.getLendingPool();

          const tricrypto2Tranch1ATokenAddress =
            (await lendingPool.getReserveData(triCryptoDepositAdd, 1)).aTokenAddress;
          // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

          const tricrypto2Tranch1AToken =
            await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

          const strategy = await contractGetters.getCrvLpStrategy(await tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy

    // const existingStrat = await contractGetters.getCrvLpStrategy();
    // newStrategyAddress = existingStrat.address;
    const updateStrategyParams: {
      asset: string;
      trancheId: BigNumberish;
      implementation: string;
      strategyAddress: string;
    } = {
      asset: triCryptoDepositAdd,
      trancheId: tranche,
      implementation: newStrategyAddress,
      strategyAddress: strategy.address,
    };

    console.log("params: ", updateStrategyParams);


    await configurator.updateStrategy(updateStrategyParams);
const revision = await strategy.baseStrategyVersion();
    console.log("revision: ",revision)
    expect(revision.toString()).to.be.eq("2.0", 'Invalid revision');
  });
});
