import { deployments } from "../dist/src.ts/constants";
import getUserTrancheData from "../artifacts/contracts/analytics/queries/getUserTrancheData.sol/getUserTrancheData.json";
import WalletBalanceProvider from "../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

async function checkWETHBalance(signer: any, address: string, provider: any) {
    console.log(signer)
    const BalanceProvider = new ethers.Contract(deployments.WalletBalanceProvider.localhost.address, WalletBalanceProvider.abi, signer);
    const balances = await BalanceProvider.getUserWalletBalances(deployments.LendingPoolAddressesProvider.hardhat.address, address);
    console.log(balances)

}

( async () => {
    const [ signer ] = await ethers.getSigners();
    const address = await signer.getAddress();
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

    await checkWETHBalance(signer, address, provider);

    
    let contractFactory = new ethers.ContractFactory(getUserTrancheData.abi, getUserTrancheData.bytecode);
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(address, deployments.LendingPoolAddressesProvider.hardhat.address).data
    })

    let iface = new ethers.utils.Interface(getUserTrancheData.abi);
    let _data = await iface.decodeFunctionResult("getType", data);
    console.log(_.uniq(_data['0']));
})()