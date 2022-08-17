import { task } from "hardhat/config";
import { exit } from "process";

task(
  `dev:batch-price-feed`,
  `Deploys the VMEX-BatchPriceFeed contract`
).setAction(async ({ verify }, localBRE) => {
  try {
    await localBRE.run("set-DRE");
    if (!localBRE.network.config.chainId) {
      throw new Error("INVALID_CHAIN_ID");
    }
    const network = localBRE.network.name;
  } catch (err) {
    console.error(err);
    exit(1);
  }
});
