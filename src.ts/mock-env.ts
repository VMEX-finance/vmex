import ethers from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

export async function setupMockEnv(address) {
    console.log(address)
    try {
        let provider = new JsonRpcProvider("http://127.0.0.1:8545");
        await provider.send("hardhat_setBalance", [
            address,
            ethers.utils.hexValue(ethers.constants.MaxUint256)
        ])

        const storage = await provider.getStorageAt("0x3619DbE27d7c1e7E91aA738697Ae7Bc5FC3eACA5", 0)
        console.log("Storage Slot [0]", ethers.utils.arrayify(storage));
        // await provider.send("hardhar_setStorageAt")


    } catch (err) {
        console.error(err)
    }
}