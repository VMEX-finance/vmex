import {
  getAllMarketsData,
  ReserveSummary,
  PRICING_DECIMALS,
  ReserveData,
} from "@vmexfinance/sdk";
import dotenv from "dotenv";
import { BigNumber } from "ethers";
import { formatAlert, sendMessage } from "./common";
dotenv.config();

export function getProviderRpcUrl(network: string): string {
  if (network == "sepolia") {
    return "https://eth-sepolia.public.blastapi.io";
  } else if (network == "optimism") {
    return `https://optimism.llamarpc.com/rpc/${process.env.REACT_APP_LLAMA_RPC_KEY}`;
  } else if (network == "base") {
    return `https://base-mainnet.public.blastapi.io`;
  } else if (network == "arbitrum") {
    return `https://arbitrum-one.public.blastapi.io`;
  }

  return "";
}

const vmexAlertsDiscordWebhook = process.env.DISCORD_ALERTS_WEBHOOK_URL;
const vmexHeartbeatDiscordWebhook = process.env.DISCORD_HEARTBEAT_WEBHOOK_URL;
const ROUNDING_ERROR = 100;

// used to cache the last reserve summary: network -> asset -> summary
let lastReserveSummary: Map<string, Map<string, ReserveSummary[]>> = new Map();

function cacheKey(reserve: ReserveSummary): string {
  return `${reserve.asset}:${reserve.tranche}`;
}

function setReserveCache(network: string, reserve: ReserveSummary) {
  if (!lastReserveSummary[network]) {
    lastReserveSummary[network] = new Map();
  }

  // console.log("setting reserve cache for", network, reserve.asset)
  if (lastReserveSummary[network][cacheKey(reserve)]) {
    console.log("overwritting for ", network, cacheKey(reserve));
  }
  lastReserveSummary[network][cacheKey(reserve)] = reserve;
}

function reserveCacheExists(network: string, reserve: ReserveSummary) {
  return (
    lastReserveSummary[network] &&
    lastReserveSummary[network][cacheKey(reserve)]
  );
}

function getReserveCache(network: string, reserve: ReserveSummary) {
  return lastReserveSummary[network][cacheKey(reserve)];
}

export class MonitorReserves {
  alerts: string[];
  messages: string[];
  networks: string[];

  constructor(networks: string[]) {
    this.messages = [];
    this.alerts = [];
    this.networks = networks;

    const currentDate = new Date();
    this.messages.push(`Summary for ${currentDate.toString()}`);
    this.alerts.push(`Summary for ${currentDate.toString()}`);
  }

  public async monitorAllNetworks() {
    for (let i = 0; i < this.networks.length; i++) {
      await this._tryToMonitorNetwork(this.networks[i]);
    }
  }

  public async sendMessages(dry: boolean = false) {
    this.messages.push("All monitoring tasks have ran");
    if (dry) {
      console.log("Got messages:\n\n", this.messages.join("\n\n"));
      console.log("Got alerts:\n\n", this.alerts.join("\n\n"));
    } else {
      await sendMessage(
        this.messages.join("\n\n"),
        vmexHeartbeatDiscordWebhook
      );
      if (this.alerts.length > 1) {
        await sendMessage(this.alerts.join("\n\n"), vmexAlertsDiscordWebhook);
      }
    }
  }

  private async _tryToMonitorNetwork(network: string): Promise<void> {
    try {
      await this._monitorAllMarkets(network);
    } catch (e) {
      console.error(e);
      this.alerts.push(
        formatAlert(
          `Unable to monitor network ${network}. Failed with error: ${e
            .toString()
            .substring(0, 100)}`,
          3
        )
      );
    }
  }

  private async _monitorAllMarkets(network: string) {
    const providerRpc = getProviderRpcUrl(network);
    if (!providerRpc) {
      throw new Error("Provider Rpc is not defined");
    }
    const marketsData = await getAllMarketsData({
      network: network,
      test: false,
      providerRpc: providerRpc,
    });

    if (!marketsData.length) {
      this.alerts.push(
        formatAlert(
          `Monitoring network ${network} received 0 markets. Fix monitoring code`,
          2
        )
      );
      return;
    }

    const checkedAssets = new Set();
    marketsData.forEach((market) => {
      this._checkMarketLockedExceedsDebt(market, network);
      this._checkReserveDataInvariants(market, network);
      if (!checkedAssets.has(market.asset)) {
        this._checkOracle(market, network);
        checkedAssets.add(market.asset);
      }
      setReserveCache(network, market);
    });

    this.messages.push(
      `Finished monitoring ${marketsData.length} markets on ${network}`
    );
  }

  private _checkMarketLockedExceedsDebt(
    market: ReserveSummary,
    network: string
  ) {
    // amount underlying held by aToken >= aToken outstanding supply - debtToken outstanding supply
    // this means the amount underlying the atoken holds must be greater than amount underlying users
    // have claim to less amount underlying users owe

    // the amount we need to pay lenders if all borrowers are liquidated
    let accountsPayable = market.totalSupplied.sub(market.totalBorrowed);

    if (
      market.totalReserves
        .add(market.totalStaked)
        .add(ROUNDING_ERROR)
        .lt(accountsPayable)
    ) {
      this.alerts.push(
        formatAlert(
          `
          NETWORK: ${network}
          Reserve ${market.asset} on tranche ${market.tranche} lost funds.
          Reserve holds ${market.totalReserves.toString()}
          Reserve has staked ${market.totalStaked.toString()}
          aTokenSupply (amount protocol owes lenders): ${market.totalSupplied.toString()}
          debtTokenSupply (amount borrowers owes protocol): ${market.totalBorrowed.toString()}
          deficit: ${accountsPayable.sub(market.totalReserves).toString()}
          `,
          1
        )
      );
    }
  }

  private _checkOracle(market: ReserveSummary, network: string) {
    if (
      reserveCacheExists(network, market) &&
      getReserveCache(network, market).currentPriceETH.eq("0") &&
      market.currentPriceETH.eq("0")
    ) {
      // oracle for the market is down only if fail to get price twice in a row
      this.alerts.push(
        formatAlert(
          `
        NETWORK: ${network}
        Oracle for asset ${market.asset} is down. Check configurations and oracle providers.
        `,
          3
        )
      );
    }
  }

  private _checkIncreasing(
    prevVal: BigNumber[],
    currVal: BigNumber[],
    name: string[],
    market: ReserveSummary,
    network: string
  ) {
    prevVal.forEach((_, idx: number) => {
      // extra conversion to bignumber since some values come in as numbers
      if (BigNumber.from(prevVal[idx]).gt(BigNumber.from(currVal[idx]))) {
        this.alerts.push(
          formatAlert(
            `
            NETWORK: ${network}
            Reserve (asset=${market.asset}, tranche=${market.tranche}) has decreasing ${name[idx]}
            Last ${name[idx]} = ${prevVal[idx]}
            Current ${name[idx]} = ${currVal[idx]}
            `,
            1
          )
        );
      }
    });
  }

  private _checkGtOne(
    val: BigNumber[],
    name: string[],
    market: ReserveSummary,
    network: string
  ) {
    val.forEach((_, idx: number) => {
      if (BigNumber.from(val[idx]).lt(1)) {
        this.alerts.push(
          formatAlert(
            `
            NETWORK: ${network}
            Reserve (asset=${market.asset}, tranche=${market.tranche}) has ${name[idx]} < 1
            Current ${name[idx]} = ${val[idx]}
            `,
            1
          )
        );
      }
    });
  }

  private _checkNonZero(
    val: BigNumber[],
    name: string[],
    market: ReserveSummary,
    network: string
  ) {
    val.forEach((_, idx: number) => {
      if (BigNumber.from(val[idx]).eq(0)) {
        this.alerts.push(
          formatAlert(
            `
            NETWORK: ${network}
            Reserve (asset=${market.asset}, tranche=${market.tranche}) has ${name[idx]} = 0
            `,
            1
          )
        );
      }
    });
  }

  private _checkReserveDataInvariants(market: ReserveSummary, network: string) {
    const reserveData: ReserveData = market.reserveData;
    this._checkGtOne(
      [reserveData.liquidityIndex, reserveData.variableBorrowIndex],
      ["liquidity index", "variable borrow index"],
      market,
      network
    );
    this._checkNonZero(
      [reserveData.lastUpdateTimestamp],
      ["timestamp"],
      market,
      network
    );

    if (!reserveCacheExists(network, market)) {
      return;
    }

    const lastReserveData: ReserveData = getReserveCache(
      network,
      market
    ).reserveData;

    // check indicies
    this._checkIncreasing(
      [
        lastReserveData.liquidityIndex,
        lastReserveData.variableBorrowIndex,
        lastReserveData.lastUpdateTimestamp,
      ],
      [
        reserveData.liquidityIndex,
        reserveData.variableBorrowIndex,
        reserveData.lastUpdateTimestamp,
      ],
      ["liquidity index", "variable borrow index", "timestamp"],
      market,
      network
    );
  }
}

// if (require.main === module) {
//   const alerts = [];
//   const messages = [];
//   monitorAllMarkets("optimism", alerts, messages).then(() =>
//     console.log("Done monitoring OP")
//   );
//   heartbeat(alerts, messages).then(() => console.log("DONE"));
// }
