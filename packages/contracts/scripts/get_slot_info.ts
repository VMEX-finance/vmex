import hre from 'hardhat';
import { getParamPerNetwork } from '../helpers/contracts-helpers';
import { eOptimismNetwork } from '../helpers/types';
import OptimismConfig from '../../src/markets/optimism';
const { ethers, artifacts } = hre;
const {execSync} = require('child_process')

// import { default as fetch } from 'cross-fetch';
// import { JSDOM } from 'jsdom';

// async function getFirstAddress(): Promise<string> {
//   const url = 'https://optimistic.etherscan.io/token/0x2232455bf4622002c1416153ee59fd32b239863b#balances';

//   try {
//     const response = await fetch(url);
//     const html = await response.text();

//     const dom = new JSDOM(html);
//     const document = dom.window._document;

//     console.log("Document: ", document)

//     const firstRow = document.querySelector('#balances');
//     console.log("First row: ", firstRow)
//     console.log("First row: ", firstRow.innerHTML)
//     const addressColumn = firstRow?.querySelector('td:nth-child(1)');
//     console.log("addressColumn: ",addressColumn)
//     if (addressColumn) {
//       const address = addressColumn.textContent?.trim();
//       return address || '';
//     } else {
//       console.error('No address found in the table.');
//       return '';
//     }
//   } catch (error) {
//     console.error('Error occurred while fetching or parsing the page:', error);
//     return '';
//   }
// }


const Tokenabi = [
    "function allowance(address owner, address spender) external view returns (uint256 remaining)",
    "function approve(address spender, uint256 value) external returns (bool success)",
    "function balanceOf(address owner) external view returns (uint256 balance)",
    "function decimals() external view returns (uint8 decimalPlaces)",
    "function name() external view returns (string memory tokenName)",
    "function symbol() external view returns (string memory tokenSymbol)",
    "function totalSupply() external view returns (uint256 totalTokensIssued)",
    "function transfer(address to, uint256 value) external returns (bool success)",
    "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
    "function deposit() public payable",
    "function withdraw(uint wad) public"
];

async function getSlotInfo(){
    // getFirstAddress()
    //         .then((address) => {
    //             console.log('First address in the table:', address);
    //         })
    //         .catch((error) => {
    //             console.error('Error occurred:', error);
    //         });
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const tokens = await getParamPerNetwork(OptimismConfig.ReserveAssets, eOptimismNetwork.optimism);
    if(!tokens){
        return
      }
    for(let [symbol, address] of Object.entries(tokens)){
        console.log("Testing ",symbol)
        var token = new ethers.Contract(address,Tokenabi)
        var balance = await token.connect(provider).balanceOf("0x0000000000000000000000000000000000000000");
        if(balance.toString()!= "0") {
            const cmd = "npx slot20 balanceOf " + address + " 0x0000000000000000000000000000000000000000 -v";
            execSync(
                cmd,
                {stdio: 'inherit'}
            )
        }
        else {
            
        }
        console.log("----------------------\n\n")
    }
    
}

async function main() {
    await getSlotInfo()
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})