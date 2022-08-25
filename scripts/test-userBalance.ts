import hre from "hardhat"
import UserTokenBalance from "../artifacts/contracts/analytics/UserTokenBalance.sol/UserTokenBalance.json";
import { TOKEN_ADDR_MAINNET } from "../dist/src.ts/constants";
const { ethers } = hre;
import _ from "lodash";


(async () => {
    const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    const _wallet = "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB";
    console.log(`Testing user balances for wallet ${_wallet}`);

    let contractFactory = new ethers.ContractFactory(UserTokenBalance.abi, UserTokenBalance.bytecode)

    let data = await provider.call({ data: contractFactory.getDeployTransaction(_wallet, Object.values(TOKEN_ADDR_MAINNET)).data});
    let [balances] = await new ethers.utils.AbiCoder().decode(["uint256[]"], data)
    const _balances = balances.map((bal) => ethers.utils.formatUnits(bal, 18))
    console.log(_balances) 

})().catch((err) => {
    console.error(err)
})