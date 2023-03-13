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
    const { dai, aTokenBeacon, users } = testEnv;
    await expect(
      aTokenBeacon.connect(users[1].signer).upgradeTo(newATokenAddress)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Upgrades the DAI Atoken implementation ', async () => {
    const { dai, aTokenBeacon, helpersContract } = testEnv;

    await aTokenBeacon.upgradeTo(newATokenAddress);

    const { aTokenAddress } = await helpersContract.getReserveTokensAddresses(
      dai.address, tranche
    );

    const aDai = await getMockAToken(aTokenAddress);

    const revision = await aDai.newFunction();

    expect(revision.toString()).to.be.eq('2', 'Invalid revision');

    const { aTokenAddress: aTokenAddress1 } = await helpersContract.getReserveTokensAddresses(
      dai.address, 1
    );

    const aDai1 = await getMockAToken(aTokenAddress1);

    expect((await aDai1.newFunction()).toString()).to.be.eq('2', 'Invalid revision for other atokens');
  });

  it('Tries to update the DAI variable debt token implementation with a different address than the lendingPoolManager', async () => {
    const {dai, varDebtBeacon, users} = testEnv;

    await expect(
      varDebtBeacon
        .connect(users[1].signer)
        .upgradeTo(newVariableTokenAddress)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Upgrades the DAI variable debt token implementation ', async () => {
    const {dai, varDebtBeacon, pool, helpersContract} = testEnv;

    await varDebtBeacon.upgradeTo(newVariableTokenAddress);

    const { variableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(
      dai.address, tranche
    );

    const debtToken = await getMockVariableDebtToken(variableDebtTokenAddress);

    const revision = await debtToken.newFunction();

    expect(revision.toString()).to.be.eq('2', 'Invalid revision');

    const { variableDebtTokenAddress: variableDebtTokenAddress1 } = await helpersContract.getReserveTokensAddresses(
      dai.address, 1
    );

    const debtToken1 = await getMockAToken(variableDebtTokenAddress1);

    expect((await debtToken1.newFunction()).toString()).to.be.eq('2', 'Invalid revision for other variable debt tokens');
  });
});
