import { Signer } from "@ethersproject/abstract-signer";
/**
 * gets tranche reserve data for all deployed tokens over each tranch.
 * uses a batch request RPC to loop over all three tranches as one request.
 * @param signer
 * @returns returnData
 */
declare function getTrancheReserveData(signer: Signer): Promise<unknown[] | {
    response: {
        data: null;
    };
}>;
export default getTrancheReserveData;
