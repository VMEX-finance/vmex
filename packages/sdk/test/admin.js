const { ethers } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { setGlobalAdmin } = require("../dist/admin");
const { isLocalhost } = require("../dist/utils");
const { getLendingPoolAddressesProvider } = require("../dist/contract-getters");

function setupProviderAndWallets(network) {
  let providerRpc, provider, temp, owner;
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
    ).connect(myprovider); //0th signer
    owner = temp;
    providerRpc = "https://eth-goerli.public.blastapi.io";
  } else if (network == "sepolia") {
    //   providerRpc = `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`;
    providerRpc = `https://eth-sepolia.g.alchemy.com/v2/5NWRSlbQIyFekLZOwicYgcGHyomOPvfg`;
    provider = new ethers.providers.JsonRpcProvider(providerRpc);
    // console.log("Mn", process.env.MNEMONIC)
    owner = ethers.Wallet.fromMnemonic(
      "pumpkin october region table divide dose weasel brain increase away pride fit",
      `m/44'/60'/0'/0/0`
    ).connect(provider); //0th signer
  } else {
    throw new Error("INVALID NETWORK FOR PROVIDER SETUP");
  }

  return [providerRpc, provider, temp, owner];
}

const network = process.env.NETWORK;
const [providerRpc, provider, temp, owner] = setupProviderAndWallets(network);

describe("Admin - set new global admin", () => {
  it("1 - set new global admin", async () => {
    console.log("owner", owner);
    const tx = setGlobalAdmin({
      signer: owner,
      newGlobalAdmin: "0xA4BB85d0E84854e6690925641711f6ebDC7777eB",
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    const lendingPoolAddressesProvider = await getLendingPoolAddressesProvider({
      network: network,
      test: true,
      providerRpc: providerRpc,
      signer: owner,
    });

    const globalAdmin = await lendingPoolAddressesProvider.getGlobalAdmin();

    console.log("success! new admin is", globalAdmin);
    expect(globalAdmin).to.be.eq("0xA4BB85d0E84854e6690925641711f6ebDC7777eB");
  });
});
