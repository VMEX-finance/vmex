import { Signer } from "@ethersproject/abstract-signer";
export declare function getUserTokenBalances(signer: Signer): Promise<{
    response: {
        balances: any;
    };
}>;
