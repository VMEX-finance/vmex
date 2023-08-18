const { ethers, BigNumber } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const {
  setIncentives,
  setExternalIncentives,
  supply,
  claimIncentives,
  getUserIncentives,
  removeExternalIncentives,
  withdraw,
} = require("../dist/src.ts/protocol.js");

const {
  getAssetPrices,
  convertSymbolToAddress,
  increaseTime,
  isLocalhost,
} = require("../dist/src.ts/utils");
const {
  getLendingPool,
  getIncentivesController,
} = require("../dist/src.ts/contract-getters.js");

const network = process.env.NETWORK;
const USDCaddr = convertSymbolToAddress("USDC", network);
const WETHaddr = convertSymbolToAddress("WETH", network);

const incentivizedAsset = WETHaddr;
const incentivizedTranche = 0;
const rewardAddress = USDCaddr;

let providerRpc, provider, temp, owner;
if (isLocalhost(network)) {
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

const IERC20abi = [
  "function allowance(address owner, address spender) external view returns (uint256 remaining)",
  "function approve(address spender, uint256 value) external returns (bool success)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
  "function decimals() external view returns (uint8 decimalPlaces)",
  "function name() external view returns (string memory tokenName)",
  "function symbol() external view returns (string memory tokenSymbol)",
  "function totalSupply() external view returns (uint256 totalTokensIssued)",
  "function transfer(address to, uint256 value) external returns (bool success)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
  "function deposit() public payable",
  "function withdraw(uint wad) public",
];


async function getWETH(user) {
  const WETHContract = new ethers.Contract(WETHaddr, IERC20abi);
  const wethTx = await WETHContract.connect(user).deposit({
    value: ethers.utils.parseEther("1000.0"),
  });
}

async function swapWETHForAsset(user, asset) {
  // get USDC through uniswap
  console.log("SWAPPING", asset);
  const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    [
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    ]
  );
  const deadline = (await provider.getBlock("latest")).timestamp + 60 * 20; // 20 minutes from the current Unix time
  let options = {
    value: ethers.utils.parseUnits("100000", 18),
  };
  if (asset === USDCaddr) {
    options.value = ethers.utils.parseUnits("100000", 6);
  }

  const tx = await UNISWAP_ROUTER_CONTRACT.connect(user).swapExactETHForTokens(
    "0",
    [WETHaddr, asset],
    await user.getAddress(),
    deadline,
    options
  );
  console.log("done swapping for", asset, "with amount", options);

  return tx;
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
    const user = temp;

    // get WETH
    await getWETH(user);
    await getWETH(owner);

    const tx = await supply({
      underlying: "WETH",
      trancheId: incentivizedTranche,
      amount: "0.05",
      signer: user,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    await tx.wait();
  });
  it("4 - user claims incentives", async () => {
    // give the vault enough usdc to cover the rewards
    await swapWETHForAsset(owner, USDCaddr);
    const rewardTokenContract = new ethers.Contract(
      rewardAddress,
      IERC20abi,
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

    await tx.wait();

    const pendingRewardsAfter = await getUserIncentives({
      incentivizedATokens: aTokens,
      user: await temp.getAddress(),
      network: network,
      test: true,
      providerRpc: providerRpc,
    });
    console.log(
      "user pending rewards after",
      pendingRewardsAfter.rewardAmounts[0]
    );

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
    expect(endingVault).to.be.eq(
      startingVault.sub(pendingRewardsBefore.rewardAmounts[0])
    );
  });
});

describe("Protocol - external incentives controller setting and claiming", () => {
  it("1 - should be able to set external incentives on a specific atoken", async () => {
    const lendingPool = await getLendingPool({
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    const yvUSDCAddr = convertSymbolToAddress("yvUSDC", network);
    const yvUSDCStakingAddr = "0xB2c04C55979B6CA7EB10e666933DE5ED84E6876b";

    const incentivizedAToken = (await lendingPool.getReserveData(yvUSDCAddr, 0))
      .aTokenAddress;

    await setExternalIncentives({
      incentivizedATokens: [incentivizedAToken],
      stakingContracts: [yvUSDCStakingAddr],
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });
  });

  it("2 - non emissions manager may not set incentives", async () => {
    const lendingPool = await getLendingPool({
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    const yvUSDCAddr = convertSymbolToAddress("yvUSDC", network);
    const yvUSDCStakingAddr = "0xB2c04C55979B6CA7EB10e666933DE5ED84E6876b";

    const incentivizedAToken = (await lendingPool.getReserveData(yvUSDCAddr, 0))
      .aTokenAddress;

    await expect(
      await setExternalIncentives({
        incentivizedATokens: [incentivizedAToken],
        stakingContracts: [yvUSDCStakingAddr],
        signer: temp,
        network: network,
        test: true,
        providerRpc: providerRpc,
      })
    ).to.be.revertedWith("ONLY_EMISSION_MANAGER");
  });
  // TODO: No liquidity on Uniswap markets so user can't get tokens
  it("3 - user deposits into incentivized market", async () => {
    const user = owner;
    const userAddress = await user.getAddress();
    // get WETH
    await getWETH(user);

    // get USDC
    const usdcTx = await swapWETHForAsset(user, USDCaddr);
    await usdcTx.wait();

    // deposit USDC in yearn and get yvUSDC
    const yvUSDCContract = new ethers.Contract(
      "0xaD17A225074191d5c8a37B50FdA1AE278a2EE6A2",
      ["function deposit(uint256 _amount) external returns (uint256)"]
    );

    const USDCContract = new ethers.Contract(USDCaddr, IERC20abi);

    const userUSDCAmount = await USDCContract.connect(user).balanceOf(userAddress);
    console.log("USER USDC AMOUNT", userUSDCAmount.toString())
    expect(userUSDCAmount.toString()).to.not.be.equal(
      "0",
      "Did not get USDC token"
    );

    // approve the yearn contract and deposit
    const approveTx = await USDCContract.connect(user).approve(
      yvUSDCContract.address,
      ethers.utils.parseUnits("10000", 6)
    );
    await approveTx.wait();
    await yvUSDCContract
      .connect(user)
      .deposit(ethers.utils.parseUnits("100", 6));

    console.log("done getting yvUSDC");

    const tx = await supply({
      underlying: "yvUSDC",
      trancheId: incentivizedTranche,
      amount: "0.5",
      signer: user,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    await tx.wait();
  });
  it("4 - user waits some time and withdraws some", async () => {
    // TODO: call external server to find user balance
    const user = owner;

    // withdraw some balance
    const tx = await withdraw({
      asset: "yvUSDC",
      trancheId: incentivizedTranche,
      amount: "0.1",
      signer: user,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });
  });
  it("5 - stop external incentives", async () => {
    const lendingPool = await getLendingPool({
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    const yvUSDCAddr = convertSymbolToAddress("yvUSDC", network);

    const incentivizedAToken = (await lendingPool.getReserveData(yvUSDCAddr, 0))
      .aTokenAddress;

    console.log("atokne address to remove is", incentivizedAToken);

    const tx = await removeExternalIncentives({
      incentivizedAToken: incentivizedAToken,
      signer: owner,
      network: network,
      test: true,
      providerRpc: providerRpc,
    });

    await tx.wait();
  });
});
