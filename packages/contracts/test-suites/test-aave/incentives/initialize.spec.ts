import { makeSuite, TestEnv } from '../helpers/make-suite';

const { expect } = require('chai');

makeSuite('AaveIncentivesController initialize', (testEnv: TestEnv) => {
  it('Tries to call initialize second time, should be reverted', async () => {
    const { incentivesController } = testEnv;
    await expect(incentivesController.initialize()).to.be.reverted;
  });
});
