import {
  getAllMarketsData,
  nativeAmountToUSD,
  PRICING_DECIMALS,
  ReserveSummary,
} from "@vmexfinance/sdk";

import { DUNE_API_KEY, NETWORKS, getProviderRpcUrl } from "./common";
import schedule from "node-schedule";
import fetch from "node-fetch";

const DUNE_ENDPOINT = "https://api.dune.com/api/v1/table/upload/csv";

const getNetworkAssetsTVL = async (network: string): Promise<string> => {
  const marketData = await getAllMarketsData({
    network: network,
    test: false,
    providerRpc: getProviderRpcUrl(network),
  });

  let data = "";

  marketData.forEach((r: ReserveSummary) => {
    // TODO: Our FE uses the total supplied as the TVL. we need to figure out what the definition of tvl is
    // it can also be defined as totalSupplied - totalBorrowed
    const tvl = r.totalSupplied;
    const tvlUSD = nativeAmountToUSD(
      tvl,
      PRICING_DECIMALS[network],
      r.decimals,
      r.currentPriceUSD
    );

    data += `${r.name},${tvlUSD}\n`;
  });

  return data;
};

const uploadAssetsTVL = async (networks: string[], upload: boolean = true) => {
  networks.forEach(async (network: string) => {
    const tvlData = await getNetworkAssetsTVL(network);
    console.log(`TVL Data for ${network} is\n${tvlData}`);
    // get more data as needed

    const finalData = tvlData;

    const requestData = {
      table_name: "TODO",
      description: "TODO",
      data: finalData,
    };

    // const response = await fetch(DUNE_ENDPOINT, {
    //   method: "POST",
    //   headers: {
    //     "X-Dune-Api_key": DUNE_API_KEY,
    //   },
    //   body: JSON.stringify(requestData),
    // });
  });
};

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && args[0] === "--run") {
    uploadAssetsTVL(["optimism"]).then(() => {
      console.log("FIRST RUN SUCCESSFUL");
    });
  } else if (args.length && args[0] === "--dry-run") {
    uploadAssetsTVL(["optimism"], false).then(() => {
      console.log("FIRST RUN SUCCESSFUL");
    });
  }

  // run every day at 6 pm CST
  schedule.scheduleJob("00 00 00 * * *", () => {
    uploadAssetsTVL(NETWORKS);
  });
}
