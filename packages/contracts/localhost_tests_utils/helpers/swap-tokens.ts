import { ethers } from "ethers";
import { tEthereumAddress } from "../../helpers/types";
const fs = require('fs');

const WETHadd = "0x4200000000000000000000000000000000000006"

const VELO_ROUTER_ADDRESS = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f"
const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_utils/abis/velo.json").toString()

export async function veloSwapForTokens(tokenAddr: tEthereumAddress, signer: any) {
  const VELO_ROUTER_CONTRACT = new ethers.Contract(VELO_ROUTER_ADDRESS, VELO_ROUTER_ABI)
  var path = [WETHadd, tokenAddr, false];
  // await myWETH.connect(signer).approve(VELO_ROUTER_ADDRESS,ethers.utils.parseEther("100000.0"))
  var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
  var options = {value: ethers.utils.parseEther("1000.0")}
  
  await VELO_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseUnits("0.0", 18), [path], await signer.getAddress(), deadline,options)
}