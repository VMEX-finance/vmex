import { TOKEN_PRICE, TOKEN } from "../dist/src.ts/constants";
import BatchPriceArtifact from "../artifacts/contracts/analytics/BatchPriceFeed.sol/BatchPriceFeed.json"
import hre from 'hardhat';
const { ethers, artifacts } = hre;
import _ from "lodash";

let _tokens = [['0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012',
'0x547a514d5e3769680Ce22B2361c10Ea13619e8a9'],
['0x0d16d4528239e9ee52fa531af613AcdB23D88c94',
'0x9441D7556e7820B5ca42082cfa99487D56AcA958'],
['0x614715d2Af89E6EC99A233818275142cE88d1Cfd',
'0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A'],
['0x773616E4d11A78F511299002da57A0a94577F1f4',
'0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9'],
['0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B',
'0x23905C55dC11D609D5d11Dc604905779545De9a7'],
['0x656c0544eF4C98A6a98491833A89204Abb045d6b',
'0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc'],
['0xDC530D9457755926550b59e8ECcdaE7624181557',
'0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c'],
['0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9',
'0x56a4857acbcfe3a66965c251628B1c9f1c408C19'],
['0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2',
'0xec1D1B3b0443256cc3860e24a46F108e699484Aa'],
['0x3147D7203354Dc06D9fd350c7a2437bcA92387a4',
'0x0f59666EDE214281e956cb3b2D0d69415AfF4A01'],
['0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c',
'0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699'],
['0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757',
'0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94'],
['0x3886BA987236181D98F2401c507Fb8BeA7871dF2',
'0xec746eCF986E2927Abd291a2A1716c940100f8Ba'],
['0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e',
'0x553303d460EE0afB37EdFf9bE42922D8FF63220e'],
['0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
'0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'],
['0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
'0x3E7d1eAB13ad0104d2750B8863b489D65364e32D'],
['0xdeb288F737066589598e9214E782fa5A8eD689e8',
'0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c'],
['0x7c5d4F8345e66f68099581Db340cd65B078C41f4',
'0xA027702dbb89fbd58938e4324ac03B58d812b0E1'],
['0x2Da4983a622a8498bb1a21FaE9D8F6C664939962',
'0x2885d15b8Af22648b98B122b22FDF4D2a56c6023'],
['0x9b26214bEC078E68a394AaEbfbffF406Ce14893F',
'0xCC1f5d9e6956447630d703C8e93b2345c2DE3D13']]

async function getPriceFeeds(){
    const provider = new ethers.providers.InfuraProvider('mainnet', 'ca0da016dedf4c5a9ee90bfdbafee233')
    

    let contractFactory = new ethers.ContractFactory(BatchPriceArtifact.abi, BatchPriceArtifact.bytecode)
    let data = await provider.call({ data: contractFactory.getDeployTransaction(_tokens).data });
    let [ethPrices, usdPrices] = await new ethers.utils.AbiCoder().decode(["int256[]", "int256[]"], data)
    console.log(await ethPrices, usdPrices)
}

async function main() {
    console.log(await getPriceFeeds())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})