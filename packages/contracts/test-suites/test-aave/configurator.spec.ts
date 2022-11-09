import { TestEnv, makeSuite } from "./helpers/make-suite";
import { APPROVAL_AMOUNT_LENDING_POOL, RAY } from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { ProtocolErrors } from "../../helpers/types";
import { strategyWETH } from "../../markets/aave/reservesConfigs";

const { expect } = require("chai");

makeSuite("LendingPoolConfigurator", (testEnv: TestEnv) => {
  const {
    CALLER_NOT_POOL_ADMIN,
    LPC_RESERVE_LIQUIDITY_NOT_0,
    RC_INVALID_LTV,
    RC_INVALID_LIQ_THRESHOLD,
    RC_INVALID_LIQ_BONUS,
    RC_INVALID_DECIMALS,
    RC_INVALID_RESERVE_FACTOR,
  } = ProtocolErrors;

  it("Reverts trying to set an invalid reserve factor", async () => {
    const { aTokensAndRatesHelper, weth } = testEnv;

    const invalidReserveFactor = 65536;

    await expect(
      aTokensAndRatesHelper.setReserveFactor(weth.address, 0, invalidReserveFactor)
    ).to.be.revertedWith(RC_INVALID_RESERVE_FACTOR);
  });

  it("Deactivates the ETH0 reserve", async () => {
    const { configurator, weth, helpersContract } = testEnv;
    await configurator.deactivateReserve(weth.address, 0);
    {
      const { isActive } = await helpersContract.getReserveConfigurationData(
        weth.address,
        0
      );
      expect(isActive).to.be.equal(false);
    }
    {
      const { isActive } = await helpersContract.getReserveConfigurationData(
        weth.address,
        1
        );
      expect(isActive).to.be.equal(true);
    }
  });

  it("Rectivates the ETH0 reserve", async () => {
    const { configurator, weth, helpersContract } = testEnv;
    await configurator.activateReserve(weth.address, 0);

    const { isActive } = await helpersContract.getReserveConfigurationData(
      weth.address,
      0
    );
    expect(isActive).to.be.equal(true);
  });

  it("Check the onlyAaveAdmin on deactivateReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator.connect(users[2].signer).deactivateReserve(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Check the onlyAaveAdmin on activateReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator.connect(users[2].signer).activateReserve(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Freezes the ETH0 reserve", async () => {
    const { aTokensAndRatesHelper, weth, helpersContract } = testEnv;

    await aTokensAndRatesHelper.freezeReserve(weth.address, 0);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(true);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(
      strategyWETH.stableBorrowRateEnabled
    );
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Unfreezes the ETH0 reserve", async () => {
    const { aTokensAndRatesHelper, helpersContract, weth } = testEnv;
    await aTokensAndRatesHelper.unfreezeReserve(weth.address, 0);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(
      strategyWETH.stableBorrowRateEnabled
    );
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Check the onlyAaveAdmin on freezeReserve ", async () => {
    const { aTokensAndRatesHelper, users, weth } = testEnv;
    await expect(
      aTokensAndRatesHelper.connect(users[2].signer).freezeReserve(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Check the onlyAaveAdmin on unfreezeReserve ", async () => {
    const { aTokensAndRatesHelper, users, weth } = testEnv;
    await expect(
      aTokensAndRatesHelper.connect(users[2].signer).unfreezeReserve(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Deactivates the ETH0 reserve for borrowing", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.disableBorrowingOnReserve(weth.address, 0);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(false);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(
      strategyWETH.stableBorrowRateEnabled
    );
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Activates the ETH0 reserve for borrowing", async () => {
    const { configurator, weth, helpersContract } = testEnv;
    await configurator.enableBorrowingOnReserve(weth.address, 0, true);
    const { variableBorrowIndex } = await helpersContract.getReserveData(
      weth.address,
      0
    );

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(
      strategyWETH.stableBorrowRateEnabled
    );
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);

    expect(variableBorrowIndex.toString()).to.be.equal(RAY);
  });

  it("Check the onlyAaveAdmin on disableBorrowingOnReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .disableBorrowingOnReserve(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Check the onlyAaveAdmin on enableBorrowingOnReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .enableBorrowingOnReserve(weth.address, 0, true),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Deactivates the ETH0 reserve as collateral", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.configureReserveAsCollateral(weth.address, 0, 0, 0, 0);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(18);
    expect(ltv).to.be.equal(0);
    expect(liquidationThreshold).to.be.equal(0);
    expect(liquidationBonus).to.be.equal(0);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Activates the ETH0 reserve as collateral", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.configureReserveAsCollateral(
      weth.address,
      0,
      "8000",
      "8250",
      "10500"
    );

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(
      strategyWETH.stableBorrowRateEnabled
    );
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Check the onlyAaveAdmin on configureReserveAsCollateral ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .configureReserveAsCollateral(weth.address, 0, "7500", "8000", "10500"),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Disable stable borrow rate on the ETH reserve", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.disableReserveStableRate(weth.address, 0);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(false);
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Enables stable borrow rate on the ETH reserve", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.enableReserveStableRate(weth.address, 0);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Check the onlyAaveAdmin on disableReserveStableRate", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .disableReserveStableRate(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Check the onlyAaveAdmin on enableReserveStableRate", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .enableReserveStableRate(weth.address, 0),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Changes the reserve factor of WETH0", async () => {
    const { aTokensAndRatesHelper, helpersContract, weth } = testEnv;
    await aTokensAndRatesHelper.setReserveFactor(weth.address, 0, "1000");
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyWETH.reserveDecimals);
    expect(ltv).to.be.equal(strategyWETH.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyWETH.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyWETH.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(
      strategyWETH.stableBorrowRateEnabled
    );
    expect(reserveFactor).to.be.equal(1000);
  });

  it("Check the onlyLendingPoolManager on setReserveFactor", async () => {
    const { aTokensAndRatesHelper, users, weth } = testEnv;
    await expect(
      aTokensAndRatesHelper
        .connect(users[2].signer)
        .setReserveFactor(weth.address, 0, "2000"),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it("Reverts when trying to disable the DAI0 reserve with liquidity on it", async () => {
    const { dai, pool, configurator } = testEnv;
    const userAddress = await pool.signer.getAddress();
    await dai.mint(await convertToCurrencyDecimals(dai.address, "1000"));

    //approve protocol to access depositor wallet
    await dai.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    const amountDAItoDeposit = await convertToCurrencyDecimals(
      dai.address,
      "1000"
    );

    //user 1 deposits 1000 DAI
    await pool.deposit(dai.address, 0, amountDAItoDeposit, userAddress, "0");

    await expect(
      configurator.deactivateReserve(dai.address, 0),
      LPC_RESERVE_LIQUIDITY_NOT_0
    ).to.be.revertedWith(LPC_RESERVE_LIQUIDITY_NOT_0);
  });
});
