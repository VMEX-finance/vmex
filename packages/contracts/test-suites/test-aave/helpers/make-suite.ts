import { evmRevert, evmSnapshot, DRE } from "../../../helpers/misc-utils";
import { Signer } from "ethers";
import {
  getLendingPool,
  getLendingPoolAddressesProvider,
  getAaveProtocolDataProvider,
  getAToken,
  getMintableERC20,
  getLendingPoolConfiguratorProxy,
  getPriceOracle,
  getLendingPoolAddressesProviderRegistry,
  getWETHMocked,
  getWETHGateway,
  getAssetMappings,
  getYearnTokenMocked,
  getVariableDebtToken,
  getATokenBeacon,
  getVariableDebtTokenBeacon,
  getVMEXOracle,
  getATokenMock,
  getIncentivesControllerProxy,
  getVmexToken,
  getStakingRewardsMock,
  // getATokensAndRatesHelper,
} from "../../../helpers/contracts-getters";
import {
  eEthereumNetwork,
  eNetwork,
  tEthereumAddress,
} from "../../../helpers/types";
import { LendingPool } from "../../../types/LendingPool";
import { AaveProtocolDataProvider } from "../../../types/AaveProtocolDataProvider";
import { MintableERC20 } from "../../../types/MintableERC20";
import { AToken } from "../../../types/AToken";
import { LendingPoolConfigurator } from "../../../types/LendingPoolConfigurator";

import chai from "chai";
// @ts-ignore
import bignumberChai from "chai-bignumber";
import { almostEqual } from "./almost-equal";
import { PriceOracle } from "../../../types/PriceOracle";
import { LendingPoolAddressesProvider } from "../../../types/LendingPoolAddressesProvider";
import { LendingPoolAddressesProviderRegistry } from "../../../types/LendingPoolAddressesProviderRegistry";
import { getEthersSigners } from "../../../helpers/contracts-helpers";
import { getParamPerNetwork } from "../../../helpers/contracts-helpers";
import { WETH9Mocked } from "../../../types/WETH9Mocked";
import { WETHGateway } from "../../../types/WETHGateway";
import { solidity } from "ethereum-waffle";
import { AaveConfig } from "../../../markets/aave";
import { AssetMappings, ATokenBeacon, ATokenMock, IncentivesController, StakingRewardsMock, VariableDebtToken, VariableDebtTokenBeacon, VMEXOracle, VmexToken, YearnTokenMocked } from "../../../types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { usingTenderly } from "../../../helpers/tenderly-utils";
import { isHardhatTestingStrategies } from "../../../helpers/configuration";
import { deployMintableERC20 } from "../../../helpers/contracts-deployments";

chai.use(bignumberChai());
chai.use(almostEqual());
chai.use(solidity);

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}
export interface TestEnv {
  deployer: SignerWithAddress;
  users: SignerWithAddress[];
  pool: LendingPool;
  configurator: LendingPoolConfigurator;
  assetMappings: AssetMappings;
  oracle: PriceOracle;
  vmexOracle: VMEXOracle;
  // curveOracle: CurveWrapper;
  helpersContract: AaveProtocolDataProvider;
  weth: WETH9Mocked;
  aWETH: AToken;
  dai: MintableERC20;
  aDai: AToken;
  usdc: MintableERC20;
  aUsdc: AToken;
  varDebtUsdc: VariableDebtToken;
  aave: MintableERC20;
  busd: MintableERC20;
  usdt: MintableERC20;
  aAave: AToken;
  tricrypto2: MintableERC20;
  yvTricrypto2: YearnTokenMocked;
  ayvTricrypto2: AToken;
  tricrypto2Strategy: CrvLpStrategy;
  addressesProvider: LendingPoolAddressesProvider;
  uniswapLiquiditySwapAdapter: UniswapLiquiditySwapAdapter;
  uniswapRepayAdapter: UniswapRepayAdapter;
  registry: LendingPoolAddressesProviderRegistry;
  wethGateway: WETHGateway;
  paraswapLiquiditySwapAdapter: ParaSwapLiquiditySwapAdapter;
  aTokenBeacon: ATokenBeacon;
  varDebtBeacon: VariableDebtTokenBeacon;

  // items for the incentives controller
  incentivesController: IncentivesController;
  vmexToken: VmexToken;
  incentivizedTokens: ATokenMock[];
  rewardTokens: MintableERC20[];
  stakingContracts: StakingRewardsMock[];
  incentUnderlying: MintableERC20[];
}

let buidlerevmSnapshotId: string = "0x1";
const setBuidlerevmSnapshotId = (id: string) => {
  buidlerevmSnapshotId = id;
};

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  users: [] as SignerWithAddress[],
  pool: {} as LendingPool,
  configurator: {} as LendingPoolConfigurator,
  helpersContract: {} as AaveProtocolDataProvider,
  oracle: {} as PriceOracle,
  // curveOracle: {} as CurveWrapper,
  weth: {} as WETH9Mocked,
  aWETH: {} as AToken,
  dai: {} as MintableERC20,
  aDai: {} as AToken,
  usdc: {} as MintableERC20,
  aUsdc: {} as  AToken,
  varDebtUsdc: {} as  VariableDebtToken,
  aave: {} as MintableERC20,
  busd: {} as MintableERC20,
  usdt: {} as MintableERC20,
  tricrypto2: {} as MintableERC20,
  yvTricrypto2: {} as YearnTokenMocked,
  ayvTricrypto2: {} as AToken,
  tricrypto2Strategy: {} as CrvLpStrategy,
  addressesProvider: {} as LendingPoolAddressesProvider,
  uniswapLiquiditySwapAdapter: {} as UniswapLiquiditySwapAdapter,
  uniswapRepayAdapter: {} as UniswapRepayAdapter,
  registry: {} as LendingPoolAddressesProviderRegistry,
  wethGateway: {} as WETHGateway,
  aTokenBeacon: {} as ATokenBeacon,
  varDebtBeacon: {} as VariableDebtTokenBeacon,

  incentivesController: {} as IncentivesController,
  vmexToken: {} as VmexToken,
  incentivizedTokens: [] as ATokenMock[],
  rewardTokens: [] as MintableERC20[],
  stakingContracts: [] as StakingRewardsMock[],
  incentUnderlying: [] as MintableERC20[]
} as TestEnv;

export async function initializeMakeSuite() {
  const [_deployer, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };
  console.log("Begin initializeMakeSuite");
  for (const signer of restSigners) {
    testEnv.users.push({
      signer,
      address: await signer.getAddress(),
    });
  }
  testEnv.deployer = deployer;
  testEnv.pool = await getLendingPool();

  testEnv.configurator = await getLendingPoolConfiguratorProxy();
  // testEnv.aTokensAndRatesHelper = await getATokensAndRatesHelper();
  testEnv.assetMappings = await getAssetMappings();

  testEnv.addressesProvider = await getLendingPoolAddressesProvider();

  if (process.env.FORK) {
    testEnv.registry = await getLendingPoolAddressesProviderRegistry(
      getParamPerNetwork(
        AaveConfig.ProviderRegistry,
        process.env.FORK as eNetwork
      )
    );
  } else {
    testEnv.registry = await getLendingPoolAddressesProviderRegistry();
    testEnv.oracle = await getPriceOracle();
    // testEnv.curveOracle = await getCurvePriceOracleWrapper();
  }

  testEnv.vmexOracle = await getVMEXOracle();

  testEnv.helpersContract = await getAaveProtocolDataProvider();

  testEnv.aTokenBeacon = await getATokenBeacon(await testEnv.addressesProvider.getATokenBeacon());
  testEnv.varDebtBeacon = await getVariableDebtTokenBeacon(await testEnv.addressesProvider.getVariableDebtTokenBeacon());


  const allTokensT0 = await testEnv.helpersContract.getAllATokens("0");
  const aDaiAddress = allTokensT0.find(
    (aToken) => aToken.symbol === "vDAI0"
  )?.tokenAddress; //choose tranche

  const aUsdcAddress = allTokensT0.find(
    (aToken) => aToken.symbol === "vUSDC0"
  )?.tokenAddress; //choose tranche

  const aWEthAddress = allTokensT0.find(
    (aToken) => aToken.symbol === "vWETH0"
  )?.tokenAddress;

  const aAAVEAddress = allTokensT0.find(
    (aToken) => aToken.symbol === "vAAVE0"
  )?.tokenAddress;

  const allTokensT1 = await testEnv.helpersContract.getAllATokens("1");
  const ayvAddress = allTokensT1.find(
    (aToken) => aToken.symbol === "vyvTricrypto21"
  )?.tokenAddress;

  const reservesTokensT0 = await testEnv.helpersContract.getAllReservesTokens(
    "1"
  );

  const daiAddress = reservesTokensT0.find(
    (token) => token.symbol === "DAI"
  )?.tokenAddress;
  const busdAddress = reservesTokensT0.find(
    (token) => token.symbol === "BUSD"
  )?.tokenAddress;
  const usdcAddress = reservesTokensT0.find(
    (token) => token.symbol === "USDC"
  )?.tokenAddress;
  const aaveAddress = reservesTokensT0.find(
    (token) => token.symbol === "AAVE"
  )?.tokenAddress;
  const usdtAddress = reservesTokensT0.find(
    (token) => token.symbol === "USDT"
  )?.tokenAddress;
  const wethAddress = reservesTokensT0.find(
    (token) => token.symbol === "WETH"
  )?.tokenAddress;
  const yvTricrypto2Address = reservesTokensT0.find(
    (token) => token.symbol === "yvTricrypto2"
  )?.tokenAddress;

  if (!aDaiAddress || !aWEthAddress || !ayvAddress || !aUsdcAddress) {
    console.log("cannot find all atokens")
    process.exit(1);
  }
  if (!daiAddress || !usdcAddress || !aaveAddress || !wethAddress || !yvTricrypto2Address) {
    console.log("cannot find all tokens")
    process.exit(1);
  }
  const varDebtUsdcAddress = await (await testEnv.pool.getReserveData(usdcAddress, "0")).variableDebtTokenAddress;

  // const reservesTokensT1 = await testEnv.helpersContract.getAllReservesTokens(
  //   "1"
  // );

  // const tricrypto2Address = reservesTokensT1.find(
  //   (token) => token.symbol === "Tricrypto2"
  // )?.tokenAddress;

  // if (!tricrypto2Address) {
  //   process.exit(1);
  // }

  // if (isHardhatTestingStrategies)
  //   testEnv.tricrypto2Strategy = await getTricrypto2Strategy();

  testEnv.aDai = await getAToken(aDaiAddress);
  testEnv.aWETH = await getAToken(aWEthAddress);
  testEnv.aAave = await getAToken(aAAVEAddress);

  testEnv.dai = await getMintableERC20(daiAddress);
  testEnv.usdc = await getMintableERC20(usdcAddress);
  testEnv.aave = await getMintableERC20(aaveAddress);
  testEnv.busd = await getMintableERC20(busdAddress)
  testEnv.usdt = await getMintableERC20(usdtAddress)
  testEnv.weth = await getWETHMocked(wethAddress);
  testEnv.wethGateway = await getWETHGateway();
  testEnv.yvTricrypto2 = await getYearnTokenMocked(yvTricrypto2Address);
  testEnv.ayvTricrypto2 = await getAToken(ayvAddress);
  testEnv.aUsdc = await getAToken(aUsdcAddress);
  testEnv.varDebtUsdc = await getVariableDebtToken(varDebtUsdcAddress);

  testEnv.incentivesController = await getIncentivesControllerProxy();
  testEnv.vmexToken = await getVmexToken();

  testEnv.incentivizedTokens = [
    await getATokenMock({ slug: 'aDai' }),
    await getATokenMock({ slug: 'aBusd' }),
    await getATokenMock({ slug: 'aAave' }),
    await getATokenMock({ slug: 'aUsdt' }),
    await getATokenMock({ slug: 'aWeth' }),
  ]

  testEnv.rewardTokens = [testEnv.usdc, testEnv.dai];

  testEnv.stakingContracts = [
    await getStakingRewardsMock({ slug: 'yaDai'}),
    await getStakingRewardsMock({ slug: 'yaBusd'}),
    await getStakingRewardsMock({ slug: 'yaAave'}),
    await getStakingRewardsMock({ slug: 'yaUsdt'}),
    await getStakingRewardsMock({ slug: 'yaWeth'}),
  ];

  testEnv.incentUnderlying = [testEnv.dai, testEnv.busd, testEnv.aave, testEnv.usdt]

  // testEnv.tricrypto2 = await getMintableERC20(tricrypto2Address);

  //CURVE TODO: these are not deployed when running mainnet fork in localhost
  // testEnv.uniswapLiquiditySwapAdapter = await getUniswapLiquiditySwapAdapter();
  // testEnv.uniswapRepayAdapter = await getUniswapRepayAdapter();
  // testEnv.flashLiquidationAdapter = await getFlashLiquidationAdapter();

  // testEnv.paraswapLiquiditySwapAdapter =
  //   await getParaSwapLiquiditySwapAdapter();
}

const setSnapshot = async () => {
  const hre = DRE as HardhatRuntimeEnvironment;
  if (usingTenderly()) {
    setBuidlerevmSnapshotId((await hre.tenderlyNetwork.getHead()) || "0x1");
    return;
  }
  setBuidlerevmSnapshotId(await evmSnapshot());
};

const revertHead = async () => {
  const hre = DRE as HardhatRuntimeEnvironment;
  if (usingTenderly()) {
    await hre.tenderlyNetwork.setHead(buidlerevmSnapshotId);
    return;
  }
  await evmRevert(buidlerevmSnapshotId);
};

export function makeSuite(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    before(async () => {
      await setSnapshot();
    });
    tests(testEnv);
    after(async () => {
      await revertHead();
    });
  });
}
