"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WETHGatewayFactory = void 0;
const contracts_1 = require("@ethersproject/contracts");
class WETHGatewayFactory extends contracts_1.ContractFactory {
    constructor(signer) {
        super(_abi, _bytecode, signer);
    }
    deploy(weth, overrides) {
        return super.deploy(weth, overrides || {});
    }
    getDeployTransaction(weth, overrides) {
        return super.getDeployTransaction(weth, overrides || {});
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
exports.WETHGatewayFactory = WETHGatewayFactory;
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "weth",
                type: "address",
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
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        stateMutability: "payable",
        type: "fallback",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "lendingPool",
                type: "address",
            },
        ],
        name: "authorizeLendingPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "lendingPool",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "interesRateMode",
                type: "uint256",
            },
            {
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
            },
        ],
        name: "borrowETH",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "lendingPool",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
            {
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
            },
            {
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
            },
        ],
        name: "depositETH",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "emergencyEtherTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "emergencyTokenTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "getWETHAddress",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "lendingPool",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "rateMode",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
            },
        ],
        name: "repayETH",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "lendingPool",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
        ],
        name: "withdrawETH",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];
const _bytecode = "0x60a060405234801561001057600080fd5b5060405161178f38038061178f83398101604081905261002f9161009c565b6000610039610098565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a35060601b6001600160601b0319166080526100ca565b3390565b6000602082840312156100ad578081fd5b81516001600160a01b03811681146100c3578182fd5b9392505050565b60805160601c61165461013b6000396000818160b00152818161027201528181610428015281816104c0015281816105dd01528181610656015281816106d201528181610768015281816107e8015281816108ff0152818161099501528181610aff0152610c6601526116546000f3fe6080604052600436106100a05760003560e01c80638da5cb5b116100645780638da5cb5b1461018b578063a3d5b255146101b6578063affa8817146101d6578063eed88b8d146101eb578063f2fde38b1461020b578063fd1495291461022b576100f8565b80636599111b14610110578063715018a61461013057806371c5428014610145578063723a828e146101655780637f2357d314610178576100f8565b366100f857336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146100f65760405162461bcd60e51b81526004016100ed906114b6565b60405180910390fd5b005b60405162461bcd60e51b81526004016100ed90611442565b34801561011c57600080fd5b506100f661012b366004611026565b61024b565b34801561013c57600080fd5b506100f661053a565b34801561015157600080fd5b506100f66101603660046110d6565b6105b9565b6100f6610173366004610fcd565b6106d0565b6100f6610186366004611078565b6107d0565b34801561019757600080fd5b506101a0610a33565b6040516101ad91906112d9565b60405180910390f35b3480156101c257600080fd5b506100f66101d1366004610f62565b610a42565b3480156101e257600080fd5b506101a0610afd565b3480156101f757600080fd5b506100f6610206366004610fa2565b610b21565b34801561021757600080fd5b506100f6610226366004610f3f565b610b64565b34801561023757600080fd5b506100f6610246366004610f3f565b610c1a565b604051633dd24bff60e11b81526000906001600160a01b03861690637ba497fe9061029c907f000000000000000000000000000000000000000000000000000000000000000090889060040161132a565b6102206040518083038186803b1580156102b557600080fd5b505afa1580156102c9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ed919061114a565b60e0015190506000816001600160a01b03166370a08231336040518263ffffffff1660e01b815260040161032191906112d9565b60206040518083038186803b15801561033957600080fd5b505afa15801561034d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103719190611288565b9050836000198114156103815750805b6040516323b872dd60e01b81526001600160a01b038416906323b872dd906103b1903390309086906004016112ed565b602060405180830381600087803b1580156103cb57600080fd5b505af11580156103df573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104039190611130565b50604051631d3f462b60e21b81526001600160a01b038816906374fd18ac90610456907f0000000000000000000000000000000000000000000000000000000000000000908a908690309060040161134d565b602060405180830381600087803b15801561047057600080fd5b505af1158015610484573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104a89190611288565b50604051632e1a7d4d60e01b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690632e1a7d4d906104f590849060040161158c565b600060405180830381600087803b15801561050f57600080fd5b505af1158015610523573d6000803e3d6000fd5b505050506105318482610cf1565b50505050505050565b610542610d83565b6000546001600160a01b0390811691161461056f5760405162461bcd60e51b81526004016100ed906114e3565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b60405163151c5e2160e21b81526001600160a01b0386169063547178849061060f907f000000000000000000000000000000000000000000000000000000000000000090889088908890889033906004016113fc565b600060405180830381600087803b15801561062957600080fd5b505af115801561063d573d6000803e3d6000fd5b5050604051632e1a7d4d60e01b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169250632e1a7d4d915061068d90869060040161158c565b600060405180830381600087803b1580156106a757600080fd5b505af11580156106bb573d6000803e3d6000fd5b505050506106c93384610cf1565b5050505050565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663d0e30db0346040518263ffffffff1660e01b81526004016000604051808303818588803b15801561072b57600080fd5b505af115801561073f573d6000803e3d6000fd5b50506040516389fbffeb60e01b81526001600160a01b03881693506389fbffeb925061079891507f0000000000000000000000000000000000000000000000000000000000000000908790349088908890600401611382565b600060405180830381600087803b1580156107b257600080fd5b505af11580156107c6573d6000803e3d6000fd5b5050505050505050565b60008061087b83886001600160a01b0316637ba497fe7f00000000000000000000000000000000000000000000000000000000000000008a6040518363ffffffff1660e01b815260040161082592919061132a565b6102206040518083038186803b15801561083e57600080fd5b505afa158015610852573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610876919061114a565b610d87565b9092509050600060018560028111156108a457634e487b7160e01b600052602160045260246000fd5b60028111156108c357634e487b7160e01b600052602160045260246000fd5b146108ce57816108d0565b825b9050808610156108dd5750845b803410156108fd5760405162461bcd60e51b81526004016100ed90611545565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663d0e30db0826040518263ffffffff1660e01b81526004016000604051808303818588803b15801561095857600080fd5b505af115801561096c573d6000803e3d6000fd5b505060405163f3c2b76b60e01b81526001600160a01b038c16935063f3c2b76b92506109c591507f0000000000000000000000000000000000000000000000000000000000000000908b9034908b908b906004016113c2565b602060405180830381600087803b1580156109df57600080fd5b505af11580156109f3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a179190611288565b50803411156107c6576107c633610a2e83346115cd565b610cf1565b6000546001600160a01b031690565b610a4a610d83565b6000546001600160a01b03908116911614610a775760405162461bcd60e51b81526004016100ed906114e3565b60405163a9059cbb60e01b81526001600160a01b0384169063a9059cbb90610aa59085908590600401611311565b602060405180830381600087803b158015610abf57600080fd5b505af1158015610ad3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610af79190611130565b50505050565b7f000000000000000000000000000000000000000000000000000000000000000090565b610b29610d83565b6000546001600160a01b03908116911614610b565760405162461bcd60e51b81526004016100ed906114e3565b610b608282610cf1565b5050565b610b6c610d83565b6000546001600160a01b03908116911614610b995760405162461bcd60e51b81526004016100ed906114e3565b6001600160a01b038116610bbf5760405162461bcd60e51b81526004016100ed90611470565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b610c22610d83565b6000546001600160a01b03908116911614610c4f5760405162461bcd60e51b81526004016100ed906114e3565b60405163095ea7b360e01b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063095ea7b390610c9f90849060001990600401611311565b602060405180830381600087803b158015610cb957600080fd5b505af1158015610ccd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b609190611130565b604080516000808252602082019092526001600160a01b038416908390604051610d1b91906112a0565b60006040518083038185875af1925050503d8060008114610d58576040519150601f19603f3d011682016040523d82523d6000602084013e610d5d565b606091505b5050905080610d7e5760405162461bcd60e51b81526004016100ed90611518565b505050565b3390565b6000808261010001516001600160a01b03166370a08231856040518263ffffffff1660e01b8152600401610dbb91906112d9565b60206040518083038186803b158015610dd357600080fd5b505afa158015610de7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e0b9190611288565b8361012001516001600160a01b03166370a08231866040518263ffffffff1660e01b8152600401610e3c91906112d9565b60206040518083038186803b158015610e5457600080fd5b505afa158015610e68573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e8c9190611288565b915091509250929050565b8051610ea2816115f0565b919050565b80518015158114610ea257600080fd5b600060208284031215610ec8578081fd5b610ed26020611595565b9151825250919050565b80516fffffffffffffffffffffffffffffffff81168114610ea257600080fd5b803561ffff81168114610ea257600080fd5b805164ffffffffff81168114610ea257600080fd5b8051610ea281611608565b805160ff81168114610ea257600080fd5b600060208284031215610f50578081fd5b8135610f5b816115f0565b9392505050565b600080600060608486031215610f76578182fd5b8335610f81816115f0565b92506020840135610f91816115f0565b929592945050506040919091013590565b60008060408385031215610fb4578182fd5b8235610fbf816115f0565b946020939093013593505050565b60008060008060808587031215610fe2578081fd5b8435610fed816115f0565b93506020850135610ffd81611608565b9250604085013561100d816115f0565b915061101b60608601610efc565b905092959194509250565b6000806000806080858703121561103b578384fd5b8435611046816115f0565b9350602085013561105681611608565b925060408501359150606085013561106d816115f0565b939692955090935050565b600080600080600060a0868803121561108f578081fd5b853561109a816115f0565b945060208601356110aa81611608565b9350604086013592506060860135915060808601356110c8816115f0565b809150509295509295909350565b600080600080600060a086880312156110ed578283fd5b85356110f8816115f0565b9450602086013561110881611608565b9350604086013592506060860135915061112460808701610efc565b90509295509295909350565b600060208284031215611141578081fd5b610f5b82610ea7565b600061022080838503121561115d578182fd5b61116681611595565b90506111728484610eb7565b815261118060208401610edc565b602082015261119160408401610edc565b60408201526111a260608401610edc565b60608201526111b360808401610edc565b60808201526111c460a08401610edc565b60a08201526111d560c08401610f0e565b60c08201526111e660e08401610e97565b60e08201526101006111f9818501610e97565b9082015261012061120b848201610e97565b9082015261014061121d848201610e97565b9082015261016061122f848201610f2e565b90820152610180611241848201610f23565b908201526101a083810151908201526101c061125e818501610ea7565b908201526101e0611270848201610ea7565b90820152610200928301519281019290925250919050565b600060208284031215611299578081fd5b5051919050565b60008251815b818110156112c057602081860181015185830152016112a6565b818111156112ce5782828501525b509190910192915050565b6001600160a01b0391909116815260200190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03929092168252602082015260400190565b6001600160a01b0392909216825267ffffffffffffffff16602082015260400190565b6001600160a01b03948516815267ffffffffffffffff9390931660208401526040830191909152909116606082015260800190565b6001600160a01b03958616815267ffffffffffffffff9490941660208501526040840192909252909216606082015261ffff909116608082015260a00190565b6001600160a01b03958616815267ffffffffffffffff94909416602085015260408401929092526060830152909116608082015260a00190565b6001600160a01b03968716815267ffffffffffffffff9590951660208601526040850193909352606084019190915261ffff16608083015290911660a082015260c00190565b60208082526014908201527311985b1b189858dac81b9bdd08185b1b1bddd95960621b604082015260600190565b60208082526026908201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160408201526564647265737360d01b606082015260800190565b602080825260139082015272149958d95a5d99481b9bdd08185b1b1bddd959606a1b604082015260600190565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b60208082526013908201527211551217d514905394d1915497d19052531151606a1b604082015260600190565b60208082526027908201527f6d73672e76616c7565206973206c657373207468616e2072657061796d656e7460408201526608185b5bdd5b9d60ca1b606082015260800190565b90815260200190565b60405181810167ffffffffffffffff811182821017156115c557634e487b7160e01b600052604160045260246000fd5b604052919050565b6000828210156115eb57634e487b7160e01b81526011600452602481fd5b500390565b6001600160a01b038116811461160557600080fd5b50565b67ffffffffffffffff8116811461160557600080fdfea26469706673582212203817ad4f4b423c71225dbdab8ca5cb37601aedeb7899926545403d52cef0ab6864736f6c63430008000033";
//# sourceMappingURL=WETHGatewayFactory.js.map