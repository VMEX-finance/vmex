import { TestEnv, SignerWithAddress } from "./make-suite";
import {
  mint,
  approve,
  deposit,
  borrow,
  withdraw,
  transfer,
  repay,
  setUseAsCollateral,
  swapBorrowRateMode,
  rebalanceStableBorrowRate,
  delegateBorrowAllowance,
} from "./actions";
import { RateMode } from "../../../helpers/types";

import { DRE } from "../../../helpers/misc-utils";

export interface Action {
  name: string;
  args?: any;
  expected: string;
  revertMessage?: string;
}

export interface Story {
  description: string;
  actions: Action[];
}

export interface Scenario {
  title: string;
  description: string;
  stories: Story[];
}

export const executeStory = async (story: Story, testEnv: TestEnv) => {
  for (const action of story.actions) {
    const { users } = testEnv;
    await executeAction(action, users, testEnv);
  }
};

const executeAction = async (
  action: Action,
  users: SignerWithAddress[],
  testEnv: TestEnv
) => {
  const { reserve, tranche, user: userIndex, borrowRateMode } = action.args;
  const { name, expected, revertMessage } = action;

  let myTranche = tranche;
  if (!tranche || tranche === "") {
    // compatibility with old aave tests
    myTranche = "1";
  }

  if (!name || name === "") {
    throw "Action name is missing";
  }
  if (!reserve || reserve === "") {
    throw "Invalid reserve selected for deposit";
  }
  if (!userIndex || userIndex === "") {
    throw `Invalid user selected to deposit into the ${reserve} reserve`;
  }

  if (!expected || expected === "") {
    throw `An expected resut for action ${name} is required`;
  }

  let rateMode: string = RateMode.None;

  if (borrowRateMode) {
    if (borrowRateMode === "none") {
      rateMode = RateMode.None;
    } else if (borrowRateMode === "stable") {
      rateMode = RateMode.Stable;
    } else if (borrowRateMode === "variable") {
      rateMode = RateMode.Variable;
    } else {
      //random value, to test improper selection of the parameter
      rateMode = "4";
    }
  }

  const user = users[parseInt(userIndex)];
  const { addressesProvider } = testEnv;
  const trancheAdmin = await DRE.ethers.getSigner(
    await addressesProvider.getPoolAdmin(myTranche)
  );
  // console.log("$$$$$$$$$ USERS: ",users)

  switch (name) {
    case "mint": //I think this is for minting actual ERC20 tokens, not a tokens
      const { amount } = action.args;

      if (!amount || amount === "") {
        throw `Invalid amount of ${reserve} to mint`;
      }

      await mint(reserve, amount, user, myTranche, testEnv);
      break;

    case "approve":
      await approve(reserve, user, testEnv);
      break;

    case "deposit":
      {
        const {
          amount,
          isCollateral,
          sendValue,
          onBehalfOf: onBehalfOfIndex,
        } = action.args;
        const onBehalfOf = onBehalfOfIndex
          ? users[parseInt(onBehalfOfIndex)].address
          : user.address;

        if (!amount || amount === "") {
          throw `Invalid amount to deposit into the ${reserve} reserve`;
        }
        var myCol = isCollateral === "true";
        if (!isCollateral || isCollateral === "") {
          myCol = true; //if unspecified then assume true
        }

        await deposit(
          reserve,
          myTranche,
          myCol,
          amount,
          user,
          onBehalfOf,
          sendValue,
          expected,
          testEnv,
          revertMessage
        );
      }
      break;

    case "delegateBorrowAllowance":
      {
        const { amount, toUser: toUserIndex } = action.args;
        const toUser = users[parseInt(toUserIndex, 10)].address;
        if (!amount || amount === "") {
          throw `Invalid amount to deposit into the ${reserve} reserve`;
        }

        await delegateBorrowAllowance(
          reserve,
          myTranche,
          amount,
          rateMode,
          user,
          toUser,
          expected,
          testEnv,
          revertMessage
        );
      }
      break;

    case "withdraw":
      {
        const { amount, timeTravel } = action.args;

        if (!amount || amount === "") {
          throw `Invalid amount to withdraw from the ${reserve} reserve`;
        }

        await withdraw(
          reserve,
          myTranche,
          amount,
          user,
          trancheAdmin,
          expected,
          testEnv,
          timeTravel,
          revertMessage
        );
      }
      break;
    // case "transfer":
    //   {
    //     const { amount, originTranche, isCollateral, destTranche } =
    //       action.args;

    //     if (!amount || amount === "") {
    //       throw `Invalid amount to withdraw from the ${reserve} reserve`;
    //     }
    //     var myCol = isCollateral === "true";
    //     if (isCollateral === "") {
    //       myCol = false; //if unspecified then assume false
    //     }

    //     await transfer(
    //       reserve,
    //       originTranche,
    //       destTranche,
    //       amount,
    //       myCol,
    //       user,
    //       expected,
    //       testEnv,
    //       revertMessage
    //     );
    //   }
    //   break;
    case "borrow":
      {
        const { amount, timeTravel, onBehalfOf: onBehalfOfIndex } = action.args;

        const onBehalfOf = onBehalfOfIndex
          ? users[parseInt(onBehalfOfIndex)].address
          : user.address;

        if (!amount || amount === "") {
          throw `Invalid amount to borrow from the ${reserve} reserve`;
        }

        await borrow(
          reserve,
          myTranche,
          trancheAdmin,
          amount,
          rateMode,
          user,
          onBehalfOf,
          timeTravel,
          expected,
          testEnv,
          revertMessage
        );
      }
      break;

    case "repay":
      {
        const { amount, borrowRateMode, sendValue } = action.args;
        let { onBehalfOf: onBehalfOfIndex } = action.args;

        if (!amount || amount === "") {
          throw `Invalid amount to repay into the ${reserve} reserve`;
        }

        let userToRepayOnBehalf: SignerWithAddress;
        if (!onBehalfOfIndex || onBehalfOfIndex === "") {
          console.log(
            "WARNING: No onBehalfOf specified for a repay action. Defaulting to the repayer address"
          );
          userToRepayOnBehalf = user;
        } else {
          userToRepayOnBehalf = users[parseInt(onBehalfOfIndex)];
        }

        await repay(
          reserve,
          myTranche,
          trancheAdmin,
          amount,
          rateMode,
          user,
          userToRepayOnBehalf,
          sendValue,
          expected,
          testEnv,
          revertMessage
        );
      }
      break;

    case "setUseAsCollateral":
      {
        const { useAsCollateral } = action.args;

        if (!useAsCollateral || useAsCollateral === "") {
          throw `A valid value for useAsCollateral needs to be set when calling setUseReserveAsCollateral on reserve ${reserve}`;
        }
        await setUseAsCollateral(
          reserve,
          myTranche,
          user,
          useAsCollateral,
          expected,
          testEnv,
          revertMessage
        );
      }
      break;

    case "swapBorrowRateMode":
      await swapBorrowRateMode(
        reserve,
        myTranche,
        user,
        rateMode,
        expected,
        testEnv,
        revertMessage
      );
      break;

    case "rebalanceStableBorrowRate":
      {
        const { target: targetIndex } = action.args;

        if (!targetIndex || targetIndex === "") {
          throw `A target must be selected when trying to rebalance a stable rate`;
        }
        const target = users[parseInt(targetIndex)];

        await rebalanceStableBorrowRate(
          reserve,
          myTranche,
          user,
          target,
          expected,
          testEnv,
          revertMessage
        );
      }
      break;

    default:
      throw `Invalid action requested: ${name}`;
  }
};
