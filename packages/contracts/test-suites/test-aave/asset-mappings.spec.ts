import { TestEnv, makeSuite } from "./helpers/make-suite";
import {
  APPROVAL_AMOUNT_LENDING_POOL,
  MAX_UINT_AMOUNT,
  oneEther,
} from "../../helpers/constants";
import { ProtocolErrors } from "../../helpers/types";
import { BigNumberish } from "ethers";
import { createRandomAddress } from "../../helpers/misc-utils";
import {
  deployMintableERC20,
  deployMockAToken,
} from "../../helpers/contracts-deployments";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import rawBRE, { ethers } from "hardhat";
import { getAllMockedTokens, getAToken, getTrancheAdminT1, getVariableDebtToken } from "../../helpers/contracts-getters";

const { expect } = require("chai");
makeSuite("Asset mappings", (testEnv: TestEnv) => {
  const {
    AM_INVALID_CONFIGURATION,
    AM_ASSET_ALREADY_IN_MAPPINGS,
    AM_ASSET_NOT_CONTRACT,
    AM_INTEREST_STRATEGY_NOT_CONTRACT,
    AM_UNABLE_TO_DISALLOW_ASSET,
  } = ProtocolErrors;

  let defaultAssetMappingAssets;
  before("Setup default asset mapping assets", async () => { 
    defaultAssetMappingAssets = new Set<string>(
      Object.values(await getAllMockedTokens()).map((el:any)=>el.address)
    );
  })

  it("Determine number of approved assets", async () => {
    const { assetMappings } = testEnv;
    const numTokens = await assetMappings.getNumApprovedTokens();
    expect(numTokens).to.be.equal(39, "Incorrect number of approved tokens");
  });

  it("Determine addresses of approved tokens", async () => {
    const { assetMappings } = testEnv;

    const tokens = await assetMappings.getAllApprovedTokens();

    console.log("tokens: ", tokens)
    for (let i = 0; i < tokens.length; i++) {
      expect(defaultAssetMappingAssets.has(tokens[i])).to.be.equal(
        true,
        "Unexpected token in asset mappings: " + tokens[i]
      );
    }
  });

  it("Deletes weth from approved tokens", async () => {
    const { assetMappings, weth } = testEnv;
    await expect(assetMappings.setAssetAllowed(weth.address, false)).to.be.revertedWith(AM_UNABLE_TO_DISALLOW_ASSET);
    await assetMappings.setBorrowingEnabled(weth.address, false);
    await expect(assetMappings.setAssetAllowed(weth.address, false)).to.be.revertedWith(AM_UNABLE_TO_DISALLOW_ASSET);
    await assetMappings.configureAssetMapping(weth.address, 0,0,0,0,0,"1000000000000000000");
    await assetMappings.setAssetAllowed(weth.address, false);
    
    await expect(
      assetMappings.getAssetMapping(weth.address)
    ).to.be.revertedWith(ProtocolErrors.AM_ASSET_NOT_ALLOWED);
  });

  it("Checks all WETH reserves are deactivated", async () => {
    const { weth, helpersContract } = testEnv;
    await expect(
      helpersContract.getReserveFlags(weth.address, 0)
    ).to.be.revertedWith(ProtocolErrors.AM_ASSET_NOT_ALLOWED);
    await expect(
      helpersContract.getReserveFlags(weth.address, 1)
    ).to.be.revertedWith(ProtocolErrors.AM_ASSET_NOT_ALLOWED);
  });

  it("Determine number of approved assets", async () => {
    const { assetMappings } = testEnv;
    const numTokens = await assetMappings.getNumApprovedTokens();
    expect(numTokens).to.be.equal(38, "Incorrect number of approved tokens");
  });

  it("Determine addresses of approved tokens after delete", async () => {
    const { assetMappings, weth } = testEnv;

    const tokens = await assetMappings.getAllApprovedTokens();

    const expected = [...defaultAssetMappingAssets];
    expected.splice(expected.indexOf(weth.address), 1);

    for (let i = 0; i < tokens.length; i++) {
      expect(defaultAssetMappingAssets.has(tokens[i])).to.be.equal(
        true,
        "Unexpected token in asset mappings: " + tokens[i]
      );
    }
  });

  it("Adds WETH back to be allowed", async () => {
    const { assetMappings, weth } = testEnv;
    await assetMappings.setAssetAllowed(weth.address, true);

    const numTokens = await assetMappings.getNumApprovedTokens();
    expect(numTokens).to.be.equal(39, "Incorrect number of approved tokens");

    const tokens = await assetMappings.getAllApprovedTokens();

    for (let i = 0; i < tokens.length; i++) {
      expect(defaultAssetMappingAssets.has(tokens[i])).to.be.equal(
        true,
        "Unexpected token in asset mappings: " + tokens[i]
      );
    }
  });

  it("Change VMEX Reserve Factor for an asset", async () => {
    const { assetMappings, usdc } = testEnv;
    await assetMappings.setVMEXReserveFactor(usdc.address, "100000000000000000"); // sets reserve factor to 10%
    expect(
      await assetMappings.getVMEXReserveFactor(usdc.address)
    ).to.be.bignumber.equal(
      oneEther.div(10).toString(),
      "Incorrect VMEX Reserve factor set"
    );

    await expect(
      assetMappings.setVMEXReserveFactor(usdc.address, "1000000000000000000")
    ).to.be.revertedWith(ProtocolErrors.RC_INVALID_RESERVE_FACTOR);

    await expect(
      assetMappings.setVMEXReserveFactor(usdc.address, "1000100000000000000")
    ).to.be.revertedWith(ProtocolErrors.RC_INVALID_RESERVE_FACTOR);
  });

  it("Change borrow enabled for an asset", async () => {
    const { assetMappings, usdc } = testEnv;
    await assetMappings.setBorrowingEnabled(usdc.address, true); // sets reserve factor to 10%
    expect(await assetMappings.getAssetBorrowable(usdc.address)).to.be.equal(
      true
    );

    await assetMappings.setBorrowingEnabled(usdc.address, false); // sets reserve factor to 10%
    expect(await assetMappings.getAssetBorrowable(usdc.address)).to.be.equal(
      false
    );
  });

  it("Add asset mappings for an asset already in the mapping", async () => {
    const { assetMappings, aave } = testEnv;
    const newERC20 = await deployMintableERC20(["MOCK", "MOCK", "18"]);

    const asset = aave.address;

    let initInputParams: {
      asset: string;
      defaultInterestRateStrategyAddress: string;
      supplyCap: BigNumberish; //1,000,000
      borrowCap: BigNumberish; //1,000,000
      baseLTV: BigNumberish;
      liquidationThreshold: BigNumberish;
      liquidationBonus: BigNumberish;
      borrowFactor: BigNumberish;
      borrowingEnabled: boolean;
      assetType: BigNumberish;
      VMEXReserveFactor: BigNumberish;
    }[] = [];

    const newInterestRateStrategy = createRandomAddress();

    initInputParams.push({
      asset: asset,
      defaultInterestRateStrategyAddress: newERC20.address, //so passes isContract test
      assetType: 0,
      supplyCap: 0, //1,000,000
      borrowCap: 0, //1,000,000
      baseLTV: 0,
      liquidationThreshold: 0,
      liquidationBonus: 0,
      borrowFactor: 0,
      borrowingEnabled: false,
      VMEXReserveFactor: 0,
    });

    // adding a new asset mapping should still work
    initInputParams.push({
      asset: newERC20.address,
      defaultInterestRateStrategyAddress: newERC20.address,
      assetType: 0,
      supplyCap: ethers.utils.parseUnits("1000",18), //1,000,000
      borrowCap: ethers.utils.parseUnits("1000",18), //1,000,000
      baseLTV: "100000000000000000",
      liquidationThreshold: "200000000000000000",
      liquidationBonus: "1000100000000000000",
      borrowFactor: "1000000000000000000",
      borrowingEnabled: true,
      VMEXReserveFactor: "100000000000000000",
    });

    await expect(
      assetMappings.addAssetMapping(initInputParams)
    ).to.be.revertedWith(AM_ASSET_ALREADY_IN_MAPPINGS);

    const usdcMapping = await assetMappings.getAssetMapping(asset);
    expect(usdcMapping.supplyCap.toString() != "0").to.be.equal(true);
    expect(usdcMapping.borrowCap.toString() != "0").to.be.equal(true);
    expect(usdcMapping.borrowingEnabled).to.be.equal(false);
  });

  it("Add asset mappings with bad params should revert", async () => {
    const { assetMappings } = testEnv;
    const newERC20 = await deployMintableERC20(["MOCK", "MOCK", "18"]);
    const newAsset = createRandomAddress();
    let initInputParams: {
      asset: string;
      defaultInterestRateStrategyAddress: string;
      supplyCap: BigNumberish; //1,000,000
      borrowCap: BigNumberish; //1,000,000
      baseLTV: BigNumberish;
      liquidationThreshold: BigNumberish;
      liquidationBonus: BigNumberish;
      borrowFactor: BigNumberish;
      borrowingEnabled: boolean;
      assetType: BigNumberish;
      VMEXReserveFactor: BigNumberish;
    }[] = [];

    const newInterestRateStrategy = createRandomAddress();

    initInputParams.push({
      asset: newERC20.address,
      defaultInterestRateStrategyAddress: newERC20.address,
      assetType: 0,
      supplyCap: ethers.utils.parseUnits("1000",18), //1,000,000
      borrowCap: ethers.utils.parseUnits("1000",18), //1,000,000
      baseLTV: "200000000000000000",
      liquidationThreshold: "100000000000000000",
      liquidationBonus: "1000100000000000000",
      borrowFactor: "100000000000000000",
      borrowingEnabled: true,
      VMEXReserveFactor: "100000000000000000",
    });

    await expect(
      assetMappings.addAssetMapping(initInputParams)
    ).to.be.revertedWith(AM_INVALID_CONFIGURATION);
  });

  it("Add asset mappings not contract revert", async () => {
    const { assetMappings } = testEnv;
    const notContract = createRandomAddress();
    const newERC20 = await deployMintableERC20(["MOCK", "MOCK", "18"]);
    let initInputParams: {
      asset: string;
      defaultInterestRateStrategyAddress: string;
      supplyCap: BigNumberish; //1,000,000
      borrowCap: BigNumberish; //1,000,000
      baseLTV: BigNumberish;
      liquidationThreshold: BigNumberish;
      liquidationBonus: BigNumberish;
      borrowFactor: BigNumberish;
      borrowingEnabled: boolean;
      assetType: BigNumberish;
      VMEXReserveFactor: BigNumberish;
    }[] = [];

    const newInterestRateStrategy = createRandomAddress();

    initInputParams.push({
      asset: notContract,
      defaultInterestRateStrategyAddress: newERC20.address,
      assetType: 0,
      supplyCap: ethers.utils.parseUnits("1000",18), //1,000,000
      borrowCap: ethers.utils.parseUnits("1000",18), //1,000,000
      baseLTV: "200000000000000000",
      liquidationThreshold: "100000000000000000",
      liquidationBonus: "1000100000000000000",
      borrowFactor: "100000000000000000",
      borrowingEnabled: true,
      VMEXReserveFactor: "100000000000000000",
    });

    await expect(
      assetMappings.addAssetMapping(initInputParams)
    ).to.be.revertedWith(AM_ASSET_NOT_CONTRACT);
  });

  it("Add asset mappings interest rate strategy not contract revert", async () => {
    const { assetMappings } = testEnv;
    const notContract = createRandomAddress();
    const newERC20 = await deployMintableERC20(["MOCK", "MOCK", "18"]);
    let initInputParams: {
      asset: string;
      defaultInterestRateStrategyAddress: string;
      supplyCap: BigNumberish; //1,000,000
      borrowCap: BigNumberish; //1,000,000
      baseLTV: BigNumberish;
      liquidationThreshold: BigNumberish;
      liquidationBonus: BigNumberish;
      borrowFactor: BigNumberish;
      borrowingEnabled: boolean;
      assetType: BigNumberish;
      VMEXReserveFactor: BigNumberish;
    }[] = [];

    const newInterestRateStrategy = createRandomAddress();

    initInputParams.push({
      asset: newERC20.address,
      defaultInterestRateStrategyAddress: notContract,
      assetType: 0,
      supplyCap: ethers.utils.parseUnits("1000",18), //1,000,000
      borrowCap: ethers.utils.parseUnits("1000",18), //1,000,000
      baseLTV: "200000000000000000",
      liquidationThreshold: "100000000000000000",
      liquidationBonus: "1000100000000000000",
      borrowFactor: "100000000000000000",
      borrowingEnabled: true,
      VMEXReserveFactor: "100000000000000000",
    });

    await expect(
      assetMappings.addAssetMapping(initInputParams)
    ).to.be.revertedWith(AM_INTEREST_STRATEGY_NOT_CONTRACT);
  });

  it("Disallow asset can only happen when there is no outstanding debt in any tranche", async () => {
    const { assetMappings, pool, dai, usdc, users, addressesProvider } = testEnv;
    const tranche = 0;

    expect(defaultAssetMappingAssets.has(dai.address)).to.be.equal(
      true,
      "Incorrect configuration of default asset mappings"
    );

    // user 0 will deposit 1000 dai
    await dai
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "1000"));
    
    await dai
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "1000"));

    await dai
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await dai
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const amountDAItoDeposit = await convertToCurrencyDecimals(
      dai.address,
      "1000"
    );
    
    await pool
      .connect(users[0].signer)
      .deposit(dai.address, tranche, amountDAItoDeposit, users[0].address, "0");
    // user 1 will deposit 1000 weth into the lending pool
    await usdc
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(usdc.address, "1000"));
      console.log("HERE5")
    await usdc
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(users[1].signer)
      .deposit(
        usdc.address,
        tranche,
        await convertToCurrencyDecimals(usdc.address,"1000.0"),
        users[1].address,
        "0"
      );

    // user 1 borrows dai using weth as collateral
    await pool
      .connect(users[1].signer)
      .borrow(
        dai.address,
        tranche,
        ethers.utils.parseEther("0.1"),
        "0",
        users[1].address
      );

    //governance decides to disallow dai
    await assetMappings.setBorrowingEnabled(dai.address, false);
    await assetMappings.configureAssetMapping(dai.address, 0,0,0,0,0,"1000000000000000000");

    await expect(
      assetMappings.setAssetAllowed(dai.address, false)
    ).to.be.revertedWith(AM_UNABLE_TO_DISALLOW_ASSET);

    // user 1 repays all dai debts
    await pool
      .connect(users[1].signer)
      .repay(dai.address, tranche, MAX_UINT_AMOUNT, users[1].address);

    //not all has been withdrawn
    await expect(
      assetMappings.setAssetAllowed(dai.address, false)
    ).to.be.revertedWith(AM_UNABLE_TO_DISALLOW_ASSET);

    await pool
      .connect(users[0].signer)
      .withdraw(dai.address, tranche, MAX_UINT_AMOUNT, users[0].address);
    //tranche admin and global admin also need to withdraw their amount

    await rawBRE.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49"],
    });
    const globalAdmin = await ethers.getSigner("0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49")
    const trancheAdminAdd = await addressesProvider.getTrancheAdmin(tranche)
    const trancheAdmin = await ethers.getSigner(trancheAdminAdd);

    const reserveDat = await pool.connect(users[0].signer).getReserveData(dai.address, tranche);
    const varDebt = await getVariableDebtToken(reserveDat.variableDebtTokenAddress);
    const aToken = await getAToken(reserveDat.aTokenAddress);
    console.log("amount global admin has: ", await aToken.connect(users[0].signer).balanceOf("0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49"))

    console.log("amount tranche admin has: ", await aToken.connect(users[0].signer).balanceOf(trancheAdminAdd))

    console.log("total atokens: ", await aToken.connect(users[0].signer).totalSupply())
    console.log("total debt tokens: ", await varDebt.connect(users[0].signer).totalSupply())
    await users[0].signer.sendTransaction({
      to: globalAdmin.address,
      value: ethers.utils.parseEther("100.0"), // Sends exactly 100.0 ether
    });
    await pool
      .connect(globalAdmin)
      .withdraw(dai.address, tranche, MAX_UINT_AMOUNT, globalAdmin.address);

    await pool
      .connect(trancheAdmin)
      .withdraw(dai.address, tranche, MAX_UINT_AMOUNT, trancheAdminAdd);

    await assetMappings.setAssetAllowed(dai.address, false); //should be allowed now
  });
});
