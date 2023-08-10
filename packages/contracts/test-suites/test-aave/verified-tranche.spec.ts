import BigNumber from 'bignumber.js';

import { DRE, increaseTime } from '../../helpers/misc-utils';
import { APPROVAL_AMOUNT_LENDING_POOL,PERCENTAGE_FACTOR, oneEther } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { makeSuite } from './helpers/make-suite';
import { ProtocolErrors } from '../../helpers/types';
import { getUserData } from './helpers/utils/helpers';

import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { getTrancheAdminT1 } from '../../helpers/contracts-getters';
import { config } from 'process';

const chai = require('chai');

const { expect } = chai;

makeSuite('Verified tranche admins tests', (testEnv) => {
  const { AM_ASSET_DOESNT_EXIST, INVALID_TRANCHE, ALREADY_VERIFIED, TRANCHE_ADMIN_NOT_VERIFIED, CALLER_NOT_GLOBAL_ADMIN, CALLER_NOT_TRANCHE_ADMIN, LPC_CALLER_NOT_EMERGENCY_ADMIN_OR_VERIFIED_TRANCHE } = ProtocolErrors;

  it('Verify tranche 0', async () => {
    const { pool, yvTricrypto2, ayvTricrypto2, configurator, addressesProvider, users } = testEnv;
    await addressesProvider.setTrancheAdmin(users[2].address, 0);
    await expect(configurator.connect(users[2].signer).verifyTranche(0)).revertedWith(CALLER_NOT_GLOBAL_ADMIN)
    await configurator.verifyTranche(0); //verifying tranche to set custom params
    const param0 = await pool.getTrancheParams(0);
    expect(param0.verified).equal(true)
    const param1 = await pool.getTrancheParams(1);
    expect(param1.verified).equal(false)
    await expect(configurator.verifyTranche(0)).revertedWith(ALREADY_VERIFIED)

    await expect(configurator.verifyTranche(2)).to.be.revertedWith(INVALID_TRANCHE)
  });

  it('Test changing collateral params on asset that DNE fails', async () => {
    const { configurator, users } = testEnv;
    await expect(configurator.connect(users[2].signer).batchConfigureCollateralParams([
        {
          underlyingAsset: "0xF29Ff96aaEa6C9A1fBa851f74737f3c069d4f1a9",
          collateralParams: {
            baseLTV: "800000000000000000",
            liquidationThreshold: "825000000000000000",
            liquidationBonus: "1050000000000000000",
            borrowFactor: "1010000000000000000"
          }
        }
      ],
      0
    )).revertedWith(AM_ASSET_DOESNT_EXIST)

  });
  it('Test changing collateral params', async () => {
    const { dai, ayvTricrypto2, configurator, users, assetMappings } = testEnv;
    await expect(configurator.connect(users[3].signer).batchConfigureCollateralParams([
        {
          underlyingAsset: dai.address,
          collateralParams: {
            baseLTV: "800000000000000000",
            liquidationThreshold: "825000000000000000",
            liquidationBonus: "1050000000000000000",
            borrowFactor: "1010000000000000000"
          }
        }
      ],
      0
    )).revertedWith(TRANCHE_ADMIN_NOT_VERIFIED)

    await expect(configurator.connect(users[2].signer).batchConfigureCollateralParams([
      {
        underlyingAsset: dai.address,
        collateralParams: {
          baseLTV: "800000000000000000",
          liquidationThreshold: "825000000000000000",
          liquidationBonus: "1050000000000000000",
          borrowFactor: "1010000000000000000"
        }
      }
    ],
    1
  )).revertedWith(TRANCHE_ADMIN_NOT_VERIFIED)

    await configurator.connect(users[2].signer).batchConfigureCollateralParams([
      {
        underlyingAsset: dai.address,
        collateralParams: {
          baseLTV: "800000000000000000",
          liquidationThreshold: "825000000000000000",
          liquidationBonus: "1050000000000000000",
          borrowFactor: "1010000000000000000"
        }
      }
    ],
    0
    )

    const dai1 = await assetMappings.getParams(dai.address, 0);
    const dai0 = await assetMappings.getParams(dai.address, 1);

    expect(dai0.baseLTV).equal(ethers.utils.parseUnits("7500",14))
    expect(dai0.liquidationThreshold).equal(ethers.utils.parseUnits("8000",14))
    expect(dai0.liquidationBonus).equal(ethers.utils.parseUnits("10500",14))
    expect(dai0.borrowFactor).equal(ethers.utils.parseUnits("10100",14))

    expect(dai1.baseLTV).equal(ethers.utils.parseUnits("8000",14))
    expect(dai1.liquidationThreshold).equal(ethers.utils.parseUnits("8250",14))
    expect(dai1.liquidationBonus).equal(ethers.utils.parseUnits("10500",14))
    expect(dai1.borrowFactor).equal(ethers.utils.parseUnits("10100",14))
  });


  it('Add some more assets to verified tranche 0', async () => {
    const {  assetMappings, yvTricrypto2, configurator, dai, users, pool } = testEnv;

    // await expect(assetMappings.getParams(yvTricrypto2.address, 0)).revertedWith(AM_ASSET_NOT_ALLOWED)

    await expect(configurator.connect(users[5].signer).batchInitReserve(
      [{
        underlyingAsset: yvTricrypto2.address,
          reserveFactor: "100000000000000000",
          canBorrow: false,
          canBeCollateral: true
      }],
    0)).revertedWith(CALLER_NOT_TRANCHE_ADMIN)


    // collateralParams: {
    //   baseLTV: 8000,
    //   liquidationThreshold: 8250,
    //   liquidationBonus: 10500,
    //   borrowFactor: 10100
    // }


    await configurator.connect(users[2].signer).batchInitReserve(
      [{
        underlyingAsset: yvTricrypto2.address,
          reserveFactor: "100000000000000000",
          canBorrow: false,
          canBeCollateral: true
      }],
    0)

    console.log("reserve data: ", await pool.getReserveData(yvTricrypto2.address, 0))


    const yv0 = await assetMappings.getParams(yvTricrypto2.address, 0);
    const dat = await pool.getReserveData(yvTricrypto2.address, 0);
    const expectedInterestAdd = await assetMappings.getInterestRateStrategyAddress(yvTricrypto2.address, 1);

    expect(yv0.baseLTV).equal(ethers.utils.parseUnits("2500",14))
    expect(yv0.liquidationThreshold).equal(ethers.utils.parseUnits("4500",14))
    expect(yv0.liquidationBonus).equal(ethers.utils.parseUnits("11500",14))
    expect(yv0.borrowFactor).equal(ethers.utils.parseUnits("10100",14))
    expect(dat.interestRateStrategyAddress).equal(expectedInterestAdd)

    await configurator.connect(users[2].signer).batchConfigureCollateralParams([
      {
        underlyingAsset: yvTricrypto2.address,
        collateralParams: {
          baseLTV: "800000000000000000",
          liquidationThreshold: "825000000000000000",
          liquidationBonus: "1050000000000000000",
          borrowFactor: "1010000000000000000"
        }
      }
    ],
    0
    )

    const dai1 = await assetMappings.getParams(yvTricrypto2.address, 0);

    expect(dai1.baseLTV).equal(ethers.utils.parseUnits("8000",14))
    expect(dai1.liquidationThreshold).equal(ethers.utils.parseUnits("8250",14))
    expect(dai1.liquidationBonus).equal(ethers.utils.parseUnits("10500",14))
    expect(dai1.borrowFactor).equal(ethers.utils.parseUnits("10100",14))

    //teste that we can't set collateral params for an asset not in the asset mappings
    await expect(configurator.connect(users[2].signer).batchConfigureCollateralParams([
      {
        underlyingAsset: "0x06824df38D1D77eADEB6baFCB03904E27429Ab74", 
        collateralParams: {
          baseLTV: "800000000000000000",
          liquidationThreshold: "825000000000000000",
          liquidationBonus: "1050000000000000000",
          borrowFactor: "1010000000000000000"
        }
      }
    ],
    0
    )).to.be.revertedWith(AM_ASSET_NOT_ALLOWED)


  });

  it('change interest rate strategy address', async () => {
    const { configurator, dai , users, pool } = testEnv;
    //global admin can still set it, it won't affect anything
    // await expect(configurator.setReserveInterestRateStrategyAddress(dai.address, 1, dai.address)).revertedWith(TRANCHE_ADMIN_NOT_VERIFIED);
    await expect(configurator.connect(users[2].signer).setReserveInterestRateStrategyAddress(dai.address, 2, dai.address)).revertedWith(TRANCHE_ADMIN_NOT_VERIFIED);
    await configurator.connect(users[2].signer).setReserveInterestRateStrategyAddress(dai.address, 0, dai.address);

    const dat = await pool.getReserveData(dai.address, 0);

    expect(dat.interestRateStrategyAddress).equal(dai.address);
  });

  it('Unverify tranche', async () => {
    const { configurator, users, pool} = testEnv;
    await expect(configurator.connect(users[3].signer).unverifyTranche(0)).revertedWith(TRANCHE_ADMIN_NOT_VERIFIED);
    await expect(configurator.connect(users[2].signer).unverifyTranche(2)).revertedWith(TRANCHE_ADMIN_NOT_VERIFIED);
    await configurator.connect(users[2].signer).unverifyTranche(0);
    const param0 = await pool.getTrancheParams(0);
    expect(param0.verified).equal(false)
  });


  it('Check that the added assets are back to global admin', async () => {
    const {  assetMappings, yvTricrypto2, configurator, dai, users, pool } = testEnv;


    const dai0 = await assetMappings.getParams(dai.address, 0);
    const daiR = await assetMappings.getInterestRateStrategyAddress(dai.address, 0);
    const expectedInterestAdd = await assetMappings.getInterestRateStrategyAddress(dai.address, 1);

    expect(dai0.baseLTV).equal(ethers.utils.parseUnits("7500",14))
    expect(dai0.liquidationThreshold).equal(ethers.utils.parseUnits("8000",14))
    expect(dai0.liquidationBonus).equal(ethers.utils.parseUnits("10500",14))
    expect(dai0.borrowFactor).equal(ethers.utils.parseUnits("10100",14))
    expect(daiR).equal(expectedInterestAdd)


    const yv0 = await assetMappings.getParams(yvTricrypto2.address, 0);
    const yvTricrypto2R = await assetMappings.getInterestRateStrategyAddress(yvTricrypto2.address, 0);
    const yvTricrypto2expectedInterestAdd = await assetMappings.getInterestRateStrategyAddress(yvTricrypto2.address, 1);

    expect(yv0.baseLTV).equal(ethers.utils.parseUnits("2500",14))
    expect(yv0.liquidationThreshold).equal(ethers.utils.parseUnits("4500",14))
    expect(yv0.liquidationBonus).equal(ethers.utils.parseUnits("11500",14))
    expect(yv0.borrowFactor).equal(ethers.utils.parseUnits("10100",14))
    expect(yvTricrypto2R).equal(yvTricrypto2expectedInterestAdd)
  });
});
