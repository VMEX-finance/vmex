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

    let PriceFeed = await localBRE.ethers.getContractFactory("BatchPriceFeed");
    const priceFeed = await PriceFeed.deploy();
    await priceFeed.deployed();

    console.log(`Deployed Batch PriceFeed Contract to ${priceFeed.address}`);
  } catch (err) {
    console.error(err);
    exit(1);
  }
});
