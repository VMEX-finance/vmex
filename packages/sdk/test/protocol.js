const { ethers, BigNumber } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const {
  setIncentives,
  supply,
  claimIncentives,
  getUserIncentives,
} = require("../dist/protocol.js");

const {
  getAssetPrices,
  convertSymbolToAddress,
  increaseTime,
} = require("../dist/utils");
const {
  getLendingPool,
  getIncentivesController,
} = require("../dist/contract-getters.js");

const network = process.env.NETWORK;
const USDCaddr = convertSymbolToAddress("USDC", network);
const WETHaddr = convertSymbolToAddress("WETH", network);
const DAIaddr = convertSymbolToAddress("DAI", network);

const incentivizedAsset = WETHaddr;
const incentivizedTranche = 0;
const rewardAddress = USDCaddr;

let providerRpc, provider, temp, owner;
if (network == "localhost") {
  providerRpc = "http://127.0.0.1:8545";
  provider = new ethers.providers.JsonRpcProvider(providerRpc);
  temp = provider.getSigner(2);
  owner = provider.getSigner(0);
} else if (network == "goerli") {
  const myprovider = new ethers.providers.AlchemyProvider(
    network,
    process.env.ALCHEMY_KEY
  );
  temp = Wallet.fromMnemonic(process.env.MNEMONIC, `m/44'/60'/0'/0/0`).connect(
    myprovider
  ); //0th signer
  owner = temp;
  providerRpc = "https://eth-goerli.public.blastapi.io";
}

describe("Protocol - incentives controller setting and claiming", () => {
  it("1 - should be able to set incentives on a specific atoken", async () => {
    var emissionsEnd = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const lendingPool = await getLendingPool({
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    const incentivizedAToken = (
      await lendingPool.getReserveData(incentivizedAsset, incentivizedTranche)
    ).aTokenAddress;

    await setIncentives({
      rewardConfigs: [
        {
          emissionPerSecond: ethers.utils.parseUnits("1", 6), // 1 dollar per second
          endTimestamp: BigNumber.from(emissionsEnd),
          incentivizedAsset: incentivizedAToken,
          reward: rewardAddress,
        },
      ],
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });
  });
  it("2 - non emissions manager may not set incentives", async () => {
    var emissionsEnd = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const lendingPool = await getLendingPool({
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    const incentivizedAToken = (
      await lendingPool.getReserveData(incentivizedAsset, incentivizedTranche)
    ).aTokenAddress;

    await expect(
      setIncentives({
        rewardConfigs: [
          {
            emissionPerSecond: ethers.utils.parseEther("0.0000001"),
            endTimestamp: BigNumber.from(emissionsEnd),
            incentivizedAsset: incentivizedAToken,
            reward: USDCaddr,
          },
        ],
        signer: temp,
        network: network,
        test: true,
        providerRpc: providerRpc,
      })
    ).to.be.revertedWith("ONLY_EMISSION_MANAGER");
  });
  it("3 - user deposits into incentivized market", async () => {
    const tx = await supply({
      underlying: "WETH",
      trancheId: incentivizedTranche,
      amount: "0.05",
      signer: temp,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    tx.wait();
  });
  it("4 - user claims incentives", async () => {
    const rewardTokenContract = new ethers.Contract(
      rewardAddress,
      [
        "function balanceOf(address account) external view returns (uint256)",
        "function allowance(address owner, address spender) external view returns (uint256)",
      ],
      temp
    );
    const lendingPool = await getLendingPool({
      signer: temp,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });
    const incentivizedAToken = (
      await lendingPool.getReserveData(incentivizedAsset, incentivizedTranche)
    ).aTokenAddress;
    let incentivesController = await getIncentivesController({
      signer: temp,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    // get starting rewards for the user and the vault
    const startingRewards = await rewardTokenContract.balanceOf(
      await temp.getAddress()
    );
    const startingVault = await rewardTokenContract.balanceOf(
      await owner.getAddress()
    );

    console.log("user starting reward token:", startingRewards.toNumber());
    console.log("vault starting reward token:", startingVault.toNumber());

    // increaseTime(provider, 500);

    const aTokens = [incentivizedAToken];
    const pendingRewardsBefore = await getUserIncentives({
      incentivizedATokens: aTokens,
      user: await temp.getAddress(),
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    console.log(
      "user pending rewards before",
      pendingRewardsBefore.rewardAmounts[0].toNumber()
    );
    console.log("user all pending rewards before", pendingRewardsBefore);

    const tx = await claimIncentives({
      incentivizedATokens: aTokens,
      signer: temp,
      to: await temp.getAddress(),
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    tx.wait();

    const pendingRewardsAfter = await getUserIncentives({
      incentivizedATokens: aTokens,
      user: await temp.getAddress(),
      network: network,
      test: true,
      providerRpc: providerRpc,
    });
    console.log("user pending rewards after", pendingRewardsAfter.rewardAmounts[0]);

    const endingRewards = await rewardTokenContract
      .connect(temp)
      .balanceOf(await temp.getAddress());
    const endingVault = await rewardTokenContract.balanceOf(
      await owner.getAddress()
    );

    expect(pendingRewardsBefore.rewardTokens[0]).to.be.eq(rewardAddress);

    expect(pendingRewardsAfter.rewardAmounts[0]).to.be.eq(BigNumber.from(0));
    expect(endingRewards).to.be.eq(
      startingRewards.add(pendingRewardsBefore.rewardAmounts[0])
    );
    expect(endingVault).to.be.eq(startingVault.sub(pendingRewardsBefore.rewardAmounts[0]));
  });
});
