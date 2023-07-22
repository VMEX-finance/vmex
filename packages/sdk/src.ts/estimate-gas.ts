import { BigNumber, BigNumberish, ethers } from "ethers";
import { MAX_UINT_AMOUNT } from "./constants";
import { getIncentivesController, getLendingPool } from "./contract-getters";
import { convertSymbolToAddress, convertToCurrencyDecimals } from "./utils";

async function getGasCostAlchemy(networkAlias: string) {
  return fetch(
    `https://${networkAlias}-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        id: 1,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // return the amount of wei per gas
      return BigNumber.from(res.result);
    });
}

export async function getGasCost(network: string): Promise<BigNumberish> {
  switch (network) {
    case "localhost":
    case "mainnet":
      return getGasCostAlchemy("eth");
    case "sepolia":
    case "goerli":
      return getGasCostAlchemy("eth");

    case "optimism_localhost":
    case "optimism":
      return getGasCostAlchemy("opt");
  }

  console.error("Could not get gas cost of network: ", network);
  return 0;
}

// TODO: continue implementing every function in this
export async function estimateGas(params: {
  function: "supply" | "borrow" | "withdraw" | "repay" | "claimRewards";
  providerRpc?: string;
  signer: ethers.Signer;
  network: string;
  amount?: number | ethers.BigNumberish;
  isMax?: boolean;
  test?: boolean;
  asset?: string;
  trancheId?: number;
  underlying?: string;
  referrer?: number;
  // incentives params
  incentivizedAssets?: string[];
  to?: string;
}) {
  try {
    const client = await params.signer.getAddress();
    let tokenAddress = "";
    let amount;
    if (params.asset || params.underlying) {
      if (!params.amount || params.amount === "N/A") return BigNumber.from("0");
      tokenAddress = convertSymbolToAddress(
        params.asset || params.underlying,
        params.network
      );
      amount = await convertToCurrencyDecimals(
        tokenAddress,
        params.amount.toString(),
        params.test,
        params.providerRpc
      );
    }

    const lendingPool = await getLendingPool({
      signer: params.signer,
      network: params.network,
      test: params.test,
      providerRpc: params.providerRpc,
    });
    const incentivesController = await getIncentivesController({
      signer: params.signer,
      network: params.network,
      test: params.test,
      providerRpc: params.providerRpc,
    });
    let gasAmount = BigNumber.from("0");
    const optionalParams = params.test ? { gasLimit: "8000000" } : {};
    switch (params.function) {
      case "supply":
        gasAmount = await lendingPool
          .connect(params.signer)
          .estimateGas.deposit(
            tokenAddress,
            params.trancheId,
            amount,
            client,
            params.referrer || 0,
            optionalParams
          );
        break;
      case "borrow":
        gasAmount = await lendingPool
          .connect(params.signer)
          .estimateGas.borrow(
            tokenAddress,
            params.trancheId,
            amount,
            params.referrer || 0,
            client,
            optionalParams
          );
        break;
      case "withdraw":
        gasAmount = await lendingPool
          .connect(params.signer)
          .estimateGas.withdraw(
            tokenAddress,
            params.trancheId,
            params.isMax ? MAX_UINT_AMOUNT : amount,
            client,
            optionalParams
          );
        break;
      case "repay":
        gasAmount = await lendingPool
          .connect(params.signer)
          .estimateGas.repay(
            tokenAddress,
            params.trancheId,
            params.isMax ? MAX_UINT_AMOUNT : amount,
            client,
            optionalParams
          );
        break;
      case "claimRewards":
        gasAmount = await incentivesController
          .connect(params.signer)
          .estimateGas.claimAllRewards(params.incentivizedAssets, params.to);
        break;
    }
    console.log("function", params.function, "has gasamount", gasAmount.toHexString())
    return gasAmount.mul(await getGasCost(params.network));
  } catch (err) {
    console.error(err);
  }
}
