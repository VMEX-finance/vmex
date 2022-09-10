import hre from "hardhat";
const { ethers, network } = hre;

(async () => {
    console.log(`Setting account Balance`)
    console.log(ethers.utils.hexValue(3000))
    let x = await network.provider.send("hardhat_setBalance", [
        "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A",
        ethers.utils.hexValue(ethers.constants.MaxUint256)
    ])

    // console.log(ethers.utils.formatUnits(await network.provider.send("eth_getBalance", [
    //     "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A"
    // ]), 18))

    // const [ signer ] = await ethers.getSigners();
    // console.log(await signer.getBalance())
    // const response = await signer.sendTransaction({
    //     to: "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A",
    //     value: ethers.utils.parseEther("1000")
    // });

    // console.log(response);
    
})()