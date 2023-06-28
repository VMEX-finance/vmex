import { expect } from 'chai';
import { makeSuite, TestEnv } from './helpers/make-suite';
import { ProtocolErrors, eContractid } from '../../helpers/types';
import { convertToCurrencyDecimals, deployContract, getContract } from '../../helpers/contracts-helpers';
import { MockAToken } from '../../types/MockAToken';
import { MockVariableDebtToken } from '../../types/MockVariableDebtToken';
import { AAVE_REFERRAL, APPROVAL_AMOUNT_LENDING_POOL, ZERO_ADDRESS } from '../../helpers/constants';
import {
  getAToken,
  getEmergencyAdminT0,
  getMockAToken,
  getMockIncentivesControllerImpl,
  getMockStableDebtToken,
  getMockVariableDebtToken,
  getStableDebtToken,
  getVariableDebtToken,
} from '../../helpers/contracts-getters';
import {
  deployMockAToken,
  deployMockVariableDebtToken,
  deployMockIncentivesController,
} from '../../helpers/contracts-deployments';
import { BigNumberish, ethers } from 'ethers';
import BigNumber from 'bignumber.js';

makeSuite('Upgradeability', (testEnv: TestEnv) => {
  const { CALLER_NOT_GLOBAL_ADMIN } = ProtocolErrors;
  const stakingAbi = require("../../artifacts/contracts/mocks/StakingRewardsMock.sol/StakingRewardsMock.json")
  let newATokenAddress: string;
  // let newStableTokenAddress: string;
  let newVariableTokenAddress: string;

  const tranche = 0;

  before('deploying instances', async () => {
    const { dai, pool, configurator, addressesProvider, assetMappings, yvTricrypto2, incentivesController } = testEnv;
    const aTokenInstance = await deployMockAToken([
      pool.address,
      configurator.address,
      addressesProvider.address,
      dai.address,
      tranche.toString(),
    ]);

    const variableDebtTokenInstance = await deployMockVariableDebtToken([
      pool.address,
      dai.address,
      addressesProvider.address,
    ]);

    const incentivesInstance = await deployMockIncentivesController();

    newATokenAddress = aTokenInstance.address;
    newVariableTokenAddress = variableDebtTokenInstance.address;
  });

  it('Tries to update the DAI Atoken implementation with a different address than the lendingPoolManager', async () => {
    const { dai, aTokenBeacon, users } = testEnv;
    await expect(
      aTokenBeacon.connect(users[1].signer).upgradeTo(newATokenAddress)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Upgrades the DAI Atoken beacon implementation ', async () => {
    const { dai, aTokenBeacon, helpersContract } = testEnv;

    await aTokenBeacon.upgradeTo(newATokenAddress);

    const { aTokenAddress } = await helpersContract.getReserveTokensAddresses(
      dai.address, tranche
    );

    const aDai = await getMockAToken(aTokenAddress);

    const newf = await aDai.newFunction();

    expect(newf.toString()).to.be.eq('2', 'Invalid new function');

    const { aTokenAddress: aTokenAddress1 } = await helpersContract.getReserveTokensAddresses(
      dai.address, 1
    );

    const aDai1 = await getMockAToken(aTokenAddress1);

    expect((await aDai1.newFunction()).toString()).to.be.eq('2', 'Invalid new function for other atokens');
  });

  it('Tries to update the DAI variable debt token implementation with a different address than the lendingPoolManager', async () => {
    const {dai, varDebtBeacon, users} = testEnv;

    await expect(
      varDebtBeacon
        .connect(users[1].signer)
        .upgradeTo(newVariableTokenAddress)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Upgrades the DAI variable debt token beacon implementation ', async () => {
    const {dai, varDebtBeacon, pool, helpersContract} = testEnv;

    await varDebtBeacon.upgradeTo(newVariableTokenAddress);

    const { variableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(
      dai.address, tranche
    );

    const debtToken = await getMockVariableDebtToken(variableDebtTokenAddress);

    const newf = await debtToken.newFunction();

    expect(newf.toString()).to.be.eq('2', 'Invalid newf');

    const { variableDebtTokenAddress: variableDebtTokenAddress1 } = await helpersContract.getReserveTokensAddresses(
      dai.address, 1
    );

    const debtToken1 = await getMockVariableDebtToken(variableDebtTokenAddress1);

    expect((await debtToken1.newFunction()).toString()).to.be.eq('2', 'Invalid newf for other variable debt tokens');
  });


  //'Test that protocol still works after upgrades'


  it("User 0 deposits 1000 DAI and 2000 aave", async () => {
    const { users, pool, dai, aave, aAave, aDai } = testEnv;

    await dai
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "1000"));

    await dai
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountDAItoDeposit = await convertToCurrencyDecimals(
      dai.address,
      "1000"
    );

    await pool
      .connect(users[0].signer)
      .deposit(dai.address, 0, amountDAItoDeposit, users[0].address, "0");

      await aave
      .connect(users[0].signer)
      .mint(ethers.utils.parseEther("2000"));

    await aave
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountUSDCtoDeposit = ethers.utils.parseEther("2000");

    await pool
      .connect(users[0].signer)
      .deposit(aave.address, 0, amountUSDCtoDeposit, users[0].address, "0");

    const balanceDAI = await aDai.balanceOf(users[0].address);
    const balanceUSDC = await aAave.balanceOf(users[0].address);

    expect(balanceDAI.toString()).to.be.equal(
      amountDAItoDeposit.toString(),
      "invalid balance"
    );

    expect(balanceUSDC.toString()).to.be.equal(
      amountUSDCtoDeposit.toString(),
      "invalid balance"
    );
  });

  it("User 1 deposits 100 WETH and usdc and user 0 tries to borrow the WETH and usdc", async () => {
    const { users, pool, weth, usdc, helpersContract } = testEnv;

    await weth
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(weth.address, "1000"));

    await weth
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await weth
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(weth.address, "1000"));

    await weth
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(users[1].signer)
      .deposit(
        weth.address,
        0,
        ethers.utils.parseEther("100.0"),
        users[1].address,
        "0"
      );


    await usdc
    .connect(users[0].signer)
    .mint(await convertToCurrencyDecimals(usdc.address, "1000000"));

    await usdc
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await usdc
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(usdc.address, "10000"));

    await usdc
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(users[1].signer)
      .deposit(
        usdc.address,
        0,
        await convertToCurrencyDecimals(usdc.address, "10000"),
        users[1].address,
        "0"
      );
    await pool
      .connect(users[0].signer)
      .borrow(
        weth.address,
        0,
        ethers.utils.parseEther("0.1"),
        AAVE_REFERRAL,
        users[0].address
      );

    const userReserveData = await helpersContract.getUserReserveData(
      weth.address,
      0,
      users[0].address
    );

    expect(userReserveData.currentVariableDebt.toString()).to.be.eq(
      ethers.utils.parseEther("0.1")
    );

    await pool
      .connect(users[0].signer)
      .borrow(
        usdc.address,
        0,
        await convertToCurrencyDecimals(usdc.address, "10"),
        AAVE_REFERRAL,
        users[0].address
      );

  });
});
