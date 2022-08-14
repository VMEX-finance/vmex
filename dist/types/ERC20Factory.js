"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20Factory = void 0;
const contracts_1 = require("@ethersproject/contracts");
class ERC20Factory extends contracts_1.ContractFactory {
    constructor(signer) {
        super(_abi, _bytecode, signer);
    }
    deploy(name, symbol, overrides) {
        return super.deploy(name, symbol, overrides || {});
    }
    getDeployTransaction(name, symbol, overrides) {
        return super.getDeployTransaction(name, symbol, overrides || {});
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
exports.ERC20Factory = ERC20Factory;
const _abi = [
    {
        inputs: [
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "symbol",
                type: "string",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "approve",
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
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "subtractedValue",
                type: "uint256",
            },
        ],
        name: "decreaseAllowance",
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
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "addedValue",
                type: "uint256",
            },
        ],
        name: "increaseAllowance",
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
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "transfer",
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
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "transferFrom",
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
const _bytecode = "0x60806040523480156200001157600080fd5b5060405162000bf438038062000bf48339810160408190526200003491620001c6565b81516200004990600390602085019062000075565b5080516200005f90600490602084019062000075565b50506005805460ff191660121790555062000280565b82805462000083906200022d565b90600052602060002090601f016020900481019282620000a75760008555620000f2565b82601f10620000c257805160ff1916838001178555620000f2565b82800160010185558215620000f2579182015b82811115620000f2578251825591602001919060010190620000d5565b506200010092915062000104565b5090565b5b8082111562000100576000815560010162000105565b600082601f8301126200012c578081fd5b81516001600160401b03808211156200014957620001496200026a565b6040516020601f8401601f19168201810183811183821017156200017157620001716200026a565b604052838252858401810187101562000188578485fd5b8492505b83831015620001ab57858301810151828401820152918201916200018c565b83831115620001bc57848185840101525b5095945050505050565b60008060408385031215620001d9578182fd5b82516001600160401b0380821115620001f0578384fd5b620001fe868387016200011b565b9350602085015191508082111562000214578283fd5b5062000223858286016200011b565b9150509250929050565b6002810460018216806200024257607f821691505b602082108114156200026457634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b61096480620002906000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461012957806370a082311461013c57806395d89b411461014f578063a457c2d714610157578063a9059cbb1461016a578063dd62ed3e1461017d576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100ec57806323b872dd14610101578063313ce56714610114575b600080fd5b6100b6610190565b6040516100c391906106e4565b60405180910390f35b6100df6100da3660046106b0565b610222565b6040516100c391906106d9565b6100f461023f565b6040516100c39190610845565b6100df61010f366004610675565b610245565b61011c6102cc565b6040516100c3919061084e565b6100df6101373660046106b0565b6102d5565b6100f461014a366004610629565b610323565b6100b6610342565b6100df6101653660046106b0565b610351565b6100df6101783660046106b0565b6103b9565b6100f461018b366004610643565b6103cd565b60606003805461019f90610880565b80601f01602080910402602001604051908101604052809291908181526020018280546101cb90610880565b80156102185780601f106101ed57610100808354040283529160200191610218565b820191906000526020600020905b8154815290600101906020018083116101fb57829003601f168201915b5050505050905090565b600061023661022f6103f8565b84846103fc565b50600192915050565b60025490565b60006102528484846104b9565b6102c28461025e6103f8565b6102bd856040518060600160405280602881526020016108e2602891396001600160a01b038a1660009081526001602052604081209061029c6103f8565b6001600160a01b0316815260208101919091526040016000205491906105ce565b6103fc565b5060019392505050565b60055460ff1690565b60006102366102e26103f8565b846102bd85600160006102f36103f8565b6001600160a01b03908116825260208083019390935260409182016000908120918c1681529252902054906105fa565b6001600160a01b0381166000908152602081905260409020545b919050565b60606004805461019f90610880565b600061023661035e6103f8565b846102bd8560405180606001604052806025815260200161090a60259139600160006103886103f8565b6001600160a01b03908116825260208083019390935260409182016000908120918d168152925290205491906105ce565b60006102366103c66103f8565b84846104b9565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3390565b6001600160a01b03831661042b5760405162461bcd60e51b815260040161042290610801565b60405180910390fd5b6001600160a01b0382166104515760405162461bcd60e51b81526004016104229061077a565b6001600160a01b0380841660008181526001602090815260408083209487168084529490915290819020849055517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906104ac908590610845565b60405180910390a3505050565b6001600160a01b0383166104df5760405162461bcd60e51b8152600401610422906107bc565b6001600160a01b0382166105055760405162461bcd60e51b815260040161042290610737565b61051083838361060d565b61054d816040518060600160405280602681526020016108bc602691396001600160a01b03861660009081526020819052604090205491906105ce565b6001600160a01b03808516600090815260208190526040808220939093559084168152205461057c90826105fa565b6001600160a01b0380841660008181526020819052604090819020939093559151908516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906104ac908590610845565b600081848411156105f25760405162461bcd60e51b815260040161042291906106e4565b505050900390565b6000610606828461085c565b9392505050565b505050565b80356001600160a01b038116811461033d57600080fd5b60006020828403121561063a578081fd5b61060682610612565b60008060408385031215610655578081fd5b61065e83610612565b915061066c60208401610612565b90509250929050565b600080600060608486031215610689578081fd5b61069284610612565b92506106a060208501610612565b9150604084013590509250925092565b600080604083850312156106c2578182fd5b6106cb83610612565b946020939093013593505050565b901515815260200190565b6000602080835283518082850152825b81811015610710578581018301518582016040015282016106f4565b818111156107215783604083870101525b50601f01601f1916929092016040019392505050565b60208082526023908201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260408201526265737360e81b606082015260800190565b60208082526022908201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604082015261737360f01b606082015260800190565b60208082526025908201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604082015264647265737360d81b606082015260800190565b60208082526024908201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646040820152637265737360e01b606082015260800190565b90815260200190565b60ff91909116815260200190565b6000821982111561087b57634e487b7160e01b81526011600452602481fd5b500190565b60028104600182168061089457607f821691505b602082108114156108b557634e487b7160e01b600052602260045260246000fd5b5091905056fe45524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa264697066735822122030ccf36c453ad0b0460832251639cd65e3f8435fc7afd04af6b64683f8a0f37564736f6c63430008000033";
