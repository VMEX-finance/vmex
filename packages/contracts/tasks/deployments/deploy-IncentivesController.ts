import { task } from "hardhat/config";
import {
  setupVmexIncentives,
} from "../../helpers/contracts-deployments";
import {
  getFirstSigner,
  getIncentivesControllerProxy,
  getLendingPool,
  getLendingPoolAddressesProvider,
} from "../../helpers/contracts-getters";

const CONTRACT_NAME = 'IncentivesController';

task(`deploy-${CONTRACT_NAME}`, `Deploy and initialize ${CONTRACT_NAME}`)
  .addFlag("verify", "Verify contracts at Etherscan")
  // .addParam("vaultOfRewards", "The address of the vault of rewards")
  .setAction(async ({ verify }, DRE) => {

    await DRE.run("set-DRE");

    if (!DRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    console.log(`\n- ${CONTRACT_NAME} deployment`);

    const addressesProvider = await getLendingPoolAddressesProvider();
    const admin = await addressesProvider.getGlobalAdmin();
    const emissionsManager = admin;
    const vmexIncentivesProxy = await setupVmexIncentives(
        emissionsManager,   // the vault of rewards is the same as the emissions manager which is the same as the global admin
        verify
    );

    // await addressesProvider.setIncentivesController(vmexIncentivesProxy.address);

    console.log(`Finished deployment, ${CONTRACT_NAME}.address`, vmexIncentivesProxy.address);

    const incentivesController = await getIncentivesControllerProxy();
    var signer = await getFirstSigner();
    const lendingPool = await getLendingPool();
    console.log("Current incentives controller", await addressesProvider.getIncentivesController());
    // await addressesProvider.setIncentivesController(incentivesController.address);
    // console.log("New incentives controller", await addressesProvider.getIncentivesController());

    await incentivesController.setStakingType(
      [
        "0xB2c04C55979B6CA7EB10e666933DE5ED84E6876b",
        "0xf66932f225ca48856b7f97b6f060f4c0d244af8e",
        "0xf8126ef025651e1b313a6893fcf4034f4f4bd2aa",
        "0xe35fec3895dcecc7d2a91e8ae4ff3c0d43ebffe0",
        //velo
        "0xd0E434831a765839051DA9C0B9B99C6b0Fb87201",
        "0x9f82A8b19804141161C582CfEa1b84853340A246",
        "0xe7630c9560c59ccbf5eed8f33dd0cca2e67a3981",
        "0xcc53cd0a8ec812d46f0e2c7cc5aadd869b6f0292",
        "0x613137e8f8083d262055a34a73dc19a652833106",
        "0x36691b39ec8fa915204ba1e1a4a3596994515639"
      ], 
      [
        1,
        1,
        1,
        1,

        2,
        2,
        2,
        2,
        2,
        2
      ]
    );

    console.log("finished setting staking type")
    const yvUSDCDat = await lendingPool.getReserveData("0xaD17A225074191d5c8a37B50FdA1AE278a2EE6A2", 0);

    await incentivesController.beginStakingReward(yvUSDCDat.aTokenAddress, "0xB2c04C55979B6CA7EB10e666933DE5ED84E6876b");

    const yvUSDTDat = await lendingPool.getReserveData("0xFaee21D0f0Af88EE72BB6d68E54a90E6EC2616de", 0);

    await incentivesController.beginStakingReward(yvUSDTDat.aTokenAddress, "0xf66932f225ca48856b7f97b6f060f4c0d244af8e");

    const yvDAIDat = await lendingPool.getReserveData("0x65343F414FFD6c97b0f6add33d16F6845Ac22BAc", 0);

    await incentivesController.beginStakingReward(yvDAIDat.aTokenAddress, "0xf8126ef025651e1b313a6893fcf4034f4f4bd2aa");

    const yvWETHDat = await lendingPool.getReserveData("0x5B977577Eb8a480f63e11FC615D6753adB8652Ae", 0);

    await incentivesController.beginStakingReward(yvWETHDat.aTokenAddress, "0xe35fec3895dcecc7d2a91e8ae4ff3c0d43ebffe0");

    console.log("finished setting yearn")
    //velo
    const velo_rETHWETH = await lendingPool.getReserveData("0x7e0F65FAB1524dA9E2E5711D160541cf1199912E", 0);

    //gauge not alive?
    await incentivesController.beginStakingReward(velo_rETHWETH.aTokenAddress, "0xd0E434831a765839051DA9C0B9B99C6b0Fb87201");

    console.log("finished setting reth weth")
    const velo_wstETHWETH = await lendingPool.getReserveData("0x6dA98Bde0068d10DDD11b468b197eA97D96F96Bc", 0);

    //gauge looks like it's not alive
    await incentivesController.beginStakingReward(velo_wstETHWETH.aTokenAddress, "0x9f82A8b19804141161C582CfEa1b84853340A246");

    console.log("finished setting wsteth weth")
    // const velo_USDCsUSD = await lendingPool.getReserveData("0xd16232ad60188B68076a235c65d692090caba155", 0);

    // await incentivesController.beginStakingReward(velo_USDCsUSD.aTokenAddress, "0xb03f52D2DB3e758DD49982Defd6AeEFEa9454e80");

    const velo_ETHUSDC = await lendingPool.getReserveData("0x0493Bf8b6DBB159Ce2Db2E0E8403E753Abd1235b", 0);

    //gauge dead
    await incentivesController.beginStakingReward(velo_ETHUSDC.aTokenAddress, "0xe7630c9560c59ccbf5eed8f33dd0cca2e67a3981");

    console.log("finished setting usdc weth")
    const velo_OPETH = await lendingPool.getReserveData("0xd25711EdfBf747efCE181442Cc1D8F5F8fc8a0D3", 0);

    //gauge dead
    await incentivesController.beginStakingReward(velo_OPETH.aTokenAddress, "0xcc53cd0a8ec812d46f0e2c7cc5aadd869b6f0292");

    console.log("finished setting op weth")
    // const velo_ETHSNX = await lendingPool.getReserveData("0x1Bf31A0932A0035c532A7b1DCB94ffe0b35aed14", 0);

    // await incentivesController.beginStakingReward(velo_ETHSNX.aTokenAddress, "0x613137e8f8083d262055a34a73dc19a652833106");

    const velo_OPUSDC = await lendingPool.getReserveData("0x0df083de449F75691fc5A36477a6f3284C269108", 0);

    await incentivesController.beginStakingReward(velo_OPUSDC.aTokenAddress, "0x36691b39ec8fa915204ba1e1a4a3596994515639");

    console.log("finished setting op usdc")
    // const velo_DAIUSDC = await lendingPool.getReserveData("0x4F7ebc19844259386DBdDB7b2eB759eeFc6F8353", 0);

    // await incentivesController.beginStakingReward(velo_DAIUSDC.aTokenAddress, "0xc4fF55A961bC04b880e60219CCBBDD139c6451A4");

    // const velo_FRAXUSDC = await lendingPool.getReserveData("0xAdF902b11e4ad36B227B84d856B229258b0b0465", 0);

    // await incentivesController.beginStakingReward(velo_FRAXUSDC.aTokenAddress, "0x14d60F07924e3a7226DDD368409243eDF87e6205");

    // const velo_USDTUSDC = await lendingPool.getReserveData("0xe08d427724d8a2673FE0bE3A81b7db17BE835B36", 0);

    // await incentivesController.beginStakingReward(velo_USDTUSDC.aTokenAddress, "0x654F9e476865CE72EF2FB73861C03804AA5208D1");
  });
