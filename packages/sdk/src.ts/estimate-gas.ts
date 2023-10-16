import { BigNumber, BigNumberish, ethers } from "ethers";
import { MAX_UINT_AMOUNT } from "./constants";
import { getIErc20, getIncentivesController, getLendingPool, getVMEXOracle } from "./contract-getters";
import { convertAddressToSymbol, convertSymbolToAddress, convertToCurrencyDecimals, getAssetPrices, getDecimalBase } from "./utils";

async function getGasCostAlchemy(networkAlias: string) {
  let requestQuery;
  switch (networkAlias) {
    case "opt":
      requestQuery = `https://${networkAlias}-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`;
    case "base":
      requestQuery = `https://${networkAlias}-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_BASE_ALCHEMY_KEY}`
    case "arb":
      requestQuery = `https://${networkAlias}-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ARBITRUM_ALCHEMY_KEY}`
    case "sepolia":
      requestQuery = `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_SEPOLIA_ALCHEMY_KEY}`
    case "eth":
      requestQuery = `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_MAINNET_ALCHEMY_KEY}`
  }
  return fetch(
    requestQuery,
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
      return getGasCostAlchemy("sepolia");
    case "optimism_localhost":
    case "optimism":
      return getGasCostAlchemy("opt");
    case "base":
      return getGasCostAlchemy("base");
    case "arbitrum":
      return getGasCostAlchemy("arb");
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
  // catch where this is consumed
  // try {
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
    const token = await getIErc20({
      address: tokenAddress,
      providerRpc: params.providerRpc
    })

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
      const allowance = await token.allowance(client, lendingPool.address)
      if (allowance.lt(amount)) { //approval first
        gasAmount = await token
          .connect(params.signer)
          .estimateGas.approve(
            lendingPool.address,
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          );
      } else {
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
      }
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
    //get eth price
    const prices = await getAssetPrices({
      assets: ["WETH"],
      network: params.network,
      test: params.test,
      providerRpc: params.providerRpc
    })

    // gas cost is in wei
    return gasAmount.mul(await getGasCost(params.network)).mul(prices.get(convertSymbolToAddress("WETH", params.network)).priceUSD).div(ethers.utils.parseEther("1"));
  // } catch (err) {
  //   console.error(err);
  // }
}
