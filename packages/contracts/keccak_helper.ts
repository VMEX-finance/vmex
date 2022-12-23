import { ethers } from 'ethers';


var libPath ="contracts/libraries/logic/ValidationLogic.sol"
var libName = "ValidationLogic"
console.log(ethers.utils.solidityKeccak256(['string'], [`${libPath}:${libName}`]).slice(2, 36))
