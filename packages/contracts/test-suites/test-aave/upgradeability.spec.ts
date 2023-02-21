import { expect } from 'chai';
import { makeSuite, TestEnv } from './helpers/make-suite';
import { ProtocolErrors, eContractid } from '../../helpers/types';
import { deployContract, getContract } from '../../helpers/contracts-helpers';
import { MockAToken } from '../../types/MockAToken';
import { MockStableDebtToken } from '../../types/MockStableDebtToken';
import { MockVariableDebtToken } from '../../types/MockVariableDebtToken';
import { ZERO_ADDRESS } from '../../helpers/constants';
import {
  getAToken,
  getEmergencyAdminT0,
  getMockAToken,
  getMockStableDebtToken,
  getMockVariableDebtToken,
  getStableDebtToken,
  getVariableDebtToken,
} from '../../helpers/contracts-getters';
import {
  deployMockAToken,
  deployMockStableDebtToken,
  deployMockVariableDebtToken,
} from '../../helpers/contracts-deployments';
import { BigNumberish } from 'ethers';

makeSuite('Upgradeability', (testEnv: TestEnv) => {
  const { CALLER_NOT_GLOBAL_ADMIN } = ProtocolErrors;
  let newATokenAddress: string;
  // let newStableTokenAddress: string;
  let newVariableTokenAddress: string;

  const tranche = 0;

  before('deploying instances', async () => {
    const { dai, pool, configurator, addressesProvider } = testEnv;
    const aTokenInstance = await deployMockAToken([
      pool.address,
      configurator.address,
      addressesProvider.address,
      dai.address,
      tranche.toString(),
    ]);

    // const stableDebtTokenInstance = await deployMockStableDebtToken([
    //   pool.address,
    //   dai.address,
    //   ZERO_ADDRESS,
    //   'Aave stable debt bearing DAI updated',
    //   'stableDebtDAI'
    // ]);

    const variableDebtTokenInstance = await deployMockVariableDebtToken([
      pool.address,
      dai.address,
      addressesProvider.address,
    ]);

    newATokenAddress = aTokenInstance.address;
    newVariableTokenAddress = variableDebtTokenInstance.address;
    // newStableTokenAddress = stableDebtTokenInstance.address;
  });

  it('Tries to update the DAI Atoken implementation with a different address than the lendingPoolManager', async () => {
    const { dai, configurator, users } = testEnv;

    const updateATokenInputParams: {
      asset: string;
      trancheId: BigNumberish;
      implementation: string;
    } = {
      asset: dai.address,
      trancheId: tranche,
      implementation: newATokenAddress,
    };
    await expect(
      configurator.connect(users[1].signer).updateAToken(updateATokenInputParams)
    ).to.be.revertedWith(CALLER_NOT_GLOBAL_ADMIN);
  });

  it('Upgrades the DAI Atoken implementation ', async () => {
    const { dai, configurator, helpersContract } = testEnv;

    const updateATokenInputParams: {
      asset: string;
      trancheId: BigNumberish;
      implementation: string;
    } = {
      asset: dai.address,
      trancheId: tranche,
      implementation: newATokenAddress,
    };
    await configurator.updateAToken(updateATokenInputParams);

    const { aTokenAddress } = await helpersContract.getReserveTokensAddresses(
      dai.address, tranche
    );

    const aDai = await getMockAToken(aTokenAddress);

    const revision = await aDai.newFunction();

    expect(revision.toString()).to.be.eq('2', 'Invalid revision');
  });

  it('Tries to update the DAI variable debt token implementation with a different address than the lendingPoolManager', async () => {
    const {dai, configurator, users} = testEnv;

    const updateDebtTokenInput: {
      asset: string;
      trancheId: BigNumberish;
      implementation: string;
      params: string;
    } = {
      asset: dai.address,
      trancheId: tranche,
      implementation: newVariableTokenAddress,
      params: '0x10'
    }

    await expect(
      configurator
        .connect(users[1].signer)
        .updateVariableDebtToken(updateDebtTokenInput)
    ).to.be.revertedWith(CALLER_NOT_GLOBAL_ADMIN);
  });

  it('Upgrades the DAI variable debt token implementation ', async () => {
    const {dai, configurator, pool, helpersContract} = testEnv;

    const updateDebtTokenInput: {
      asset: string;
      trancheId: BigNumberish;
      implementation: string;
      params: string;
    } = {
      asset: dai.address,
      trancheId: tranche,
      implementation: newVariableTokenAddress,
      params: '0x10'
    }
    //const name = await (await getAToken(newATokenAddress)).name();

    await configurator.updateVariableDebtToken(updateDebtTokenInput);

    const { variableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(
      dai.address, tranche
    );

    const debtToken = await getMockVariableDebtToken(variableDebtTokenAddress);

    const revision = await debtToken.newFunction();

    expect(revision.toString()).to.be.eq('2', 'Invalid revision');
  });
});
