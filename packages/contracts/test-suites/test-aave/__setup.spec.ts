import rawBRE from "hardhat";
import { MockContract } from "ethereum-waffle";
import {
  insertContractAddressInDb,
  getEthersSigners,
  registerContractInJsonDb,
  getEthersSignersAddresses,
  getContractAddressWithJsonFallback
} from "../../helpers/contracts-helpers";
import {
  buildTestEnv
} from "../../helpers/contracts-deployments";
import { initializeMakeSuite } from "./helpers/make-suite";
import { eEthereumNetwork, eNetwork } from "../../helpers/types";


before(async () => {
  await rawBRE.run("set-DRE");
  const [deployer, secondaryWallet] = await getEthersSigners();
  const FORK = process.env.FORK;

  const network = rawBRE.network.name;
  if(!(network==="localhost")){
    if (FORK) {
      await rawBRE.run("vmex:mainnet", { skipRegistry: true });
    } else {
      console.log("-> Deploying test environment...");
      await buildTestEnv(deployer);
    }
  }

  await initializeMakeSuite();
  console.log("\n***************");
  console.log("Setup and snapshot finished");
  console.log("***************\n");
});
