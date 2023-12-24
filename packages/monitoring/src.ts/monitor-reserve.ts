import {
  getAllMarketsData,
  ReserveSummary,
  ReserveData,
} from "@vmexfinance/sdk";
import { ethers, BigNumber } from "ethers";
import {
  formatAlert,
  getCurrentTime,
  batchSendMessage,
  vmexAlertsDiscordWebhook,
  vmexHeartbeatDiscordWebhook,
} from "./common";

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

const ROUNDING_ERROR = 100;

// failing 6 times in a row means 30 minutes of not receiving data
const RPC_FAIL_THRESHOLD = 6;

// used to cache the last reserve summary: network -> asset -> summary
let lastReserveSummary: Map<string, Map<string, ReserveSummary>> = new Map();
// map of network name -> number of times it failed in a row
let rpcHealth: Map<string, number> = new Map();

function cacheKey(reserve: ReserveSummary): string {
  return `${reserve.asset}:${reserve.tranche}`;
}

function setReserveCache(network: string, reserve: ReserveSummary) {
  if (!lastReserveSummary.has(network)) {
    lastReserveSummary.set(network, new Map());
  }

  lastReserveSummary.get(network).set(cacheKey(reserve), reserve);
}

function reserveCacheExists(network: string, reserve: ReserveSummary) {
  return (
    lastReserveSummary.has(network) &&
    lastReserveSummary.get(network).has(cacheKey(reserve))
  );
}

function getReserveCache(network: string, reserve: ReserveSummary) {
  return lastReserveSummary.get(network).get(cacheKey(reserve));
}

const getReserveString = (reserve: ReserveSummary) => {
  return `Reserve ${reserve.name} (asset=${reserve.asset}, tranche=${reserve.tranche})`;
};

export class MonitorReserves {
  alerts: string[];
  messages: string[];
  networks: string[];

  constructor(networks: string[]) {
    this.messages = [];
    this.alerts = [];
    this.networks = networks;

    const currentTime = getCurrentTime();
    this.messages.push(`Summary for ${currentTime} EST`);
    this.alerts.push(`Summary for ${currentTime} EST`);
  }

  public async monitorAllNetworks() {
    for (let i = 0; i < this.networks.length; i++) {
      await this._tryToMonitorNetwork(this.networks[i]);
    }
  }

  public async sendMessages(dry: boolean = false) {
    console.log(`${getCurrentTime()}: Sending reserve monitoring message`);
    this.messages.push("All monitoring tasks have ran");
    if (dry) {
      console.log("DRY RUN RESULTS:");
      console.log("Got messages:\n\n", this.messages.join("\n\n"));
      console.log("Got alerts:\n\n", this.alerts.join("\n\n"));
    } else {
      await batchSendMessage(
        this.messages.join("\n\n"),
        vmexHeartbeatDiscordWebhook
      );
      if (this.alerts.length > 1) {
        await batchSendMessage(
          this.alerts.join("\n\n"),
          vmexAlertsDiscordWebhook
        );
      }
    }
  }

  private async _tryToMonitorNetwork(network: string): Promise<void> {
    try {
      await this._monitorAllReserves(network);
      rpcHealth[network] = 0;
    } catch (e) {
      console.error(e);
      if (rpcHealth[network] === undefined) {
        rpcHealth[network] = 0;
      }
      rpcHealth[network] += 1;

      if (rpcHealth[network] >= RPC_FAIL_THRESHOLD) {
        this.alerts.push(
          formatAlert(
            `Unable to monitor network ${network}. Failed with error: ${e
              .toString()
              .substring(0, 100)}`,
            3
          )
        );
        rpcHealth[network] = 0;
      }
    }
  }

  private async _monitorAllReserves(network: string) {
    const providerRpc = getProviderRpcUrl(network);
    if (!providerRpc) {
      throw new Error("Provider Rpc is not defined");
    }
    const reservesData = await getAllMarketsData({
      network: network,
      test: false,
      providerRpc: providerRpc,
    });

    if (!reservesData.length) {
      this.alerts.push(
        formatAlert(
          `Monitoring network ${network} received 0 reserves. Fix monitoring code`,
          2
        )
      );
      return;
    }

    const checkedAssets = new Set();
    reservesData.forEach((reserve) => {
      this._checkReserveLockedExceedsDebt(reserve, network);
      this._checkReserveDataInvariants(reserve, network);
      if (!checkedAssets.has(reserve.asset)) {
        this._checkOracle(reserve, network);
        checkedAssets.add(reserve.asset);
      }
      setReserveCache(network, reserve);
    });

    this.messages.push(
      `Finished monitoring ${reservesData.length} reserves on ${network}`
    );
  }

  private _checkReserveLockedExceedsDebt(
    reserve: ReserveSummary,
    network: string
  ) {
    // amount underlying held by aToken >= aToken outstanding supply - debtToken outstanding supply
    // this means the amount underlying the atoken holds must be greater than amount underlying users
    // have claim to less amount underlying users owe

    // the amount we need to pay lenders if all borrowers are liquidated
    let accountsPayable = reserve.totalSupplied.sub(reserve.totalBorrowed);

    if (
      reserve.totalReserves
        .add(reserve.totalStaked)
        .add(ROUNDING_ERROR)
        .lt(accountsPayable)
    ) {
      this.alerts.push(
        formatAlert(
          `
          NETWORK: ${network}
          ${getReserveString(reserve)} lost funds.
          Reserve holds ${reserve.totalReserves.toString()}
          Reserve has staked ${reserve.totalStaked.toString()}
          aTokenSupply (amount protocol owes lenders): ${reserve.totalSupplied.toString()}
          debtTokenSupply (amount borrowers owes protocol): ${reserve.totalBorrowed.toString()}
          deficit: ${accountsPayable.sub(reserve.totalReserves).toString()}
          `,
          1
        )
      );
    }
  }

  private _checkOracle(reserve: ReserveSummary, network: string) {
    if (
      reserveCacheExists(network, reserve) &&
      getReserveCache(network, reserve).currentPriceETH.eq("0") &&
      reserve.currentPriceETH.eq("0")
    ) {
      // oracle for the reserve is down only if fail to get price twice in a row
      this.alerts.push(
        formatAlert(
          `
        NETWORK: ${network}
        Oracle for asset ${reserve.asset} is down. Check configurations and oracle providers.
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
    reserve: ReserveSummary,
    network: string
  ) {
    prevVal.forEach((_, idx: number) => {
      // extra conversion to bignumber since some values come in as numbers
      if (BigNumber.from(prevVal[idx]).gt(BigNumber.from(currVal[idx]))) {
        this.alerts.push(
          formatAlert(
            `
            NETWORK: ${network}
            ${getReserveString(reserve)} has decreasing ${name[idx]}
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
    reserve: ReserveSummary,
    network: string
  ) {
    val.forEach((_, idx: number) => {
      if (BigNumber.from(val[idx]).lt(1)) {
        this.alerts.push(
          formatAlert(
            `
            NETWORK: ${network}
            ${getReserveString(reserve)} has ${name[idx]} < 1
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
    reserve: ReserveSummary,
    network: string
  ) {
    val.forEach((_, idx: number) => {
      if (BigNumber.from(val[idx]).eq(0)) {
        this.alerts.push(
          formatAlert(
            `
            NETWORK: ${network}
            ${getReserveString(reserve)} has ${name[idx]} = 0
            `,
            1
          )
        );
      }
    });
  }

  private _checkReserveDataInvariants(
    reserve: ReserveSummary,
    network: string
  ) {
    const reserveData: ReserveData = reserve.reserveData;
    this._checkGtOne(
      [reserveData.liquidityIndex, reserveData.variableBorrowIndex],
      ["liquidity index", "variable borrow index"],
      reserve,
      network
    );
    this._checkNonZero(
      [reserveData.lastUpdateTimestamp],
      ["timestamp"],
      reserve,
      network
    );

    if (!reserveCacheExists(network, reserve)) {
      return;
    }

    const lastReserveData: ReserveData = getReserveCache(
      network,
      reserve
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
      reserve,
      network
    );
  }
}

function getPnlReportNetwork(network: string): string {
  if (!lastReserveSummary.has(network)) {
    return "";
  }

  const reserves = lastReserveSummary.get(network);
  const pnlReserve: string[] = [];
  let totalPnl = 0;

  reserves.forEach((reserve: ReserveSummary, key) => {
    const accountsPayable = reserve.totalSupplied.sub(reserve.totalBorrowed);
    const accountBalance = reserve.totalReserves.add(reserve.totalStaked);
    if (accountBalance.eq(0) || reserve.totalBorrowed.eq(0)) {
      // reserve is unused or has zero borrowed
      return;
    }

    const price = reserve.currentPriceETH;
    if (!price) {
      pnlReserve.push(`Unable to price ${getReserveString(reserve)}`);
      return;
    }

    if (network != "mainnet") {
      // price is measured in usd
      const underlyingAmount = parseFloat(
        ethers.utils.formatUnits(
          accountBalance.sub(accountsPayable),
          reserve.decimals
        )
      );
      // price has 8 decimals
      const usdAmount = parseFloat(ethers.utils.formatUnits(price, 8));
      const pnl = underlyingAmount * usdAmount;
      totalPnl += pnl;

      if (pnl > 0.001) {
        pnlReserve.push(`${getReserveString(reserve)} has a pnl of $${pnl}`);
      }
    } else {
      // price is measured in eth
      // TODO: NOT IMPLEMENTED
    }
  });

  return (
    `
PnL summary for network ${network}:

Total PnL: $${totalPnl}
` + pnlReserve.join("\n")
  );
}

export function getPnlReport(networks: string[]) {
  const currentTime = getCurrentTime();

  let report = "";
  networks.forEach((network) => {
    report += getPnlReportNetwork(network) + "\n\n";
  });

  return `Report summary on ${currentTime}\n\n` + report;
}
