const { expect } = require('chai');

import { makeSuite, TestEnv } from '../helpers/make-suite';
import { deployIncentivesController } from '../../../helpers/contracts-deployments';
import { RANDOM_ADDRESSES } from '../../../helpers/constants';

makeSuite('AaveIncentivesController constructor tests', (testEnv: TestEnv) => {
  it('should assign correct params', async () => {
    const { addressesProvider } = testEnv;

    const peiEmissionManager = RANDOM_ADDRESSES[1];
    const rewardsVault = RANDOM_ADDRESSES[4];

    const aaveIncentivesController = await deployIncentivesController();
    await expect(await aaveIncentivesController.REWARDS_VAULT()).to.be.equal(rewardsVault);
    await expect((await aaveIncentivesController.EMISSION_MANAGER()).toString()).to.be.equal(
      peiEmissionManager
    );
  });
});
