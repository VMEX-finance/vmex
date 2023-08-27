import { batchConfigureCollateralParams, isLocalhost, setGlobalAdmin, unverifyTranche, verifyTranche } from "../index";
import dotenv from "dotenv";
import { ethers } from "ethers";
// Load environment variables from .env file
dotenv.config();

function setupProviderAndWallets(network) {
  let providerRpc, provider, owner, temp;
  if (isLocalhost(network)) {
    providerRpc = "http://127.0.0.1:8545";
    provider = new ethers.providers.JsonRpcProvider(providerRpc);
    temp = provider.getSigner(2);
    owner = provider.getSigner(0);
  } else if (network == "goerli") {
    provider = new ethers.providers.AlchemyProvider(
      network,
      process.env.ALCHEMY_KEY
    );
    temp = ethers.Wallet.fromMnemonic(
      process.env.MNEMONIC,
      `m/44'/60'/0'/0/0`
    ).connect(provider); //0th signer
    owner = temp;
    providerRpc = "https://eth-goerli.public.blastapi.io";
  } else if (network == "sepolia") {
    providerRpc = `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`;
    provider = new ethers.providers.JsonRpcProvider(providerRpc);
    owner = ethers.Wallet.fromMnemonic(
      process.env.MNEMONIC,
      `m/44'/60'/0'/0/0`
    ).connect(provider); //0th signer
  } else {
    throw new Error("INVALID NETWORK FOR PROVIDER SETUP");
  }

  return [providerRpc, provider, owner, temp];
}

async function main() {
  const network = process.env.NETWORK;
  const [providerRpc, provider, owner, temp] = setupProviderAndWallets(network);
  let tx, trancheId;
  switch (process.env.FUNCTION) {
    case "set-global-admin":
      const newAdmin = process.env.NEW_ADMIN;
      if (!newAdmin) {
        throw new Error("NEW_ADMIN env varibable not set!")
      }
      tx = await setGlobalAdmin({
        signer: owner,
        newGlobalAdmin: newAdmin,
        network: network,
        test: false,
        providerRpc: providerRpc
      });
      break;
    case "verify-tranche":
      trancheId = process.env.TRANCHE_ID;
      if (!trancheId) {
        throw new Error("TRANCHE_ID env varibable not set!")
      }
      tx = await verifyTranche({
        signer: owner,
        trancheId: Number(trancheId),
        network: network,
        test: false,
        providerRpc: providerRpc
      });
      break;
    case "unverify-tranche":
      trancheId = process.env.TRANCHE_ID;
      if (!trancheId) {
        throw new Error("TRANCHE_ID env varibable not set!")
      }
      tx = await unverifyTranche({
        signer: owner,
        trancheId: Number(trancheId),
        network: network,
        test: false,
        providerRpc: providerRpc
      });
      break;
    case "set-risk-params":
      tx = await batchConfigureCollateralParams({
        signer: owner,
        input: [{
            // address of the aToken to modify risk params of
            underlyingAsset: "0xB8B945779a5b85340eeC8d3F9F8Da00297586336",

            // CHANGE THESE MANUALLY FOR NOW, DO NOT COMMIT TO GIT
            collateralParams: {
                baseLTV: "690000000000000000",
                liquidationThreshold: "770000000000000000",
                liquidationBonus: "1042000000000000000",
                borrowFactor: "1069000000000000000"
            }
        }],
        trancheId: 4,
        network: network,
        test: false,
        providerRpc: providerRpc
      });
      break;
  }

  console.log("Transaction hash:", tx.hash);
  // await getSlotInfo()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
