import { Signer } from "ethers";
import { tEthereumAddress } from "../../../helpers/types";
import { LendingPool } from "../../../types/LendingPool";
import { AaveProtocolDataProvider } from "../../../types/AaveProtocolDataProvider";
import { MintableERC20 } from "../../../types/MintableERC20";
import { AToken } from "../../../types/AToken";
import { LendingPoolConfigurator } from "../../../types/LendingPoolConfigurator";
import { CrvLpStrategy } from "../../../types/CrvLpStrategy";
import { PriceOracle } from "../../../types/PriceOracle";
import { LendingPoolAddressesProvider } from "../../../types/LendingPoolAddressesProvider";
import { LendingPoolAddressesProviderRegistry } from "../../../types/LendingPoolAddressesProviderRegistry";
import { UniswapLiquiditySwapAdapter } from "../../../types/UniswapLiquiditySwapAdapter";
import { UniswapRepayAdapter } from "../../../types/UniswapRepayAdapter";
import { ParaSwapLiquiditySwapAdapter } from "../../../types/ParaSwapLiquiditySwapAdapter";
import { WETH9Mocked } from "../../../types/WETH9Mocked";
import { WETHGateway } from "../../../types/WETHGateway";
import { CurveWrapper, FlashLiquidationAdapter } from "../../../types";
export interface SignerWithAddress {
    signer: Signer;
    address: tEthereumAddress;
}
export interface TestEnv {
    deployer: SignerWithAddress;
    users: SignerWithAddress[];
    pool: LendingPool;
    configurator: LendingPoolConfigurator;
    oracle: PriceOracle;
    curveOracle: CurveWrapper;
    helpersContract: AaveProtocolDataProvider;
    weth: WETH9Mocked;
    aWETH: AToken;
    dai: MintableERC20;
    aDai: AToken;
    usdc: MintableERC20;
    aave: MintableERC20;
    tricrypto2: MintableERC20;
    tricrypto2Strategy: CrvLpStrategy;
    addressesProvider: LendingPoolAddressesProvider;
    uniswapLiquiditySwapAdapter: UniswapLiquiditySwapAdapter;
    uniswapRepayAdapter: UniswapRepayAdapter;
    registry: LendingPoolAddressesProviderRegistry;
    wethGateway: WETHGateway;
    flashLiquidationAdapter: FlashLiquidationAdapter;
    paraswapLiquiditySwapAdapter: ParaSwapLiquiditySwapAdapter;
}
export declare function initializeMakeSuite(): Promise<void>;
export declare function makeSuite(name: string, tests: (testEnv: TestEnv) => void): void;
