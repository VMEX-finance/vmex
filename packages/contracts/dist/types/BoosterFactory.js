"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoosterFactory = void 0;
const contracts_1 = require("@ethersproject/contracts");
class BoosterFactory extends contracts_1.ContractFactory {
    constructor(signer) {
        super(_abi, _bytecode, signer);
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static connect(address, signerOrProvider) {
        return new contracts_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.BoosterFactory = BoosterFactory;
const _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_baseRewardsPool",
                type: "address",
            },
        ],
        name: "addPool",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_gauge",
                type: "address",
            },
        ],
        name: "claimRewards",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "_stake",
                type: "bool",
            },
        ],
        name: "deposit",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "poolInfo",
        outputs: [
            {
                internalType: "address",
                name: "lptoken",
                type: "address",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "gauge",
                type: "address",
            },
            {
                internalType: "address",
                name: "crvRewards",
                type: "address",
            },
            {
                internalType: "address",
                name: "stash",
                type: "address",
            },
            {
                internalType: "bool",
                name: "shutdown",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "withdraw",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
        ],
        name: "withdrawAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_to",
                type: "address",
            },
        ],
        name: "withdrawTo",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x608060405234801561001057600080fd5b50610325806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c806343a0d0661161005b57806343a0d066146100e3578063441a3e70146100f15780636c7b69cb14610104578063958e2d31146101125761007d565b806314cd70e4146100825780631526fe27146100ab57806333ba8882146100d0575b600080fd5b610095610090366004610239565b610125565b6040516100a291906102e4565b60405180910390f35b6100be6100b93660046101d5565b61012e565b6040516100a2969594939291906102a9565b6100956100de3660046101ed565b61017a565b61009561009036600461026d565b6100956100ff366004610218565b6101ae565b6100956100ff3660046101ed565b6100956101203660046101d5565b6101b6565b60019392505050565b600060208190529081526040902080546001820154600283015460038401546004909401546001600160a01b03938416949284169391821692821691811690600160a01b900460ff1686565b600082815260208190526040902060030180546001600160a01b0383166001600160a01b0319909116179055600192915050565b600192915050565b60015b919050565b80356001600160a01b03811681146101b957600080fd5b6000602082840312156101e6578081fd5b5035919050565b600080604083850312156101ff578081fd5b8235915061020f602084016101be565b90509250929050565b6000806040838503121561022a578182fd5b50508035926020909101359150565b60008060006060848603121561024d578081fd5b8335925060208401359150610264604085016101be565b90509250925092565b600080600060608486031215610281578283fd5b83359250602084013591506040840135801515811461029e578182fd5b809150509250925092565b6001600160a01b039687168152948616602086015292851660408501529084166060840152909216608082015290151560a082015260c00190565b90151581526020019056fea2646970667358221220b9e639b98e03ff930f16d02ca2829cf43a9aa669006c2a69bb38dbcc869de64964736f6c63430008000033";
//# sourceMappingURL=BoosterFactory.js.map