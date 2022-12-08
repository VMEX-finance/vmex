import { ethers, BigNumber } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import { getLendingPoolConfiguratorProxy, getIErc20Detailed } from "./contract-getters";
import { decodeConstructorBytecode } from "./decode-bytecode";
// import { LendingPoolConfiguratorFactory } from "@vmex/contracts/dist";

/**
 *
 */
export async function approveUnderlyingIfFirstInteraction(
  signer: ethers.Signer,
  underlying: string,
  spender: string
) {
  let _underlying = new ethers.Contract(
    underlying,
    [
      "function approve(address spender, uint256 value) external returns (bool success)",
      "function allowance(address owner, address spender) external view returns (uint256)",
    ],
    signer
  );
  let allowance = await _underlying.connect(signer).allowance(await signer.getAddress(), spender);
  if(allowance.eq(BigNumber.from("0"))){
    return await _underlying.connect(signer).approve(spender, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"); //approves uint256 max
  }
}

export async function getAllTrancheNames(
  params: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
  });

  let trancheIds = (await configurator.totalTranches()).toNumber();
  let x = [...Array(trancheIds).keys()];
  return Promise.all(x.map(async (x) => await configurator.trancheNames(x)));
}


export const convertToCurrencyDecimals = async (
  tokenAddress: string,
  amount: string
) => {
  const token = await getIErc20Detailed(tokenAddress);
  let decimals = (await token.decimals()).toString();

  return ethers.utils.parseUnits(amount, decimals);
};