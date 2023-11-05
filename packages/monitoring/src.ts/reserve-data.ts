import {
  getAllMarketsData,
  ReserveSummary,
  PRICING_DECIMALS,
} from "@vmexfinance/sdk";
import dotenv from "dotenv";
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

export function sendAlert(
  message: string,
  severity: number,
  messages: string[]
) {
  let alertMessage = `SEV ${severity} ALERT: ${message}`;
  if (severity <= 1) {
    alertMessage +=
      "\n<@377672785591402496> <@976609805949091911> <@174610463655460865> <@374108299743985676> <@170740980746551296>";
  }
  console.error(alertMessage);
  messages.push(alertMessage);
  // TODO: More alerting depending on severity
}

function sendMessage(message: string) {
  if (!vmexAlertsDiscordWebhook) {
    throw new Error(
      "Vmex discord messages webhook is not defined in env variables"
    );
  }
  const data = typeof message === "string" ? { content: message } : message;
  return new Promise<void>((resolve, reject) => {
    fetch(vmexAlertsDiscordWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Could not send message: ${response.status}`));
        }
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

function checkMarketLockedExceedsDebt(
  market: ReserveSummary,
  network: string,
  messages: string[]
) {
  // amount underlying held by aToken >= aToken outstanding supply - debtToken outstanding supply
  // this means the amount underlying the atoken holds must be greater than amount underlying users
  // have claim to less amount underlying users owe

  // the amount we need to pay lenders if all borrowers are liquidated
  let accountsPayable = market.totalSupplied.sub(market.totalBorrowed);

  if (market.totalReserves.add(market.totalStaked).lt(accountsPayable)) {
    sendAlert(
      `
        NETWORK: ${network}
        Reserve ${market.asset} on tranche ${market.tranche} lost funds.
        Reserve holds ${market.totalReserves.toString()}
        Reserve has staked ${market.totalStaked.toString()}
        aTokenSupply (amount protocol owes lenders): ${market.totalSupplied.toString()}
        debtTokenSupply (amount borrowers owes protocol): ${market.totalBorrowed.toString()}
        deficit: ${accountsPayable.sub(market.totalReserves).toString()}
        `,
      1,
      messages
    );
  }
}

function checkOracle(
  market: ReserveSummary,
  network: string,
  messages: string[]
) {
  if (market.currentPriceETH.eq("0")) {
    // oracle for the market is down
    sendAlert(
      `
      NETWORK: ${network}
      Oracle for asset ${market.asset} is down. Check configurations and oracle providers.
      `,
      2,
      messages
    );
  }
}

export async function monitorAllMarkets(network: string, messages: string[]) {
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
    sendAlert(
      `Monitoring network ${network} received 0 markets. Fix monitoring code`,
      2,
      messages
    );
    return;
  }

  const checkedAssets = new Set();
  marketsData.forEach((market) => {
    checkMarketLockedExceedsDebt(market, network, messages);
    if (!checkedAssets.has(market.asset)) {
      checkOracle(market, network, messages);
      checkedAssets.add(market.asset);
    }
  });

  messages.push(
    `Finished monitoring ${marketsData.length} markets on ${network}`
  );
}

export async function heartbeat(messages: string[]) {
  console.log("Heartbeat: All monitoring tasks have ran");
  messages.push("All monitoring tasks have ran");
  await sendMessage(messages.join("\n\n"));
}

if (require.main === module) {
  const alerts = [];
  monitorAllMarkets("optimism", alerts).then(() =>
    console.log("Done monitoring OP")
  );
  heartbeat(alerts).then(() => console.log("DONE"));
}
