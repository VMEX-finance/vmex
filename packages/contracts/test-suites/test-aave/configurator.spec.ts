import { TestEnv, makeSuite } from "./helpers/make-suite";
import { APPROVAL_AMOUNT_LENDING_POOL, RAY } from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { ProtocolErrors } from "../../helpers/types";
import { strategyWETH } from "../../markets/aave/reservesConfigs";
import { ethers } from "ethers";

const { expect } = require("chai");

makeSuite("LendingPoolConfigurator", (testEnv: TestEnv) => {
  const {
    CALLER_NOT_TRANCHE_ADMIN,
    CALLER_NOT_GLOBAL_ADMIN,
    LPC_RESERVE_LIQUIDITY_NOT_0,
    RC_INVALID_LTV,
    RC_INVALID_LIQ_THRESHOLD,
    RC_INVALID_LIQ_BONUS,
    RC_INVALID_DECIMALS,
    RC_INVALID_RESERVE_FACTOR,
  } = ProtocolErrors;

  const factor = 14;

  it("Reverts trying to set an invalid reserve factor", async () => {
    const { configurator, weth } = testEnv;

    const invalidReserveFactor = "18446744073709551616";

    await expect(
      configurator.setReserveFactor([weth.address], 0, [invalidReserveFactor])
    ).to.be.revertedWith(RC_INVALID_RESERVE_FACTOR);
  });

  it("Reverts trying to set an invalid reserve factor that's greater than what's set in assetmappings", async () => {
    const { configurator, weth } = testEnv;

    const invalidReserveFactor = "500000000000000000";

    await expect(
      configurator.setReserveFactor([weth.address], 0, [invalidReserveFactor])
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
      configurator.connect(users[2].signer).deactivateReserve(weth.address, 0)
    ).to.be.revertedWith(CALLER_NOT_GLOBAL_ADMIN);
  });

  it("Check the onlyAaveAdmin on activateReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator.connect(users[2].signer).activateReserve(weth.address, 0)
    ).to.be.revertedWith(CALLER_NOT_GLOBAL_ADMIN);
  });

  it("Freezes the ETH0 reserve", async () => {
    const { configurator, weth, helpersContract } = testEnv;

    await configurator.setFreezeReserve([weth.address], 0, [true]);
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
    // expect(ethers.utils.formatUnits(ltv,factor)).to.be.equal(strategyWETH.baseLTVAsCollateral);
    // expect(ethers.utils.formatUnits(liquidationThreshold,factor)).to.be.equal(strategyWETH.liquidationThreshold);
    // expect(ethers.utils.formatUnits(liquidationBonus,factor)).to.be.equal(strategyWETH.liquidationBonus);
    // expect(stableBorrowRateEnabled).to.be.equal(
    //   strategyWETH.stableBorrowRateEnabled
    // );
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Unfreezes the ETH0 reserve", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.setFreezeReserve([weth.address], 0, [false]);

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
    // expect(ethers.utils.formatUnits(ltv,factor)).to.be.equal(strategyWETH.baseLTVAsCollateral);
    // expect(ethers.utils.formatUnits(liquidationThreshold,factor)).to.be.equal(strategyWETH.liquidationThreshold);
    // expect(ethers.utils.formatUnits(liquidationBonus,factor)).to.be.equal(strategyWETH.liquidationBonus);
    // expect(stableBorrowRateEnabled).to.be.equal(
    //   strategyWETH.stableBorrowRateEnabled
    // );
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Check the onlyAaveAdmin on freezeReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator.connect(users[2].signer).setFreezeReserve([weth.address], 0, [true]),
      CALLER_NOT_TRANCHE_ADMIN
    ).to.be.revertedWith(CALLER_NOT_TRANCHE_ADMIN);
  });

  it("Check the onlyAaveAdmin on unfreezeReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator.connect(users[2].signer).setFreezeReserve([weth.address], 0, [false]),
      CALLER_NOT_TRANCHE_ADMIN
    ).to.be.revertedWith(CALLER_NOT_TRANCHE_ADMIN);
  });

  it("Deactivates the ETH0 reserve for borrowing", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.setBorrowingOnReserve([weth.address], 0, [false]);
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
    // expect(ethers.utils.formatUnits(ltv,factor)).to.be.equal(strategyWETH.baseLTVAsCollateral);
    // expect(ethers.utils.formatUnits(liquidationThreshold,factor)).to.be.equal(strategyWETH.liquidationThreshold);
    // expect(ethers.utils.formatUnits(liquidationBonus,factor)).to.be.equal(strategyWETH.liquidationBonus);
    // expect(stableBorrowRateEnabled).to.be.equal(
    //   strategyWETH.stableBorrowRateEnabled
    // );
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Activates the ETH0 reserve for borrowing", async () => {
    const { configurator, weth, helpersContract } = testEnv;
    await configurator.setBorrowingOnReserve([weth.address], 0, [true]);
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
    // expect(ethers.utils.formatUnits(ltv,factor)).to.be.equal(strategyWETH.baseLTVAsCollateral);
    // expect(ethers.utils.formatUnits(liquidationThreshold,factor)).to.be.equal(strategyWETH.liquidationThreshold);
    // expect(ethers.utils.formatUnits(liquidationBonus,factor)).to.be.equal(strategyWETH.liquidationBonus);
    // expect(stableBorrowRateEnabled).to.be.equal(
    //   strategyWETH.stableBorrowRateEnabled
    // );
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);

    expect(variableBorrowIndex.toString()).to.be.equal(RAY);
  });

  it("Check the onlyAaveAdmin on disableBorrowingOnReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .setBorrowingOnReserve([weth.address], 0, [false]),
        CALLER_NOT_TRANCHE_ADMIN
    ).to.be.revertedWith(CALLER_NOT_TRANCHE_ADMIN);
  });

  it("Check the onlyAaveAdmin on enableBorrowingOnReserve ", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .setBorrowingOnReserve([weth.address], 0, [true]),
        CALLER_NOT_TRANCHE_ADMIN
    ).to.be.revertedWith(CALLER_NOT_TRANCHE_ADMIN);
  });

  //TODO: rewrite tests using asset mappings

  it("Deactivates the ETH0 reserve as collateral on user side", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    var {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      usageAsCollateralEnabled,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(usageAsCollateralEnabled).to.be.equal(true);

    await configurator.setCollateralEnabledOnReserve([weth.address], 0, [false]);

    var {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      usageAsCollateralEnabled,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(usageAsCollateralEnabled).to.be.equal(false);
    // expect(stableBorrowRateEnabled).to.be.equal(true);
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Activates the ETH0 reserve as collateral on user side", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.setCollateralEnabledOnReserve([weth.address], 0, [true]);

    var {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      usageAsCollateralEnabled,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(usageAsCollateralEnabled).to.be.equal(true);
    // expect(stableBorrowRateEnabled).to.be.equal(true);
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Deactivates the ETH0 reserve as collateral in asset mappings", async () => {
    const { assetMappings, helpersContract, weth } = testEnv;

    await assetMappings.configureAssetMapping(weth.address, 0, 0, 0, 0, 0, "1000000000000000000");

    const ret1 = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(ret1.borrowingEnabled).to.be.equal(true);
    expect(ret1.isActive).to.be.equal(true);
    expect(ret1.isFrozen).to.be.equal(false);
    expect(ret1.decimals).to.be.equal(18);
    expect(ret1.ltv).to.be.equal(0);
    expect(ret1.liquidationThreshold).to.be.equal(0);
    expect(ret1.liquidationBonus).to.be.equal(0);
    expect(ret1.supplyCap).to.be.equal(0);
    expect(ret1.borrowCap).to.be.equal(0);
    expect(ret1.borrowFactor).to.be.equal("1000000000000000000");

    const ret2 = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(ret2.borrowingEnabled).to.be.equal(true);
    expect(ret2.isActive).to.be.equal(true);
    expect(ret2.isFrozen).to.be.equal(false);
    expect(ret2.decimals).to.be.equal(18);
    expect(ret2.ltv).to.be.equal(0);
    expect(ret2.liquidationThreshold).to.be.equal(0);
    expect(ret2.liquidationBonus).to.be.equal(0);
    expect(ret2.supplyCap).to.be.equal(0);
    expect(ret2.borrowCap).to.be.equal(0);
    expect(ret2.borrowFactor).to.be.equal("1000000000000000000");
    // expect(stableBorrowRateEnabled).to.be.equal(true);
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Activates the ETH0 reserve as collateral on user side after admin disabled collateralization (revert expected)", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await expect(
      configurator.setCollateralEnabledOnReserve([weth.address], 0, [true])
    ).to.be.revertedWith(ProtocolErrors.LPC_NOT_APPROVED_COLLATERAL);
  });

  it("Deactivates the ETH0 reserve as collateral in asset mappings", async () => {
    const { assetMappings, helpersContract, weth } = testEnv;

    await assetMappings.configureAssetMapping(
      weth.address,
      strategyWETH.baseLTVAsCollateral,
      strategyWETH.liquidationThreshold,
      strategyWETH.liquidationBonus,
      ethers.utils.parseUnits(strategyWETH.supplyCap, strategyWETH.reserveDecimals),
      ethers.utils.parseUnits(strategyWETH.borrowCap, strategyWETH.reserveDecimals),
      strategyWETH.borrowFactor,
    );

    const ret = await helpersContract.getReserveConfigurationData(weth.address, 0);

    expect(ret.borrowingEnabled).to.be.equal(true);
    expect(ret.isActive).to.be.equal(true);
    expect(ret.isFrozen).to.be.equal(false);
    expect(ret.decimals).to.be.equal(18);
    // expect(ethers.utils.formatUnits(ret.ltv,factor)).to.be.equal(strategyWETH.baseLTVAsCollateral);
    // expect(ethers.utils.formatUnits(ret.liquidationThreshold,factor)).to.be.equal(strategyWETH.liquidationThreshold);
    // expect(ethers.utils.formatUnits(ret.liquidationBonus,factor)).to.be.equal(strategyWETH.liquidationBonus);
    expect(ret.supplyCap).to.be.equal(ethers.utils.parseEther(strategyWETH.supplyCap));
    expect(ret.borrowCap).to.be.equal(ethers.utils.parseEther(strategyWETH.borrowCap));
    // expect(ethers.utils.formatUnits(ret.borrowFactor,factor)).to.be.equal(strategyWETH.borrowFactor);
    // expect(stableBorrowRateEnabled).to.be.equal(true);
    // expect(reserveFactor).to.be.equal(strategyWETH.reserveFactor);
  });

  it("Changes the reserve factor of WETH0", async () => {
    const { configurator, helpersContract, weth } = testEnv;
    await configurator.setReserveFactor([weth.address], 0, ["100000000000000000"]);
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
    // expect(ethers.utils.formatUnits(ltv,factor)).to.be.equal(strategyWETH.baseLTVAsCollateral);
    // expect(ethers.utils.formatUnits(liquidationThreshold,factor)).to.be.equal(strategyWETH.liquidationThreshold);
    // expect(ethers.utils.formatUnits(liquidationBonus,factor)).to.be.equal(strategyWETH.liquidationBonus);
    expect(reserveFactor).to.be.equal(ethers.utils.parseUnits("1000",14));
  });

  it("Check the onlyLendingPoolManager on setReserveFactor", async () => {
    const { configurator, users, weth } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .setReserveFactor([weth.address], 0, ["200000000000000000"]),
      CALLER_NOT_TRANCHE_ADMIN
    ).to.be.revertedWith(CALLER_NOT_TRANCHE_ADMIN);
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
