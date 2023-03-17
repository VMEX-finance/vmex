import BigNumber from "bignumber.js";

import {
  calcExpectedReserveDataAfterBorrow,
  calcExpectedReserveDataAfterDeposit,
  calcExpectedReserveDataAfterRepay,
  calcExpectedReserveDataAfterWithdraw,
  calcExpectedUserDataAfterBorrow,
  calcExpectedUserDataAfterDeposit,
  calcExpectedUserDataAfterRepay,
  calcExpectedUserDataAfterSetUseAsCollateral,
  calcExpectedUserDataAfterWithdraw,
  calculateHF,
  checkAdminAllocation,
} from "./utils/calculations";
import {
  getReserveAddressFromSymbol,
  getReserveData,
  getUserData,
} from "./utils/helpers";

import { convertToCurrencyDecimals } from "../../../helpers/contracts-helpers";
import {
  getAToken,
  getMintableERC20,
  getVariableDebtToken,
} from "../../../helpers/contracts-getters";
import { MAX_UINT_AMOUNT, ONE_YEAR } from "../../../helpers/constants";
import { SignerWithAddress, TestEnv } from "./make-suite";
import {
  advanceTimeAndBlock,
  DRE,
  timeLatest,
  waitForTx,
} from "../../../helpers/misc-utils";

import chai from "chai";
import { ReserveData, UserReserveData } from "./utils/interfaces";
import { ContractReceipt } from "ethers";
import { AToken } from "../../../types/AToken";
import { RateMode, tEthereumAddress } from "../../../helpers/types";

export const logger = function (...args: any[]) {
  if(process.env.DEBUG){
    console.log.apply(console, args);
  }
};

const { expect } = chai;

const almostEqualOrEqual = function (
  this: any,
  expected: ReserveData | UserReserveData,
  actual: ReserveData | UserReserveData
) {
  const keys = Object.keys(actual);

  keys.forEach((key) => {
    if (
      key === "lastUpdateTimestamp" ||
      key === "marketStableRate" ||
      key === "symbol" ||
      key === "aTokenAddress" ||
      key === "decimals" ||
      key === "totalStableDebtLastUpdated" ||
      key === "reserveFactor" ||
      key === "VMEXReserveFactor"
    ) {
      // skipping consistency check on accessory data
      return;
    }

    // if(key === "healthFactor"){
    //   expect(actual[key]).to.be.gte(ethers.utils.parseEther("1")); //expect health factor in these tests to always be greater than or equal to 1
    //   return;
    // }

    this.assert(
      actual[key] != undefined,
      `Property ${key} is undefined in the actual data`
    );
    expect(
      expected[key] != undefined,
      `Property ${key} is undefined in the expected data`
    );

    if (expected[key] == null || actual[key] == null) {
      console.log(
        "Found a undefined value for Key ",
        key,
        " value ",
        expected[key],
        actual[key]
      );
    }

    if (actual[key] instanceof BigNumber) {

      let actualValue = (<BigNumber>actual[key]).decimalPlaces(
        0,
        BigNumber.ROUND_DOWN
      );
      logger("almost equal key is", key)
      let expectedValue = (<BigNumber>expected[key]).decimalPlaces(
        0,
        BigNumber.ROUND_DOWN
      );

      if(key === "healthFactor"){
        const one = new BigNumber(DRE.ethers.utils.parseEther("1").toString())
        logger("actualValue: ",actualValue)
        logger("new BigNumber(DRE.ethers.utils.parseEther(1): ", one)
        this.assert(actualValue.gte(one),
        `expected #{act} to be greater than or equal to #{exp} for property ${key}`,
        `expected #{act} to be greater than or equal #{exp} for property ${key}`,
        actualValue,
        one
        )

        actualValue = actualValue.precision(4); //only can have 4 sig figs since aave rounds to that much with the liquidation threshold
        expectedValue = expectedValue.precision(4);
      }

      this.assert(
        actualValue.eq(expectedValue) ||
          actualValue.plus(1).eq(expectedValue) ||
          actualValue.eq(expectedValue.plus(1)) ||
          actualValue.plus(2).eq(expectedValue) ||
          actualValue.eq(expectedValue.plus(2)) ||
          actualValue.plus(3).eq(expectedValue) ||
          actualValue.eq(expectedValue.plus(3)) ||
          actualValue.plus(4).eq(expectedValue) ||
          actualValue.eq(expectedValue.plus(4)) ||
          actualValue.plus(5).eq(expectedValue) ||
          actualValue.eq(expectedValue.plus(5)) ||
          actualValue.plus(6).eq(expectedValue) ||
          actualValue.eq(expectedValue.plus(6)),
        `expected #{act} to be almost equal or equal #{exp} for property ${key}`,
        `expected #{act} to be almost equal or equal #{exp} for property ${key}`,
        expectedValue.toFixed(0),
        actualValue.toFixed(0)
      );
    } else {
      this.assert(
        actual[key] !== null &&
          expected[key] !== null &&
          actual[key].toString() === expected[key].toString(),
        `expected #{act} to be equal #{exp} for property ${key}`,
        `expected #{act} to be equal #{exp} for property ${key}`,
        expected[key],
        actual[key]
      );
    }
  });
};

chai.use(function (chai: any, utils: any) {
  chai.Assertion.overwriteMethod(
    "almostEqualOrEqual",
    function (original: any) {
      return function (this: any, expected: ReserveData | UserReserveData) {
        const actual = (expected as ReserveData)
          ? <ReserveData>this._obj
          : <UserReserveData>this._obj;

        almostEqualOrEqual.apply(this, [expected, actual]);
      };
    }
  );
});

interface ActionsConfig {
  skipIntegrityCheck: boolean;
}

export const configuration: ActionsConfig = <ActionsConfig>{};

export const mint = async (
  reserveSymbol: string,
  amount: string,
  user: SignerWithAddress,
  trancheId: string,
  testEnv: TestEnv
) => {
  logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");
  logger("minting: ", reserveSymbol);
  const reserve = await getReserveAddressFromSymbol(reserveSymbol);
  logger("reserve address: ", reserve);

  const token = await getMintableERC20(reserve);
  //logger("token address: ",token)

  const {
    aTokenInstance: _,
    reserve: reserveDest,
    userData: userDataBefore,
    reserveData: reserveDataBeforeDest,
  } = await getDataBeforeAction(
    reserveSymbol,
    trancheId,
    user.address,
    testEnv
  );

  logger("Mint " + amount + " to " + user.address);
  logger("Before mint: " + userDataBefore.walletBalance);

  await waitForTx(
    await token
      .connect(user.signer)
      .mint(await convertToCurrencyDecimals(reserve, amount))
  );

  const {
    reserveData: reserveDataAfter,
    userData: userDataAfter,
    timestamp,
  } = await getContractsData(reserve, trancheId, user.address, testEnv);

  logger("After mint: " + userDataAfter.walletBalance);

  logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");
};

export const approve = async (
  reserveSymbol: string,
  user: SignerWithAddress,
  testEnv: TestEnv
) => {
  const { pool } = testEnv;
  const reserve = await getReserveAddressFromSymbol(reserveSymbol);

  const token = await getMintableERC20(reserve);

  await waitForTx(
    await token
      .connect(user.signer)
      .approve(pool.address, "100000000000000000000000000000")
  );
};

export const deposit = async (
  reserveSymbol: string,
  tranche: string,
  isCollateral: boolean,
  amount: string,
  sender: SignerWithAddress,
  onBehalfOf: tEthereumAddress,
  sendValue: string,
  expectedResult: string,
  testEnv: TestEnv,
  revertMessage?: string
) => {
  const { pool } = testEnv;

  const reserve = await getReserveAddressFromSymbol(reserveSymbol);

  const amountToDeposit = await convertToCurrencyDecimals(reserve, amount);

  const txOptions: any = {};

  const { reserveData: reserveDataBefore, userData: userDataBefore } =
    await getContractsData(
      reserve,
      tranche,
      onBehalfOf,
      testEnv,
      sender.address
    );

  if (sendValue) {
    txOptions.value = await convertToCurrencyDecimals(reserve, sendValue);
  }

  logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");

  logger("Deposit " + reserveSymbol + " into " + tranche);
  logger(
    "Before tx: origin reserveDataBefore: ",reserveDataBefore
  );
  logger(
    "Before tx: origin userDataBefore: ",userDataBefore
  );

  // const risk = await pool.getAssetRisk(reserve);
  // logger(reserve + " risk: " + risk + ". Tranche: " + tranche);

  if (expectedResult === "success") {
    const txResult = await waitForTx(
      await pool
        .connect(sender.signer)
        .deposit(reserve, tranche, amountToDeposit, onBehalfOf, "0", txOptions)
    );

    const {
      reserveData: reserveDataAfter,
      userData: userDataAfter,
      timestamp,
    } = await getContractsData(
      reserve,
      tranche,
      onBehalfOf,
      testEnv,
      sender.address
    );

    const { txCost, txTimestamp } = await getTxCostAndTimestamp(txResult);

    const expectedReserveData = calcExpectedReserveDataAfterDeposit(
      amountToDeposit.toString(),
      reserveDataBefore,
      txTimestamp
    );

    const expectedUserReserveData = calcExpectedUserDataAfterDeposit(
      amountToDeposit.toString(),
      reserveDataBefore,
      expectedReserveData,
      userDataBefore,
      txTimestamp,
      timestamp,
      isCollateral,
      txCost
    );

    logger(
      "After deposit: origin reserve: ",reserveDataAfter
    );
    logger("After depost: origin user: ",userDataAfter);

    const userAccountData = await pool.callStatic.getUserAccountData(
      sender.address,
      tranche);

    logger("userAccountData: ", userAccountData);

    logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");

    expectedUserReserveData.healthFactor = await calculateHF(testEnv, tranche, onBehalfOf);

    expectEqual(reserveDataAfter, expectedReserveData);
    expectEqual(userDataAfter, expectedUserReserveData);

    // truffleAssert.eventEmitted(txResult, "Deposit", (ev: any) => {
    //   const {_reserve, _user, _amount} = ev;
    //   return (
    //     _reserve === reserve &&
    //     _user === user &&
    //     new BigNumber(_amount).isEqualTo(new BigNumber(amountToDeposit))
    //   );
    // });
  } else if (expectedResult === "revert") {
    await expect(
      pool
        .connect(sender.signer)
        .deposit(reserve, tranche, amountToDeposit, onBehalfOf, "0", txOptions),
      revertMessage
    ).to.be.reverted;
  }
};

export const withdraw = async (
  reserveSymbol: string,
  tranche: string,
  amount: string,
  user: SignerWithAddress,
  trancheAdmin: SignerWithAddress,
  expectedResult: string,
  testEnv: TestEnv,
  timeTravel: string,
  revertMessage?: string
) => {
  const { pool } = testEnv;

  const {
    aTokenInstance,
    reserve,
    userData: userDataBefore,
    reserveData: reserveDataBefore,
  } = await getDataBeforeAction(reserveSymbol, tranche, user.address, testEnv);

  var {
    aTokenInstance: aTokenInstance1,
    reserve: r1,
    userData: userDataBefore1,
    reserveData: reserveDataBefore1,
  } = await getDataBeforeAction(
    reserveSymbol,
    tranche,
    "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
    testEnv
  );

  logger(
    "Before tx: global vmex admin: ",userDataBefore1
  );

  logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

  var {
    aTokenInstance: aTokenInstance1,
    reserve: r1,
    userData: userDataBefore2,
    reserveData: reserveDataBefore1,
  } = await getDataBeforeAction(
    reserveSymbol,
    tranche,
    trancheAdmin.address,
    testEnv
  );

  logger("Before tx: tranche admin: ",userDataBefore2);

  let amountToWithdraw = "0";

  if (amount !== "-1") {
    amountToWithdraw = (
      await convertToCurrencyDecimals(reserve, amount)
    ).toString();
  } else {
    amountToWithdraw = MAX_UINT_AMOUNT;
  }

  if (expectedResult === "success") {
    const txResult = await waitForTx(
      await pool
        .connect(user.signer)
        .withdraw(reserve, tranche, amountToWithdraw, user.address)
    );

    const { txCost, txTimestamp } = await getTxCostAndTimestamp(txResult);

    if (timeTravel) {
      const secondsToTravel = new BigNumber(timeTravel)
        .multipliedBy(ONE_YEAR)
        .div(365)
        .toNumber();

      await advanceTimeAndBlock(secondsToTravel);
    }

    const {
      reserveData: reserveDataAfter,
      userData: userDataAfter,
      timestamp,
    } = await getContractsData(reserve, tranche, user.address, testEnv);

    const expectedReserveData = calcExpectedReserveDataAfterWithdraw(
      amountToWithdraw,
      reserveDataBefore,
      userDataBefore,
      txTimestamp
    );

    const expectedUserData = calcExpectedUserDataAfterWithdraw(
      amountToWithdraw,
      reserveDataBefore,
      expectedReserveData,
      userDataBefore,
      txTimestamp,
      timestamp,
      txCost
    );

    logger("After withdraw: reserve: ",reserveDataAfter);
    logger("After withdraw: user: ",userDataAfter);

    const userAccountData = await pool.callStatic.getUserAccountData(
      user.address,
      tranche);

    logger("userAccountData: ", JSON.stringify(userAccountData));

    logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

    var {
      reserveData: reserveDataAfter1,
      userData: userDataAfter1,
      timestamp: timestampe1,
    } = await getContractsData(
      reserve,
      tranche,
      "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
      testEnv
    );

    logger(
      "After withdraw: vmex global admin: ",userDataAfter1
    );

    logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

    var {
      reserveData: reserveDataAfter1,
      userData: userDataAfter2,
      timestamp: timestampe1,
    } = await getContractsData(reserve, tranche, trancheAdmin.address, testEnv);

    logger(
      "After withdraw: tranche admin: ",userDataAfter2
    );

    logger("reserveDataBefore: ", reserveDataBefore);

    logger("reserveDataAfter: ", reserveDataAfter);

    logger("expectedReserveData: ", expectedReserveData);

    logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");

    expectedUserData.healthFactor = await calculateHF(testEnv, tranche, user.address);

    expectEqual(reserveDataAfter, expectedReserveData);
    expectEqual(userDataAfter, expectedUserData);

    checkAdminAllocation(userDataBefore1, userDataAfter1, userDataBefore2, userDataAfter2, reserveDataBefore1, reserveDataAfter1);

    // truffleAssert.eventEmitted(txResult, "Redeem", (ev: any) => {
    //   const {_from, _value} = ev;
    //   return (
    //     _from === user && new BigNumber(_value).isEqualTo(actualAmountRedeemed)
    //   );
    // });
  } else if (expectedResult === "revert") {
    await expect(
      pool
        .connect(user.signer)
        .withdraw(reserve, tranche, amountToWithdraw, user.address),
      revertMessage
    ).to.be.reverted;
  }
};

export const delegateBorrowAllowance = async (
  reserve: string,
  tranche: string,
  amount: string,
  interestRateMode: string,
  user: SignerWithAddress,
  receiver: tEthereumAddress,
  expectedResult: string,
  testEnv: TestEnv,
  revertMessage?: string
) => {
  const { pool } = testEnv;

  const reserveAddress: tEthereumAddress = await getReserveAddressFromSymbol(
    reserve
  );

  const amountToDelegate: string = await (
    await convertToCurrencyDecimals(reserveAddress, amount)
  ).toString();

  const reserveData = await pool.getReserveData(reserveAddress, tranche);

  const debtToken = await getVariableDebtToken(reserveData.variableDebtTokenAddress);

  const delegateAllowancePromise = debtToken
    .connect(user.signer)
    .approveDelegation(receiver, amountToDelegate);

  if (expectedResult === "revert" && revertMessage) {
    await expect(delegateAllowancePromise, revertMessage).to.be.revertedWith(
      revertMessage
    );
    return;
  } else {
    await waitForTx(await delegateAllowancePromise);
    const allowance = await debtToken.borrowAllowance(user.address, receiver);
    expect(allowance.toString()).to.be.equal(
      amountToDelegate,
      "borrowAllowance is set incorrectly"
    );
  }
};

export const borrow = async (
  reserveSymbol: string,
  tranche: string,
  trancheAdmin: SignerWithAddress,
  amount: string,
  interestRateMode: string,   // TODO: not used
  user: SignerWithAddress,
  onBehalfOf: tEthereumAddress,
  timeTravel: string,
  expectedResult: string,
  testEnv: TestEnv,
  revertMessage?: string
) => {
  const { pool } = testEnv;

  const reserve = await getReserveAddressFromSymbol(reserveSymbol);

  const { reserveData: reserveDataBefore, userData: userDataBefore } =
    await getContractsData(reserve, tranche, onBehalfOf, testEnv, user.address);

  const amountToBorrow = await convertToCurrencyDecimals(reserve, amount);

  logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");

  logger("Borrow from " + tranche);
  logger("Before tx: reserve: ",reserveDataBefore);
  logger("Before tx: user: ",userDataBefore);

  // logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

  var {
    userData: userDataBefore1,
    reserveData: reserveDataBefore1,
  } = await getDataBeforeAction(
    reserveSymbol,
    tranche,
    "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
    testEnv
  );

  logger(
    "Before tx: global vmex admin: ",userDataBefore1
  );

  logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

  var {
    userData: userDataBefore2,
    reserveData: reserveDataBefore2,
  } = await getDataBeforeAction(
    reserveSymbol,
    tranche,
    trancheAdmin.address,
    testEnv
  );

  logger("Before tx: tranche admin: ",userDataBefore2);

  if (expectedResult === "success") {
    const txResult = await waitForTx(
      await pool
        .connect(user.signer)
        .borrow(
          reserve,
          tranche,
          amountToBorrow,
          "0",
          onBehalfOf
        )
    );

    const { txCost, txTimestamp } = await getTxCostAndTimestamp(txResult);

    if (timeTravel) {
      const secondsToTravel = new BigNumber(timeTravel)
        .multipliedBy(ONE_YEAR)
        .div(365)
        .toNumber();

      await advanceTimeAndBlock(secondsToTravel);
    }

    const {
      reserveData: reserveDataAfter,
      userData: userDataAfter,
      timestamp,
    } = await getContractsData(
      reserve,
      tranche,
      onBehalfOf,
      testEnv,
      user.address
    );

    const expectedReserveData = calcExpectedReserveDataAfterBorrow(
      amountToBorrow.toString(),
      RateMode.Variable,
      reserveDataBefore,
      userDataBefore,
      txTimestamp,
      timestamp
    );

    const expectedUserData = calcExpectedUserDataAfterBorrow(
      amountToBorrow.toString(),
      RateMode.Variable,
      reserveDataBefore,
      expectedReserveData,
      userDataBefore,
      txTimestamp,
      timestamp
    );

    logger("After borrow: reserve: ",reserveDataAfter);
    logger("After borrow: user: ",userDataAfter);

    logger("After borrow: expectedUserData: ",expectedUserData);
    // const userAccountData = await pool.callStatic.getUserAccountData(
    //   user.address,
    //   tranche);

    // logger("userAccountData: ", JSON.stringify(userAccountData));

    // logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

    var {
      reserveData: reserveDataAfter1,
      userData: userDataAfter1,
    } = await getContractsData(
      reserve,
      tranche,
      "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
      testEnv
    );

    logger(
      "After borrow: vmex global admin: ",userDataAfter1
    );

    logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

    var {
      reserveData: reserveDataAfter2,
      userData: userDataAfter2,
    } = await getContractsData(reserve, tranche, trancheAdmin.address, testEnv);

    logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");


    expectedUserData.healthFactor = await calculateHF(testEnv, tranche, onBehalfOf);
    expectEqual(reserveDataAfter, expectedReserveData);
    expectEqual(userDataAfter, expectedUserData);
    checkAdminAllocation(userDataBefore1, userDataAfter1, userDataBefore2, userDataAfter2, reserveDataBefore1, reserveDataAfter1);


  } else if (expectedResult === "revert") {
    await expect(
      pool
        .connect(user.signer)
        .borrow(
          reserve,
          tranche,
          amountToBorrow,
          "0",
          onBehalfOf
        ),
      revertMessage
    ).to.be.reverted;
  }
};

export const repay = async (
  reserveSymbol: string,
  tranche: string,
  trancheAdmin: SignerWithAddress,
  amount: string,
  rateMode: string,
  user: SignerWithAddress,
  onBehalfOf: SignerWithAddress,
  sendValue: string,
  expectedResult: string,
  testEnv: TestEnv,
  revertMessage?: string
) => {
  const { pool } = testEnv;
  const reserve = await getReserveAddressFromSymbol(reserveSymbol);

  const { reserveData: reserveDataBefore, userData: userDataBefore } =
    await getContractsData(reserve, tranche, onBehalfOf.address, testEnv);

  logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");

  logger("Repay in " + tranche);
  logger("Before tx: reserve: ",reserveDataBefore);
  logger("Before tx: user: ",userDataBefore);

  logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

  var {
    aTokenInstance: aTokenInstance1,
    reserve: r1,
    userData: userDataBefore1,
    reserveData: reserveDataBefore1,
  } = await getDataBeforeAction(
    reserveSymbol,
    tranche,
    "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
    testEnv
  );

  logger(
    "Before tx: global vmex admin: ",userDataBefore1
  );

  logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

  var {
    aTokenInstance: aTokenInstance1,
    reserve: r1,
    userData: userDataBefore2,
    reserveData: reserveDataBefore1,
  } = await getDataBeforeAction(
    reserveSymbol,
    tranche,
    trancheAdmin.address,
    testEnv
  );

  logger("Before tx: tranche admin: ",userDataBefore2);

  let amountToRepay = "0";

  if (amount !== "-1") {
    amountToRepay = (
      await convertToCurrencyDecimals(reserve, amount)
    ).toString();
  } else {
    amountToRepay = MAX_UINT_AMOUNT;
  }
  amountToRepay = "0x" + new BigNumber(amountToRepay).toString(16);

  const txOptions: any = {};

  if (sendValue) {
    const valueToSend = await convertToCurrencyDecimals(reserve, sendValue);
    txOptions.value = "0x" + new BigNumber(valueToSend.toString()).toString(16);
  }

  if (expectedResult === "success") {
    const txResult = await waitForTx(
      await pool
        .connect(user.signer)
        .repay(
          reserve,
          tranche,
          amountToRepay,
          onBehalfOf.address,
          txOptions
        )
    );

    const { txCost, txTimestamp } = await getTxCostAndTimestamp(txResult);

    const {
      reserveData: reserveDataAfter,
      userData: userDataAfter,
      timestamp,
    } = await getContractsData(reserve, tranche, onBehalfOf.address, testEnv);

    const expectedReserveData = calcExpectedReserveDataAfterRepay(
      amountToRepay,
      <RateMode>RateMode.Variable,
      reserveDataBefore,
      userDataBefore,
      txTimestamp,
      timestamp
    );

    const expectedUserData = calcExpectedUserDataAfterRepay(
      amountToRepay,
      <RateMode>RateMode.Variable,
      reserveDataBefore,
      expectedReserveData,
      userDataBefore,
      user.address,
      onBehalfOf.address,
      txTimestamp,
      timestamp
    );

    logger("After repay: reserve: ",reserveDataAfter);
    logger("After repay: user: ",userDataAfter);

    logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

    var {
      reserveData: reserveDataAfter1,
      userData: userDataAfter1,
      timestamp: timestampe1,
    } = await getContractsData(
      reserve,
      tranche,
      "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
      testEnv
    );

    logger(
      "After repay: vmex global admin: ",userDataAfter1
    );

    logger("\n!!!!!!!!!!!!!!!!!!!!!\n");

    var {
      reserveData: reserveDataAfter1,
      userData: userDataAfter2,
      timestamp: timestampe1,
    } = await getContractsData(reserve, tranche, trancheAdmin.address, testEnv);

    logger(
      "After repay: tranche admin: ",userDataAfter2
    );

    logger("reserveDataBefore: ", reserveDataBefore);

    logger("reserveDataAfter: ", reserveDataAfter);

    logger("expectedReserveData: ", expectedReserveData);

    logger("userDataAfter: ", userDataAfter);

    logger("expectedUserData: ", expectedUserData);

    logger("\n@@@@@@@@@@@@@@@@@@@@@@\n");
    expectedUserData.healthFactor = await calculateHF(testEnv, tranche, onBehalfOf.address);

    expectEqual(reserveDataAfter, expectedReserveData);
    expectEqual(userDataAfter, expectedUserData);
    checkAdminAllocation(userDataBefore1, userDataAfter1, userDataBefore2, userDataAfter2, reserveDataBefore1, reserveDataAfter1);
  } else if (expectedResult === "revert") {
    await expect(
      pool
        .connect(user.signer)
        .repay(
          reserve,
          tranche,
          amountToRepay,
          onBehalfOf.address,
          txOptions
        ),
      revertMessage
    ).to.be.reverted;
  }
};

export const setUseAsCollateral = async (
  reserveSymbol: string,
  tranche: string,
  user: SignerWithAddress,
  useAsCollateral: string,
  expectedResult: string,
  testEnv: TestEnv,
  revertMessage?: string
) => {
  const { pool } = testEnv;

  const reserve = await getReserveAddressFromSymbol(reserveSymbol);

  const { reserveData: reserveDataBefore, userData: userDataBefore } =
    await getContractsData(reserve, tranche, user.address, testEnv);

  const useAsCollateralBool = useAsCollateral.toLowerCase() === "true";

  if (expectedResult === "success") {
    const txResult = await waitForTx(
      await pool
        .connect(user.signer)
        .setUserUseReserveAsCollateral(reserve, tranche, useAsCollateralBool)
    );

    const { txCost } = await getTxCostAndTimestamp(txResult);

    const { userData: userDataAfter } = await getContractsData(
      reserve,
      tranche,
      user.address,
      testEnv
    );

    const expectedUserData = calcExpectedUserDataAfterSetUseAsCollateral(
      useAsCollateral.toLocaleLowerCase() === "true",
      reserveDataBefore,
      userDataBefore,
      txCost
    );
    expectedUserData.healthFactor = await calculateHF(testEnv, tranche, user.address);

    expectEqual(userDataAfter, expectedUserData);
    // if (useAsCollateralBool) {
    //   truffleAssert.eventEmitted(txResult, 'ReserveUsedAsCollateralEnabled', (ev: any) => {
    //     const {_reserve, _user} = ev;
    //     return _reserve === reserve && _user === user;
    //   });
    // } else {
    //   truffleAssert.eventEmitted(txResult, 'ReserveUsedAsCollateralDisabled', (ev: any) => {
    //     const {_reserve, _user} = ev;
    //     return _reserve === reserve && _user === user;
    //   });
    // }
  } else if (expectedResult === "revert") {
    await expect(
      pool
        .connect(user.signer)
        .setUserUseReserveAsCollateral(reserve, tranche, useAsCollateralBool),
      revertMessage
    ).to.be.reverted;
  }
};

const expectEqual = (
  actual: UserReserveData | ReserveData,
  expected: UserReserveData | ReserveData
) => {
  if (!configuration.skipIntegrityCheck) {
    // @ts-ignore
    expect(actual).to.be.almostEqualOrEqual(expected);
  }
};

interface ActionData {
  reserve: string;
  reserveData: ReserveData;
  userData: UserReserveData;
  aTokenInstance: AToken;
}

const getDataBeforeAction = async (
  reserveSymbol: string,
  tranche: string,
  user: tEthereumAddress,
  testEnv: TestEnv
): Promise<ActionData> => {
  const reserve = await getReserveAddressFromSymbol(reserveSymbol);

  const { reserveData, userData } = await getContractsData(
    reserve,
    tranche,
    user,
    testEnv
  );

  //logger("after getContractsData: ", reserveData)
  const aTokenInstance = await getAToken(reserveData.aTokenAddress);
  return {
    reserve,
    reserveData,
    userData,
    aTokenInstance,
  };
};

export const getTxCostAndTimestamp = async (tx: ContractReceipt) => {
  if (!tx.blockNumber || !tx.transactionHash || !tx.cumulativeGasUsed) {
    throw new Error("No tx blocknumber");
  }
  const txTimestamp = new BigNumber(
    (await DRE.ethers.provider.getBlock(tx.blockNumber)).timestamp
  );

  const txInfo = await DRE.ethers.provider.getTransaction(tx.transactionHash);
  const txCost = new BigNumber(tx.cumulativeGasUsed.toString()).multipliedBy(
    txInfo.gasPrice.toString()
  );

  return { txCost, txTimestamp };
};

export const getContractsData = async (
  reserve: string,
  tranche: string,
  user: string,
  testEnv: TestEnv,
  sender?: string
) => {
  const { pool, helpersContract } = testEnv;

  const [userData, reserveData, timestamp] = await Promise.all([
    getUserData(pool, helpersContract, reserve, tranche, user, sender || user),
    getReserveData(helpersContract, reserve, tranche),
    timeLatest(),
  ]);

  return {
    reserveData,
    userData,
    timestamp: new BigNumber(timestamp),
  };
};
