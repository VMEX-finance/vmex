const { expect } = require('chai');

import { makeSuite, TestEnv } from '../helpers/make-suite';
import { deployIncentivesController, setupVmexIncentives } from '../../../helpers/contracts-deployments';
import { RANDOM_ADDRESSES } from '../../../helpers/constants';

makeSuite('AaveIncentivesController constructor tests', (testEnv: TestEnv) => {
  it('should assign correct params', async () => {
    const { addressesProvider } = testEnv;

    const rewardsVault = RANDOM_ADDRESSES[4];

    const aaveIncentivesController = await setupVmexIncentives(rewardsVault);

    await expect(await aaveIncentivesController.REWARDS_VAULT()).to.be.equal(rewardsVault);
  });
});
