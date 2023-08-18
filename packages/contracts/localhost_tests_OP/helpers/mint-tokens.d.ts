import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { tEthereumAddress } from "../../helpers/types";
export declare function setBalance(tokenAddr: tEthereumAddress, signer: SignerWithAddress, balance: string): Promise<void>;
