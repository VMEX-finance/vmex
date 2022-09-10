import { Signer } from "@ethersproject/abstract-signer";
import _ from "lodash";
export declare function getUserTokenBalances(signer: Signer): Promise<{
    response: {
        balances: null;
        format_response?: undefined;
    };
} | {
    response: {
        format_response: _.Dictionary<unknown>;
        balances?: undefined;
    };
}>;
