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

makeSuite('Upgradeability Incentives', (testEnv: TestEnv) => {
  const { CALLER_NOT_GLOBAL_ADMIN } = ProtocolErrors;
  const stakingAbi = require("../../artifacts/contracts/mocks/StakingRewardsMock.sol/StakingRewardsMock.json")
  let newIncentivesControllerAddress: string;

  const tranche = 1;

  before('deploying instances', async () => {
    const { dai, pool, configurator, addressesProvider, assetMappings, yvTricrypto2, incentivesController } = testEnv;
    

    const incentivesInstance = await deployMockIncentivesController();
    newIncentivesControllerAddress = incentivesInstance.address;
    // newStableTokenAddress = stableDebtTokenInstance.address;

    BigNumber.config({ DECIMAL_PLACES: 0, ROUNDING_MODE: BigNumber.ROUND_DOWN });
    // make it use the chainlink aggregator for this tests
    await assetMappings.setAssetType(yvTricrypto2.address, 0);
    await assetMappings.configureAssetMapping(yvTricrypto2.address, "800000000000000000", "825000000000000000", "1050000000000000000", "1000", 8000, "1010000000000000000");
  });

  after('After upgradeability: reset config', async () => {
    BigNumber.config({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP });
    const {  assetMappings, yvTricrypto2 } = testEnv; 
      await assetMappings.setAssetType(yvTricrypto2.address, 3);
      await assetMappings.configureAssetMapping(yvTricrypto2.address, "250000000000000000", "450000000000000000", "1150000000000000000", 1000, 1000, "1010000000000000000");
  });

  it('Tries to update the incentives controller implementation with a different address than the lendingPoolManager', async () => {
    const { dai, addressesProvider, users } = testEnv;

    await expect(
      addressesProvider.connect(users[1].signer).setIncentivesController(newIncentivesControllerAddress)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Upgrades the incentives controller implementation ', async () => {
    const { dai, addressesProvider, helpersContract, incentivesController } = testEnv;

    console.log("Current incentives controller proxy address: ", await addressesProvider.getIncentivesController())

    await addressesProvider.setIncentivesController(newIncentivesControllerAddress);

    const newIncentivesController = await getMockIncentivesControllerImpl(incentivesController.address);

    await newIncentivesController.setUpgradedIC(1);
    
    expect((await newIncentivesController.upgradedIC()).toString()).to.be.eq('1', 'Invalid new incentives controller function');

    await newIncentivesController.setUpgradedDM(2);
    
    expect((await newIncentivesController.upgradedDM()).toString()).to.be.eq('2', 'Invalid new distribution manager function');

    await newIncentivesController.setUpgradedERD(3);
    
    expect((await newIncentivesController.upgradedERD()).toString()).to.be.eq('3', 'Invalid new external reward distributor function');
  });

  //'Test that protocol still works after upgrades'

  it('Deposits yvTricrypto, borrows DAI', async () => {
    const { dai, users, pool, oracle, stakingContracts, rewardTokens, incentivesController, ayvTricrypto2, yvTricrypto2 } = testEnv;
    // Setting the incentives controller again with the proxy address will cause hardhat to revert: Error: Transaction reverted and Hardhat couldn't infer the reason
    
    // const newIncentivesController = await getMockIncentivesControllerImpl(incentivesController.address);
    const staking = new ethers.Contract(stakingContracts[6].address,stakingAbi.abi)
    // await addressesProvider.setIncentivesController(incentivesController.address);

    await incentivesController.setStakingType([stakingContracts[6].address],[1]);
    await incentivesController.beginStakingReward(ayvTricrypto2.address, stakingContracts[6].address);
    console.log("after staking rewards begin");

    const depositor = users[0];
    const borrower = users[1];

    //mints DAI to depositor
    await dai.connect(depositor.signer).mint(await convertToCurrencyDecimals(dai.address, '1000'));

    //approve protocol to access depositor wallet
    await dai.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await pool
      .connect(depositor.signer)
      .deposit(dai.address, tranche, amountDAItoDeposit, depositor.address, '0');
    //user 2 deposits 4 ETH
    const amountETHtoDeposit = await convertToCurrencyDecimals(yvTricrypto2.address, '1');

    //mints WETH to borrower
    await yvTricrypto2.connect(borrower.signer).mint(await convertToCurrencyDecimals(yvTricrypto2.address, '1000'));

    //approve protocol to access the borrower wallet
    await yvTricrypto2.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    console.log("Before deposit, will try depositing: ", amountETHtoDeposit)    
    console.log("Allowance of yvtricrypto from atoken to incentives controller ", await yvTricrypto2.allowance(ayvTricrypto2.address, incentivesController.address))

    await pool
      .connect(borrower.signer)
      .deposit(yvTricrypto2.address, tranche, amountETHtoDeposit, borrower.address, '0');
      console.log("after deposit")
      expect(await staking.connect(borrower.signer).balanceOf(incentivesController.address)).equal(amountETHtoDeposit);

    //user 2 borrows
    console.log("try borrowing dai with yvtricrypto as collateral")
    const userGlobalData = await pool.callStatic.getUserAccountData(borrower.address, tranche);
    const daiPrice = await oracle.callStatic.getAssetPrice(dai.address);

    const amountDAIToBorrow = await convertToCurrencyDecimals(
      dai.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(daiPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(dai.address, tranche, amountDAIToBorrow, '0', borrower.address);

    
  });
});
