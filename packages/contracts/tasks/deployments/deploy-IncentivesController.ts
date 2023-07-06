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
        "0x131Ae347E654248671Afc885F0767cB605C065d7",
        "0xE2CEc8aB811B648bA7B1691Ce08d5E800Dd0a60a",
        "0x2f733b00127449fcF8B5a195bC51Abb73B7F7A75",
        "0x1C5472efDF8CE67259D6f44ef548c68703797fA2",
        "0x0299d40E99F2a5a1390261f5A71d13C3932E214C"
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
        2
      ]
    );


    const yvUSDCDat = await lendingPool.getReserveData("0xaD17A225074191d5c8a37B50FdA1AE278a2EE6A2", 0);

    await incentivesController.beginStakingReward(yvUSDCDat.aTokenAddress, "0xB2c04C55979B6CA7EB10e666933DE5ED84E6876b");

    const yvUSDTDat = await lendingPool.getReserveData("0xFaee21D0f0Af88EE72BB6d68E54a90E6EC2616de", 0);

    await incentivesController.beginStakingReward(yvUSDTDat.aTokenAddress, "0xf66932f225ca48856b7f97b6f060f4c0d244af8e");

    const yvDAIDat = await lendingPool.getReserveData("0x65343F414FFD6c97b0f6add33d16F6845Ac22BAc", 0);

    await incentivesController.beginStakingReward(yvDAIDat.aTokenAddress, "0xf8126ef025651e1b313a6893fcf4034f4f4bd2aa");

    const yvWETHDat = await lendingPool.getReserveData("0x5B977577Eb8a480f63e11FC615D6753adB8652Ae", 0);

    await incentivesController.beginStakingReward(yvWETHDat.aTokenAddress, "0xe35fec3895dcecc7d2a91e8ae4ff3c0d43ebffe0");

    //velo

    const velo_wstETHWETH = await lendingPool.getReserveData("0xBf205335De602ac38244F112d712ab04CB59A498", 0);

    await incentivesController.beginStakingReward(velo_wstETHWETH.aTokenAddress, "0x131Ae347E654248671Afc885F0767cB605C065d7");

    // const velo_USDCsUSD = await lendingPool.getReserveData("0xd16232ad60188B68076a235c65d692090caba155", 0);

    // await incentivesController.beginStakingReward(velo_USDCsUSD.aTokenAddress, "0xb03f52D2DB3e758DD49982Defd6AeEFEa9454e80");

    const velo_ETHUSDC = await lendingPool.getReserveData("0x79c912FEF520be002c2B6e57EC4324e260f38E50", 0);

    await incentivesController.beginStakingReward(velo_ETHUSDC.aTokenAddress, "0xE2CEc8aB811B648bA7B1691Ce08d5E800Dd0a60a");

    const velo_OPETH = await lendingPool.getReserveData("0xcdd41009E74bD1AE4F7B2EeCF892e4bC718b9302", 0);

    await incentivesController.beginStakingReward(velo_OPETH.aTokenAddress, "0x2f733b00127449fcF8B5a195bC51Abb73B7F7A75");

    const velo_ETHSNX = await lendingPool.getReserveData("0xffb6c35960b23989037c8c391facebc8a17de970", 0);

    await incentivesController.beginStakingReward(velo_ETHSNX.aTokenAddress, "0x1C5472efDF8CE67259D6f44ef548c68703797fA2");

    const velo_OPUSDC = await lendingPool.getReserveData("0x47029bc8f5CBe3b464004E87eF9c9419a48018cd", 0);

    await incentivesController.beginStakingReward(velo_OPUSDC.aTokenAddress, "0x0299d40E99F2a5a1390261f5A71d13C3932E214C");

    // const velo_DAIUSDC = await lendingPool.getReserveData("0x4F7ebc19844259386DBdDB7b2eB759eeFc6F8353", 0);

    // await incentivesController.beginStakingReward(velo_DAIUSDC.aTokenAddress, "0xc4fF55A961bC04b880e60219CCBBDD139c6451A4");

    // const velo_FRAXUSDC = await lendingPool.getReserveData("0xAdF902b11e4ad36B227B84d856B229258b0b0465", 0);

    // await incentivesController.beginStakingReward(velo_FRAXUSDC.aTokenAddress, "0x14d60F07924e3a7226DDD368409243eDF87e6205");

    // const velo_USDTUSDC = await lendingPool.getReserveData("0xe08d427724d8a2673FE0bE3A81b7db17BE835B36", 0);

    // await incentivesController.beginStakingReward(velo_USDTUSDC.aTokenAddress, "0x654F9e476865CE72EF2FB73861C03804AA5208D1");
  });
