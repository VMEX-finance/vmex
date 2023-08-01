const { ethers } = require('hardhat')

export const toBytes32 = (bn) => {
    return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};

export const setStorageAt = async (address, index, value) => {
    await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
    // await ethers.provider.send("evm_mine", []); // Just mines to the next block
};