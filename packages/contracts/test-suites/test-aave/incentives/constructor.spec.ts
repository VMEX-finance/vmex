const { expect } = require('chai');

import { makeSuite } from '../helpers/make-suite';
import { deployIncentivesController } from '../../../helpers/contracts-deployments';
import { RANDOM_ADDRESSES } from '../../../helpers/constants';

makeSuite('AaveIncentivesController constructor tests', () => {
  it('should assign correct params', async () => {
    const peiEmissionManager = RANDOM_ADDRESSES[1];
    const rewardsVault = RANDOM_ADDRESSES[4];

    const aaveIncentivesController = await deployIncentivesController([
      rewardsVault,
      peiEmissionManager,
      peiEmissionManager
    ]);
    await expect(await aaveIncentivesController.REWARDS_VAULT()).to.be.equal(rewardsVault);
    await expect((await aaveIncentivesController.EMISSION_MANAGER()).toString()).to.be.equal(
      peiEmissionManager
    );
  });
});
