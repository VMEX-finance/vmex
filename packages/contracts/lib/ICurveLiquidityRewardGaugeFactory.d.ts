import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveLiquidityRewardGauge } from "./ICurveLiquidityRewardGauge";
export declare class ICurveLiquidityRewardGaugeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveLiquidityRewardGauge;
}
