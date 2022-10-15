const { expect } = require("chai");
const { 
    borrow,
    marketReserveAsCollateral,
    withdraw,
    repay,
    swapBorrowRateMode,
    supply
} = require("../dist/src.ts/protocol.js");


const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WETHabi = [
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


describe("Protocol - end-to-end test", () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    
    it("signer should receive 1 WETH so he can transact for LP tokens", async () => {
        const owner = provider.getSigner();
        const WETH = new ethers.Contract(WETHadd, WETHabi, owner);
        await WETH.connect(owner).deposit({ value: ethers.utils.parseEther("1.0")});
        expect(await WETH.balanceOf(await owner.getAddress())).to.equal(ethers.utils.parseEther("1.0"))
    });

    
    
})