import BigNumber from "bignumber.js";

import { DRE, increaseTime } from "../../helpers/misc-utils";
import {
  APPROVAL_AMOUNT_LENDING_POOL,
  PERCENTAGE_FACTOR,
  oneEther,
} from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { makeSuite } from "./helpers/make-suite";
import { ProtocolErrors } from "../../helpers/types";
import { getUserData } from "./helpers/utils/helpers";

import { parseEther } from "ethers/lib/utils";
import { ethers } from "ethers";
import {
  getATokenMock,
  getMockAToken,
  getTrancheAdminT1,
} from "../../helpers/contracts-getters";
import { deployFakeAToken } from "../../helpers/contracts-deployments";

const chai = require("chai");

const { expect } = chai;

makeSuite(
  "Vmex incentives controller - integration tests with the lendingpool",
  (testEnv) => {
    const { INVALID_HF } = ProtocolErrors;
    const stakingAbi = require("../../artifacts/contracts/mocks/StakingRewardsMock.sol/StakingRewardsMock.json");
    const tranche = 1;
    const difTranche = 0;

    it("User can deposit and withdraw all", async () => {
      const { dai, aDai, users, pool } = testEnv;

      const depositor = users[2];

      await dai
        .connect(depositor.signer)
        .mint(await convertToCurrencyDecimals(dai.address, "1000"));

      await dai
        .connect(depositor.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
      const amountDAItoDeposit = await convertToCurrencyDecimals(
        dai.address,
        "1000"
      );

      await pool
        .connect(depositor.signer)
        .deposit(
          dai.address,
          difTranche,
          amountDAItoDeposit,
          depositor.address,
          "0"
        );

      expect(await dai.balanceOf(depositor.address)).equal(0);
      expect(await dai.balanceOf(aDai.address)).equal(amountDAItoDeposit);
      expect(await aDai.balanceOf(depositor.address)).equal(amountDAItoDeposit);
      await pool
        .connect(depositor.signer)
        .withdraw(
          dai.address,
          difTranche,
          amountDAItoDeposit,
          depositor.address
        );
      expect(await dai.balanceOf(depositor.address)).equal(amountDAItoDeposit);
      expect(await dai.balanceOf(aDai.address)).equal(0);
      expect(await aDai.balanceOf(depositor.address)).equal(0);
    });

    it("Before LendingPool liquidation: set config", async () => {
      const { assetMappings, yvTricrypto2, configurator } = testEnv;
      BigNumber.config({
        DECIMAL_PLACES: 0,
        ROUNDING_MODE: BigNumber.ROUND_DOWN,
      });
      // make it use the chainlink aggregator for this tests
      // await assetMappings.setAssetType(yvTricrypto2.address, 0);

      // await assetMappings.configureAssetMapping(
      //   yvTricrypto2.address,
      //   "800000000000000000",
      //   "825000000000000000",
      //   "1050000000000000000",
      //   1000,
      //   800,
      //   "1010000000000000000"
      // );

      // await assetMappings.configureAssetMapping(
      //   yvTricrypto2.address,
      //   "250000000000000000",
      //   "450000000000000000",
      //   "1150000000000000000",
      //   10000,
      //   10000,
      //   "1010000000000000000"
      // );
      const assetData = await assetMappings.getAssetMapping(
        yvTricrypto2.address
      );
      console.log("yvtricrypto dat: ", assetData);

      await configurator.verifyTranche(tranche); //verifying tranche to set custom params
      await configurator
        .connect(await getTrancheAdminT1("hardhat"))
        .batchConfigureCollateralParams(
          [
            {
              underlyingAsset: yvTricrypto2.address,
              collateralParams: {
                baseLTV: "800000000000000000",
                liquidationThreshold: "825000000000000000",
                liquidationBonus: "1050000000000000000",
                borrowFactor: "1010000000000000000",
              },
            },
          ],
          tranche
        );
    });

    it("It's not possible to liquidate on a non-active collateral or a non active principal", async () => {
      const { configurator, weth, pool, users, dai } = testEnv;
      const user = users[1];
      await configurator.deactivateReserve(weth.address, tranche);

      await expect(
        pool.liquidationCall(
          weth.address,
          dai.address,
          tranche,
          user.address,
          parseEther("1000"),
          false
        )
      ).to.be.revertedWith("2");

      await configurator.activateReserve(weth.address, tranche);

      await configurator.deactivateReserve(dai.address, tranche);

      await expect(
        pool.liquidationCall(
          weth.address,
          dai.address,
          tranche,
          user.address,
          parseEther("1000"),
          false
        )
      ).to.be.revertedWith("2");

      await configurator.activateReserve(dai.address, tranche);
    });

    it("Deposits yvTricrypto, borrows DAI", async () => {
      const {
        dai,
        users,
        pool,
        oracle,
        incentivesController,
        stakingContracts,
        rewardTokens,
        addressesProvider,
        ayvTricrypto2,
        yvTricrypto2,
      } = testEnv;

      const staking = new ethers.Contract(
        stakingContracts[6].address,
        stakingAbi.abi
      );
      console.log("try beginning staking reward");
      await incentivesController.setStakingType(
        [stakingContracts[6].address],
        [1]
      );

      const mockAToken = await deployFakeAToken(dai.address, 0, 1000);

      await expect(
        incentivesController.beginStakingReward(
          mockAToken.address,
          stakingContracts[6].address
        )
      ).to.be.revertedWith("Incorrect aToken");
      await expect(
        incentivesController.removeStakingReward(mockAToken.address)
      ).to.be.revertedWith("Incorrect aToken");
      await incentivesController.beginStakingReward(
        ayvTricrypto2.address,
        stakingContracts[6].address
      );
      console.log("after staking rewards begin");

      const depositor = users[0];
      const borrower = users[1];

      //mints DAI to depositor
      await dai
        .connect(depositor.signer)
        .mint(await convertToCurrencyDecimals(dai.address, "1000"));

      //approve protocol to access depositor wallet
      await dai
        .connect(depositor.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      //user 1 deposits 1000 DAI
      const amountDAItoDeposit = await convertToCurrencyDecimals(
        dai.address,
        "1000"
      );

      await pool
        .connect(depositor.signer)
        .deposit(
          dai.address,
          tranche,
          amountDAItoDeposit,
          depositor.address,
          "0"
        );
      //user 2 deposits 4 ETH
      const amountETHtoDeposit = await convertToCurrencyDecimals(
        yvTricrypto2.address,
        "1"
      );

      //mints WETH to borrower
      await yvTricrypto2
        .connect(borrower.signer)
        .mint(await convertToCurrencyDecimals(yvTricrypto2.address, "1000"));

      //approve protocol to access the borrower wallet
      await yvTricrypto2
        .connect(borrower.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      console.log("Before deposit, will try depositing: ", amountETHtoDeposit);
      console.log(
        "Allowance of staking contract to ",
        await yvTricrypto2.allowance(
          ayvTricrypto2.address,
          incentivesController.address
        )
      );

      console.log(
        "Allowance of external rewards to access atoken",
        await yvTricrypto2.allowance(
          ayvTricrypto2.address,
          incentivesController.address
        )
      );
      await pool
        .connect(borrower.signer)
        .deposit(
          yvTricrypto2.address,
          tranche,
          amountETHtoDeposit,
          borrower.address,
          "0"
        );

      expect(
        await staking
          .connect(borrower.signer)
          .balanceOf(incentivesController.address)
      ).equal(amountETHtoDeposit);
      console.log("after deposit");

      //user 2 borrows

      const userGlobalData = await pool.callStatic.getUserAccountData(
        borrower.address,
        tranche
      );
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
        .borrow(dai.address, tranche, amountDAIToBorrow, "0", borrower.address);
    });

    it("Drop the health factor below 1", async () => {
      const { dai, users, pool, oracle } = testEnv;
      const borrower = users[1];

      const daiPrice = await oracle.callStatic.getAssetPrice(dai.address);

      await oracle.setAssetPrice(
        dai.address,
        new BigNumber(daiPrice.toString()).multipliedBy(1.18).toFixed(0)
      );

      const userGlobalData = await pool.callStatic.getUserAccountData(
        borrower.address,
        tranche
      );

      expect(userGlobalData.healthFactor.toString()).to.be.bignumber.lt(
        oneEther.toFixed(0),
        INVALID_HF
      );
    });

    it("Liquidates the borrow", async () => {
      const { dai, yvTricrypto2, users, pool, oracle, helpersContract } =
        testEnv;
      const liquidator = users[3];
      const borrower = users[1];

      //mints dai to the liquidator
      await dai
        .connect(liquidator.signer)
        .mint(await convertToCurrencyDecimals(dai.address, "1000"));

      //approve protocol to access the liquidator wallet
      await dai
        .connect(liquidator.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      const daiReserveDataBefore = await helpersContract.getReserveData(
        dai.address,
        tranche
      );
      const ethReserveDataBefore = await helpersContract.getReserveData(
        yvTricrypto2.address,
        tranche
      );

      const userReserveDataBefore = await getUserData(
        pool,
        helpersContract,
        dai.address,
        tranche.toString(),
        borrower.address
      );

      const amountToLiquidate = userReserveDataBefore.currentVariableDebt
        .div(2)
        .toFixed(0);

      await increaseTime(100);

      const tx = await pool
        .connect(liquidator.signer)
        .liquidationCall(
          yvTricrypto2.address,
          dai.address,
          tranche,
          borrower.address,
          amountToLiquidate,
          false
        );

      const userReserveDataAfter = await getUserData(
        pool,
        helpersContract,
        dai.address,
        tranche.toString(),
        borrower.address
      );

      const daiReserveDataAfter = await helpersContract.getReserveData(
        dai.address,
        tranche
      );
      const ethReserveDataAfter = await helpersContract.getReserveData(
        yvTricrypto2.address,
        tranche
      );

      const collateralPrice = await oracle.callStatic.getAssetPrice(
        yvTricrypto2.address
      );
      const principalPrice = await oracle.callStatic.getAssetPrice(dai.address);

      const collateralDecimals = (
        await helpersContract.getReserveConfigurationData(
          yvTricrypto2.address,
          tranche
        )
      ).decimals.toString();
      const principalDecimals = (
        await helpersContract.getReserveConfigurationData(dai.address, tranche)
      ).decimals.toString();

      const expectedCollateralLiquidated = new BigNumber(
        principalPrice.toString()
      )
        .times(new BigNumber(amountToLiquidate).times(105))
        .times(new BigNumber(10).pow(collateralDecimals))
        .div(
          new BigNumber(collateralPrice.toString()).times(
            new BigNumber(10).pow(principalDecimals)
          )
        )
        .div(100)
        .decimalPlaces(0, BigNumber.ROUND_DOWN);

      if (!tx.blockNumber) {
        expect(false, "Invalid block number");
        return;
      }
      const txTimestamp = new BigNumber(
        (await DRE.ethers.provider.getBlock(tx.blockNumber)).timestamp
      );

      // TODO: convert stable to variable
      // const stableDebtBeforeTx = calcExpectedStableDebtTokenBalance(
      //   userReserveDataBefore.principalStableDebt,
      //   userReserveDataBefore.stableBorrowRate,
      //   userReserveDataBefore.stableRateLastUpdated,
      //   txTimestamp
      // );

      // expect(userReserveDataAfter.currentStableDebt.toString()).to.be.bignumber.almostEqual(
      //   stableDebtBeforeTx.minus(amountToLiquidate).toFixed(0),
      //   'Invalid user debt after liquidation'
      // );

      // //the liquidity index of the principal reserve needs to be bigger than the index before
      // expect(daiReserveDataAfter.liquidityIndex.toString()).to.be.bignumber.gte(
      //   daiReserveDataBefore.liquidityIndex.toString(),
      //   'Invalid liquidity index'
      // );

      // //the principal APY after a liquidation needs to be lower than the APY before
      // expect(daiReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
      //   daiReserveDataBefore.liquidityRate.toString(),
      //   'Invalid liquidity APY'
      // );

      // expect(daiReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      //   new BigNumber(daiReserveDataBefore.availableLiquidity.toString())
      //     .plus(amountToLiquidate)
      //     .toFixed(0),
      //   'Invalid principal available liquidity'
      // );

      // expect(ethReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      //   new BigNumber(ethReserveDataBefore.availableLiquidity.toString())
      //     .minus(expectedCollateralLiquidated)
      //     .toFixed(0),
      //   'Invalid collateral available liquidity'
      // );
    });

    it("User 3 deposits 1000 USDC, user 4 1 WETH, user 4 borrows - drops HF, liquidates the borrow", async () => {
      const { usdc, users, pool, oracle, yvTricrypto2, helpersContract } =
        testEnv;

      const depositor = users[3];
      const borrower = users[4];
      const liquidator = users[5];

      //mints USDC to depositor
      await usdc
        .connect(depositor.signer)
        .mint(await convertToCurrencyDecimals(usdc.address, "1000"));

      //approve protocol to access depositor wallet
      await usdc
        .connect(depositor.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      //depositor deposits 1000 USDC
      const amountUSDCtoDeposit = await convertToCurrencyDecimals(
        usdc.address,
        "1000"
      );

      await pool
        .connect(depositor.signer)
        .deposit(
          usdc.address,
          tranche,
          amountUSDCtoDeposit,
          depositor.address,
          "0"
        );

      //borrower deposits 1 ETH
      const amountETHtoDeposit = await convertToCurrencyDecimals(
        yvTricrypto2.address,
        "1"
      );

      //mints WETH to borrower
      await yvTricrypto2
        .connect(borrower.signer)
        .mint(await convertToCurrencyDecimals(yvTricrypto2.address, "1000"));

      //approve protocol to access the borrower wallet
      await yvTricrypto2
        .connect(borrower.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      await pool
        .connect(borrower.signer)
        .deposit(
          yvTricrypto2.address,
          tranche,
          amountETHtoDeposit,
          borrower.address,
          "0"
        );

      //borrower borrows
      const userGlobalData = await pool.callStatic.getUserAccountData(
        borrower.address,
        tranche
      );

      const usdcPrice = await oracle.callStatic.getAssetPrice(usdc.address);

      const amountUSDCToBorrow = await convertToCurrencyDecimals(
        usdc.address,
        new BigNumber(userGlobalData.availableBorrowsETH.toString())
          .div(usdcPrice.toString())
          .multipliedBy(0.9502)
          .toFixed(0)
      );

      await pool
        .connect(borrower.signer)
        .borrow(
          usdc.address,
          tranche,
          amountUSDCToBorrow,
          "0",
          borrower.address
        );

      //drops HF below 1
      await oracle.setAssetPrice(
        usdc.address,
        new BigNumber(usdcPrice.toString()).multipliedBy(1.12).toFixed(0)
      );

      //mints dai to the liquidator

      await usdc
        .connect(liquidator.signer)
        .mint(await convertToCurrencyDecimals(usdc.address, "1000"));

      //approve protocol to access depositor wallet
      await usdc
        .connect(liquidator.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      const userReserveDataBefore = await helpersContract.getUserReserveData(
        usdc.address,
        tranche,
        borrower.address
      );

      const usdcReserveDataBefore = await helpersContract.getReserveData(
        usdc.address,
        tranche
      );
      const ethReserveDataBefore = await helpersContract.getReserveData(
        yvTricrypto2.address,
        tranche
      );

      const amountToLiquidate = DRE.ethers.BigNumber.from(
        userReserveDataBefore.currentVariableDebt.toString()
      )
        .div(2)
        .toString();

      const borrowerData = await pool.callStatic.getUserAccountData(
        borrower.address,
        tranche
      );

      expect(borrowerData.healthFactor.toString()).to.be.bignumber.lt(
        oneEther.toFixed(0),
        INVALID_HF
      );

      await pool
        .connect(liquidator.signer)
        .liquidationCall(
          yvTricrypto2.address,
          usdc.address,
          tranche,
          borrower.address,
          amountToLiquidate,
          false
        );

      const userReserveDataAfter = await helpersContract.getUserReserveData(
        usdc.address,
        tranche,
        borrower.address
      );

      const userGlobalDataAfter = await pool.callStatic.getUserAccountData(
        borrower.address,
        tranche
      );

      const usdcReserveDataAfter = await helpersContract.getReserveData(
        usdc.address,
        tranche
      );
      const ethReserveDataAfter = await helpersContract.getReserveData(
        yvTricrypto2.address,
        tranche
      );

      const collateralPrice = await oracle.callStatic.getAssetPrice(
        yvTricrypto2.address
      );
      const principalPrice = await oracle.callStatic.getAssetPrice(
        usdc.address
      );

      const collateralDecimals = (
        await helpersContract.getReserveConfigurationData(
          yvTricrypto2.address,
          tranche
        )
      ).decimals.toString();
      const principalDecimals = (
        await helpersContract.getReserveConfigurationData(usdc.address, tranche)
      ).decimals.toString();

      const expectedCollateralLiquidated = new BigNumber(
        principalPrice.toString()
      )
        .times(new BigNumber(amountToLiquidate).times(105))
        .times(new BigNumber(10).pow(collateralDecimals))
        .div(
          new BigNumber(collateralPrice.toString()).times(
            new BigNumber(10).pow(principalDecimals)
          )
        )
        .div(100)
        .decimalPlaces(0, BigNumber.ROUND_DOWN);

      expect(userGlobalDataAfter.healthFactor.toString()).to.be.bignumber.gt(
        oneEther.toFixed(0),
        "Invalid health factor"
      );

      expect(
        userReserveDataAfter.currentVariableDebt.toString()
      ).to.be.bignumber.almostEqual(
        new BigNumber(userReserveDataBefore.currentVariableDebt.toString())
          .minus(amountToLiquidate)
          .toFixed(0),
        "Invalid user borrow balance after liquidation"
      );

      //the liquidity index of the principal reserve needs to be bigger than the index before
      expect(
        usdcReserveDataAfter.liquidityIndex.toString()
      ).to.be.bignumber.gte(
        usdcReserveDataBefore.liquidityIndex.toString(),
        "Invalid liquidity index"
      );

      //the principal APY after a liquidation needs to be lower than the APY before
      expect(usdcReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
        usdcReserveDataBefore.liquidityRate.toString(),
        "Invalid liquidity APY"
      );

      expect(
        usdcReserveDataAfter.availableLiquidity.toString()
      ).to.be.bignumber.almostEqual(
        new BigNumber(usdcReserveDataBefore.availableLiquidity.toString())
          .plus(amountToLiquidate)
          .toFixed(0),
        "Invalid principal available liquidity"
      );

      expect(
        ethReserveDataAfter.availableLiquidity.toString()
      ).to.be.bignumber.almostEqual(
        new BigNumber(ethReserveDataBefore.availableLiquidity.toString())
          .minus(expectedCollateralLiquidated)
          .toFixed(0),
        "Invalid collateral available liquidity"
      );
    });

    it("User 4 deposits 10 AAVE - drops HF, liquidates the AAVE, which results on a lower amount being liquidated", async () => {
      const { aave, usdc, users, pool, oracle, helpersContract } = testEnv;

      const depositor = users[3];
      const borrower = users[4];
      const liquidator = users[5];

      //mints AAVE to borrower
      await aave
        .connect(borrower.signer)
        .mint(await convertToCurrencyDecimals(aave.address, "10"));

      //approve protocol to access the borrower wallet
      await aave
        .connect(borrower.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      //borrower deposits 10 AAVE
      const amountToDeposit = await convertToCurrencyDecimals(
        aave.address,
        "10"
      );

      await pool
        .connect(borrower.signer)
        .deposit(aave.address, tranche, amountToDeposit, borrower.address, "0");
      const usdcPrice = await oracle.callStatic.getAssetPrice(usdc.address);

      //drops HF below 1
      await oracle.setAssetPrice(
        usdc.address,
        new BigNumber(usdcPrice.toString()).multipliedBy(1.14).toFixed(0)
      );

      //mints usdc to the liquidator
      await usdc
        .connect(liquidator.signer)
        .mint(await convertToCurrencyDecimals(usdc.address, "1000"));

      //approve protocol to access depositor wallet
      await usdc
        .connect(liquidator.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      const userReserveDataBefore = await helpersContract.getUserReserveData(
        usdc.address,
        tranche,
        borrower.address
      );

      const usdcReserveDataBefore = await helpersContract.getReserveData(
        usdc.address,
        tranche
      );
      const aaveReserveDataBefore = await helpersContract.getReserveData(
        aave.address,
        tranche
      );

      const amountToLiquidate = new BigNumber(
        userReserveDataBefore.currentVariableDebt.toString()
      )
        .div(2)
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
        .toFixed(0);

      const collateralPrice = await oracle.callStatic.getAssetPrice(
        aave.address
      );
      const principalPrice = await oracle.callStatic.getAssetPrice(
        usdc.address
      );

      await pool
        .connect(liquidator.signer)
        .liquidationCall(
          aave.address,
          usdc.address,
          tranche,
          borrower.address,
          amountToLiquidate,
          false
        );

      const userReserveDataAfter = await helpersContract.getUserReserveData(
        usdc.address,
        tranche,
        borrower.address
      );

      const userGlobalDataAfter = await pool.callStatic.getUserAccountData(
        borrower.address,
        tranche
      );

      const usdcReserveDataAfter = await helpersContract.getReserveData(
        usdc.address,
        tranche
      );
      const aaveReserveDataAfter = await helpersContract.getReserveData(
        aave.address,
        tranche
      );

      const aaveConfiguration =
        await helpersContract.getReserveConfigurationData(
          aave.address,
          tranche
        );
      const collateralDecimals = aaveConfiguration.decimals.toString();
      const liquidationBonus = aaveConfiguration.liquidationBonus.toString();

      const principalDecimals = (
        await helpersContract.getReserveConfigurationData(usdc.address, tranche)
      ).decimals.toString();

      const expectedCollateralLiquidated = oneEther.multipliedBy("10");

      const expectedPrincipal = new BigNumber(collateralPrice.toString())
        .times(expectedCollateralLiquidated)
        .times(new BigNumber(10).pow(principalDecimals))
        .div(
          new BigNumber(principalPrice.toString()).times(
            new BigNumber(10).pow(collateralDecimals)
          )
        )
        .times(PERCENTAGE_FACTOR)
        .div(liquidationBonus.toString())
        .decimalPlaces(0, BigNumber.ROUND_DOWN);

      expect(userGlobalDataAfter.healthFactor.toString()).to.be.bignumber.gt(
        oneEther.toFixed(0),
        "Invalid health factor"
      );

      expect(
        userReserveDataAfter.currentVariableDebt.toString()
      ).to.be.bignumber.almostEqual(
        new BigNumber(userReserveDataBefore.currentVariableDebt.toString())
          .minus(expectedPrincipal)
          .toFixed(0),
        "Invalid user borrow balance after liquidation"
      );

      expect(
        usdcReserveDataAfter.availableLiquidity.toString()
      ).to.be.bignumber.almostEqual(
        new BigNumber(usdcReserveDataBefore.availableLiquidity.toString())
          .plus(expectedPrincipal)
          .toFixed(0),
        "Invalid principal available liquidity"
      );

      expect(
        aaveReserveDataAfter.availableLiquidity.toString()
      ).to.be.bignumber.almostEqual(
        new BigNumber(aaveReserveDataBefore.availableLiquidity.toString())
          .minus(expectedCollateralLiquidated)
          .toFixed(0),
        "Invalid collateral available liquidity"
      );
    });

    it("After LendingPool liquidation: reset config", async () => {
      BigNumber.config({
        DECIMAL_PLACES: 20,
        ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
      });
      const { assetMappings, yvTricrypto2, configurator } = testEnv;
      // await assetMappings.setAssetType(yvTricrypto2.address, 3);

      // await assetMappings.configureAssetMapping(
      //   yvTricrypto2.address,
      //   "250000000000000000",
      //   "450000000000000000",
      //   "1150000000000000000",
      //   10000,
      //   10000,
      //   "1010000000000000000"
      // );
      await configurator.unverifyTranche(tranche);
    });
  }
);
