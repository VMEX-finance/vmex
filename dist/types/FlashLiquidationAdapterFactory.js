"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashLiquidationAdapterFactory = void 0;
const contracts_1 = require("@ethersproject/contracts");
class FlashLiquidationAdapterFactory extends contracts_1.ContractFactory {
    constructor(signer) {
        super(_abi, _bytecode, signer);
    }
    deploy(addressesProvider, uniswapRouter, wethAddress, overrides) {
        return super.deploy(addressesProvider, uniswapRouter, wethAddress, overrides || {});
    }
    getDeployTransaction(addressesProvider, uniswapRouter, wethAddress, overrides) {
        return super.getDeployTransaction(addressesProvider, uniswapRouter, wethAddress, overrides || {});
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
exports.FlashLiquidationAdapterFactory = FlashLiquidationAdapterFactory;
const _abi = [
    {
        inputs: [
            {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "addressesProvider",
                type: "address",
            },
            {
                internalType: "contract IUniswapV2Router02",
                name: "uniswapRouter",
                type: "address",
            },
            {
                internalType: "address",
                name: "wethAddress",
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
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "fromAsset",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "toAsset",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "fromAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "receivedAmount",
                type: "uint256",
            },
        ],
        name: "Swapped",
        type: "event",
    },
    {
        inputs: [],
        name: "ADDRESSES_PROVIDER",
        outputs: [
            {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "FLASHLOAN_PREMIUM_TOTAL",
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
        name: "LENDING_POOL",
        outputs: [
            {
                internalType: "contract ILendingPool",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "MAX_SLIPPAGE_PERCENT",
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
        name: "ORACLE",
        outputs: [
            {
                internalType: "contract IPriceOracleGetter",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "UNISWAP_ROUTER",
        outputs: [
            {
                internalType: "contract IUniswapV2Router02",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "USD_ADDRESS",
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
        name: "WETH_ADDRESS",
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
        inputs: [
            {
                internalType: "address[]",
                name: "assets",
                type: "address[]",
            },
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]",
            },
            {
                internalType: "uint256[]",
                name: "premiums",
                type: "uint256[]",
            },
            {
                internalType: "address",
                name: "initiator",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "params",
                type: "bytes",
            },
        ],
        name: "executeOperation",
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
                name: "amountOut",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "reserveIn",
                type: "address",
            },
            {
                internalType: "address",
                name: "reserveOut",
                type: "address",
            },
        ],
        name: "getAmountsIn",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "address[]",
                name: "",
                type: "address[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "reserveIn",
                type: "address",
            },
            {
                internalType: "address",
                name: "reserveOut",
                type: "address",
            },
        ],
        name: "getAmountsOut",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "address[]",
                name: "",
                type: "address[]",
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
                internalType: "contract IERC20",
                name: "token",
                type: "address",
            },
        ],
        name: "rescueTokens",
        outputs: [],
        stateMutability: "nonpayable",
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
];
const _bytecode = "0x6101206040523480156200001257600080fd5b5060405162002df838038062002df88339810160408190526200003591620001fd565b82828282806001600160a01b03166080816001600160a01b031660601b81525050806001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b1580156200009057600080fd5b505afa158015620000a5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000cb9190620001d7565b60601b6001600160601b03191660a052506000620000e8620001d3565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350826001600160a01b031663f139dc816040518163ffffffff1660e01b815260040160206040518083038186803b1580156200016c57600080fd5b505afa15801562000181573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001a79190620001d7565b6001600160601b0319606091821b811660e05292811b8316610100521b1660c052506200026992505050565b3390565b600060208284031215620001e9578081fd5b8151620001f68162000250565b9392505050565b60008060006060848603121562000212578182fd5b83516200021f8162000250565b6020850151909350620002328162000250565b6040850151909250620002458162000250565b809150509250925092565b6001600160a01b03811681146200026657600080fd5b50565b60805160601c60a05160601c60c05160601c60e05160601c6101005160601c612ab662000342600039600081816106350152818161104e01528181611142015281816116df01528181611781015281816119d101528181611e5d0152611f4e01526000818161038401526120a801526000818161033101528181610eec01528181610f2901528181610fa70152818161186b01528181611cfb01528181611d380152611db6015260008181610441015281816105bc015281816108ed015281816109830152610bed015260006103550152612ab66000f3fe608060405234801561001057600080fd5b50600436106100f45760003560e01c80638da5cb5b11610097578063baf7fa9911610066578063baf7fa9914610199578063cdf58cd6146101bd578063d8264920146101d0578063f2fde38b146101d8576100f4565b80638da5cb5b14610161578063920f5c84146101695780639d1211bf14610189578063b4dcfc7714610191576100f4565b8063074b2e43116100d3578063074b2e431461013457806332e4b2861461014957806338013f0214610151578063715018a614610159576100f4565b8062ae3bf8146100f9578063040141e51461010e5780630542975c1461012c575b600080fd5b61010c6101073660046122d6565b6101eb565b005b61011661032f565b6040516101239190612604565b60405180910390f35b610116610353565b61013c610377565b604051610123919061281e565b61013c61037c565b610116610382565b61010c6103a6565b610116610425565b61017c610177366004612376565b610434565b604051610123919061269e565b6101166105a2565b6101166105ba565b6101ac6101a736600461255f565b6105de565b604051610123959493929190612884565b6101ac6101cb36600461255f565b61061e565b610116610633565b61010c6101e63660046122d6565b610657565b6101f361070d565b6000546001600160a01b039081169116146102295760405162461bcd60e51b8152600401610220906127bc565b60405180910390fd5b806001600160a01b031663a9059cbb610240610425565b6040516370a0823160e01b81526001600160a01b038516906370a082319061026c903090600401612604565b60206040518083038186803b15801561028457600080fd5b505afa158015610298573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102bc9190612547565b6040518363ffffffff1660e01b81526004016102d9929190612685565b602060405180830381600087803b1580156102f357600080fd5b505af1158015610307573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061032b919061252d565b5050565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b600981565b610bb881565b7f000000000000000000000000000000000000000000000000000000000000000081565b6103ae61070d565b6000546001600160a01b039081169116146103db5760405162461bcd60e51b8152600401610220906127bc565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6000546001600160a01b031690565b6000336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461047e5760405162461bcd60e51b8152600401610220906126fc565b60006104bf84848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061071192505050565b905060018a14801561051b575080602001516001600160a01b03168b8b60008181106104fb57634e487b7160e01b600052603260045260246000fd5b905060200201602081019061051091906122d6565b6001600160a01b0316145b6105375760405162461bcd60e51b8152600401610220906127f1565b610591818a8a600081811061055c57634e487b7160e01b600052603260045260246000fd5b905060200201358989600081811061058457634e487b7160e01b600052603260045260246000fd5b905060200201358861078d565b5060019a9950505050505050505050565b7310f7fc1f91ba351f9c629c5947ad69bd03c05b9681565b7f000000000000000000000000000000000000000000000000000000000000000081565b600080600080606060006105f388888b610d1c565b8051602082015160408301516060840151608090940151929d919c509a509198509650945050505050565b600080600080606060006105f388888b6113d8565b7f000000000000000000000000000000000000000000000000000000000000000081565b61065f61070d565b6000546001600160a01b0390811691161461068c5760405162461bcd60e51b8152600401610220906127bc565b6001600160a01b0381166106b25760405162461bcd60e51b815260040161022090612733565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b3390565b6107196121d4565b6000806000806000808780602001905181019061073691906122f2565b6040805160c0810182526001600160a01b039788168152958716602087015267ffffffffffffffff9094169385019390935293166060830152608082019290925290151560a082015296505050505050505b919050565b610795612209565b84516040516370a0823160e01b81526001600160a01b03909116906370a08231906107c4903090600401612604565b60206040518083038186803b1580156107dc57600080fd5b505afa1580156107f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108149190612547565b6040820152602085015185516001600160a01b039081169116146108c55784602001516001600160a01b03166370a08231306040518263ffffffff1660e01b81526004016108629190612604565b60206040518083038186803b15801561087a57600080fd5b505afa15801561088e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108b29190612547565b8082526108bf90856115f4565b60e08201525b6108cf8484611609565b81608001818152505084602001516001600160a01b031663095ea7b37f000000000000000000000000000000000000000000000000000000000000000087608001516040518363ffffffff1660e01b815260040161092e929190612685565b602060405180830381600087803b15801561094857600080fd5b505af115801561095c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610980919061252d565b507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663ee125ca086600001518760200151886040015189606001518a6080015160006040518763ffffffff1660e01b81526004016109ec96959493929190612641565b600060405180830381600087803b158015610a0657600080fd5b505af1158015610a1a573d6000803e3d6000fd5b505086516040516370a0823160e01b8152600093506001600160a01b0390911691506370a0823190610a50903090600401612604565b60206040518083038186803b158015610a6857600080fd5b505afa158015610a7c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aa09190612547565b9050610ab98260400151826115f490919063ffffffff16565b6060830152602086015186516001600160a01b03908116911614610bc35760208601516040516370a0823160e01b81526000916001600160a01b0316906370a0823190610b0a903090600401612604565b60206040518083038186803b158015610b2257600080fd5b505afa158015610b36573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b5a9190612547565b9050610b738360e00151826115f490919063ffffffff16565b602080850182905288519089015160608601516080870151610ba394610b9991906115f4565b8b60a00151611615565b60a084018190526060840151610bb8916115f4565b60c084015250610bd8565b6060820151610bd290856115f4565b60c08301525b85602001516001600160a01b031663095ea7b37f000000000000000000000000000000000000000000000000000000000000000084608001516040518363ffffffff1660e01b8152600401610c2e929190612685565b602060405180830381600087803b158015610c4857600080fd5b505af1158015610c5c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c80919061252d565b5060c082015115610d1457855160c083015160405163a9059cbb60e01b81526001600160a01b039092169163a9059cbb91610cc091879190600401612685565b602060405180830381600087803b158015610cda57600080fd5b505af1158015610cee573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d12919061252d565b505b505050505050565b610d2461224e565b6000610d47610d40612710610d3a866009611b3a565b90611b46565b84906115f4565b9050836001600160a01b0316856001600160a01b03161415610e27576000610d6e86611b52565b60408051600180825281830190925291925060009190602080830190803683370190505090508681600081518110610db657634e487b7160e01b600052603260045260246000fd5b6001600160a01b039092166020928302919091018201526040805160a08101909152848152908101610df487610d3a87670de0b6b3a7640000611b3a565b8152602001610e04898886611bce565b8152602001610e14898686611bce565b81526020018281525093505050506113d1565b6040805160028082526060820183526000926020830190803683370190505090508581600081518110610e6a57634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250508481600181518110610eac57634e487b7160e01b600052603260045260246000fd5b6001600160a01b039290921660209283029190910182015260408051600380825260808201909252606092839260009291820184803683370190505090507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316896001600160a01b031614158015610f5e57507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316886001600160a01b031614155b15611106578881600081518110610f8557634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250507f000000000000000000000000000000000000000000000000000000000000000081600181518110610fe757634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b031681525050878160028151811061102957634e487b7160e01b600052603260045260246000fd5b6001600160a01b03928316602091820292909201015260405163d06ca61f60e01b81527f00000000000000000000000000000000000000000000000000000000000000009091169063d06ca61f906110879088908590600401612827565b60006040518083038186803b15801561109f57600080fd5b505afa9250505080156110d457506040513d6000823e601f3d908101601f191682016040526110d19190810190612473565b60015b6110fe57604080516003808252608082019092529060208201606080368337019050509150611101565b91505b611128565b6040805160038082526080820190925290602082016060803683370190505091505b60405163d06ca61f60e01b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063d06ca61f906111799089908990600401612827565b60006040518083038186803b15801561119157600080fd5b505afa9250505080156111c657506040513d6000823e601f3d908101601f191682016040526111c39190810190612473565b60015b61121a5760408051600280825260608201835290916020830190803683370190505093508260028151811061120b57634e487b7160e01b600052603260045260246000fd5b602002602001015190506112d0565b8094508460018151811061123e57634e487b7160e01b600052603260045260246000fd5b60200260200101518460028151811061126757634e487b7160e01b600052603260045260246000fd5b6020026020010151116112a2578460018151811061129557634e487b7160e01b600052603260045260246000fd5b60200260200101516112cc565b836002815181106112c357634e487b7160e01b600052603260045260246000fd5b60200260200101515b9150505b60006112db8b611b52565b905060006112e88b611b52565b9050600061132a6113046112fd85600a612938565b8690611b3a565b610d3a61131285600a612938565b6113248d670de0b6b3a7640000611b3a565b90611b3a565b90506040518060a0016040528085815260200182815260200161134e8f8e87611bce565b815260200161135e8e8786611bce565b815260200185156113a5578860018151811061138a57634e487b7160e01b600052603260045260246000fd5b6020026020010151861461139e57866113a0565b895b6113c3565b60408051600280825260608201835290916020830190803683375050505b905299505050505050505050505b9392505050565b6113e061224e565b826001600160a01b0316846001600160a01b031614156114ca576000611417611410612710610d3a866009611b3a565b8490611609565b9050600061142486611b52565b6040805160018082528183019092529192506000919060208083019080368337019050509050868160008151811061146c57634e487b7160e01b600052603260045260246000fd5b6001600160a01b039092166020928302919091018201526040805160a081019091528481529081016114aa85610d3a89670de0b6b3a7640000611b3a565b81526020016114ba898686611bce565b8152602001610e14898886611bce565b6000806114d8868686611c2f565b91509150600061155a611523612710610d3a60098760008151811061150d57634e487b7160e01b600052603260045260246000fd5b6020026020010151611b3a90919063ffffffff16565b8460008151811061154457634e487b7160e01b600052603260045260246000fd5b602002602001015161160990919063ffffffff16565b9050600061156788611b52565b9050600061157488611b52565b905060006115a96115896112fd84600a612938565b610d3a61159786600a612938565b6113248c670de0b6b3a7640000611b3a565b90506040518060a001604052808581526020018281526020016115cd8c8787611bce565b81526020016115dd8b8b86611bce565b815260200195909552509298975050505050505050565b60006116008284612a25565b90505b92915050565b600061160082846128ba565b60008061162187611b52565b9050600061162e87611b52565b9050600061163b8961208e565b905060006116488961208e565b9050600061169a61165d612710610bb8611609565b61169461167561166e88600a612938565b8790611b3a565b610d3a61168d6116868b600a612938565b8890611b3a565b8d90611b3a565b9061212d565b90508089106116bb5760405162461bcd60e51b815260040161022090612779565b60405163095ea7b360e01b81526001600160a01b038c169063095ea7b39061170a907f000000000000000000000000000000000000000000000000000000000000000090600090600401612685565b602060405180830381600087803b15801561172457600080fd5b505af1158015611738573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061175c919061252d565b5060405163095ea7b360e01b81526001600160a01b038c169063095ea7b3906117ab907f0000000000000000000000000000000000000000000000000000000000000000908d90600401612685565b602060405180830381600087803b1580156117c557600080fd5b505af11580156117d9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117fd919061252d565b5060608715611912576040805160038082526080820190925290602082016060803683370190505090508b8160008151811061184957634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250507f0000000000000000000000000000000000000000000000000000000000000000816001815181106118ab57634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250508a816002815181106118ed57634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250506119b7565b60408051600280825260608201835290916020830190803683370190505090508b8160008151811061195457634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250508a8160018151811061199657634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250505b604051634401edf760e11b81526000906001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638803dbee90611a0e908d908f90879030904290600401612848565b600060405180830381600087803b158015611a2857600080fd5b505af1158015611a3c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052611a649190810190612473565b90507fa078c4190abe07940190effc1846be0ccf03ad6007bc9e93f9697d0b460befbb8d8d83600081518110611aaa57634e487b7160e01b600052603260045260246000fd5b60200260200101518460018651611ac19190612a25565b81518110611adf57634e487b7160e01b600052603260045260246000fd5b6020026020010151604051611af79493929190612618565b60405180910390a180600081518110611b2057634e487b7160e01b600052603260045260246000fd5b602002602001015197505050505050505095945050505050565b60006116008284612a06565b600061160082846128d2565b6000816001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b158015611b8d57600080fd5b505afa158015611ba1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bc591906125a0565b60ff1692915050565b600080611bee7310f7fc1f91ba351f9c629c5947ad69bd03c05b9661208e565b90506000611bfb8661208e565b9050611c25670de0b6b3a7640000610d3a84611324611c1b89600a612938565b610d3a8b88611b3a565b9695505050505050565b604080516002808252606082810190935282916000918160200160208202803683370190505090508581600081518110611c7957634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250508481600181518110611cbb57634e487b7160e01b600052603260045260246000fd5b6001600160a01b039290921660209283029190910182015260408051600380825260808201909252606092839260009291820184803683370190505090507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316896001600160a01b031614158015611d6d57507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316886001600160a01b031614155b15611f15578881600081518110611d9457634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250507f000000000000000000000000000000000000000000000000000000000000000081600181518110611df657634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250508781600281518110611e3857634e487b7160e01b600052603260045260246000fd5b6001600160a01b0392831660209182029290920101526040516307c0329d60e21b81527f000000000000000000000000000000000000000000000000000000000000000090911690631f00ca7490611e96908a908590600401612827565b60006040518083038186803b158015611eae57600080fd5b505afa925050508015611ee357506040513d6000823e601f3d908101601f19168201604052611ee09190810190612473565b60015b611f0d57604080516003808252608082019092529060208201606080368337019050509150611f10565b91505b611f37565b6040805160038082526080820190925290602082016060803683370190505091505b6040516307c0329d60e21b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690631f00ca7490611f85908a908890600401612827565b60006040518083038186803b158015611f9d57600080fd5b505afa925050508015611fd257506040513d6000823e601f3d908101601f19168201604052611fcf9190810190612473565b60015b611fe3579094509250612086915050565b8093508360008151811061200757634e487b7160e01b600052603260045260246000fd5b60200260200101518360008151811061203057634e487b7160e01b600052603260045260246000fd5b602002602001015110801561206e57508260008151811061206157634e487b7160e01b600052603260045260246000fd5b6020026020010151600014155b61207957838561207c565b82825b9650965050505050505b935093915050565b60405163b3596f0760e01b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063b3596f07906120dd908590600401612604565b60206040518083038186803b1580156120f557600080fd5b505afa158015612109573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116039190612547565b600082158061213a575081155b1561214757506000611603565b8161215560026127106128d2565b61216190600019612a25565b61216b91906128d2565b83111560405180604001604052806002815260200161068760f31b815250906121a75760405162461bcd60e51b815260040161022091906126a9565b506127106121b66002826128d2565b6121c08486612a06565b6121ca91906128ba565b61160091906128d2565b6040805160c081018252600080825260208201819052918101829052606081018290526080810182905260a081019190915290565b60405180610100016040528060008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081525090565b6040518060a0016040528060008152602001600081526020016000815260200160008152602001606081525090565b60008083601f84011261228e578081fd5b50813567ffffffffffffffff8111156122a5578182fd5b60208301915083602080830285010111156122bf57600080fd5b9250929050565b8051801515811461078857600080fd5b6000602082840312156122e7578081fd5b81356113d181612a68565b60008060008060008060c0878903121561230a578182fd5b865161231581612a68565b602088015190965061232681612a68565b604088015190955067ffffffffffffffff81168114612343578283fd5b606088015190945061235481612a68565b6080880151909350915061236a60a088016122c6565b90509295509295509295565b600080600080600080600080600060a08a8c031215612393578283fd5b893567ffffffffffffffff808211156123aa578485fd5b6123b68d838e0161227d565b909b50995060208c01359150808211156123ce578485fd5b6123da8d838e0161227d565b909950975060408c01359150808211156123f2578485fd5b6123fe8d838e0161227d565b909750955060608c0135915061241382612a68565b90935060808b01359080821115612428578384fd5b818c0191508c601f83011261243b578384fd5b813581811115612449578485fd5b8d602082850101111561245a578485fd5b6020830194508093505050509295985092959850929598565b60006020808385031215612485578182fd5b825167ffffffffffffffff8082111561249c578384fd5b818501915085601f8301126124af578384fd5b8151818111156124c1576124c1612a52565b838102604051858282010181811085821117156124e0576124e0612a52565b604052828152858101935084860182860187018a10156124fe578788fd5b8795505b83861015612520578051855260019590950194938601938601612502565b5098975050505050505050565b60006020828403121561253e578081fd5b611600826122c6565b600060208284031215612558578081fd5b5051919050565b600080600060608486031215612573578283fd5b83359250602084013561258581612a68565b9150604084013561259581612a68565b809150509250925092565b6000602082840312156125b1578081fd5b815160ff811681146113d1578182fd5b6000815180845260208085019450808401835b838110156125f95781516001600160a01b0316875295820195908201906001016125d4565b509495945050505050565b6001600160a01b0391909116815260200190565b6001600160a01b0394851681529290931660208301526040820152606081019190915260800190565b6001600160a01b039687168152948616602086015267ffffffffffffffff93909316604085015293166060830152608082019290925290151560a082015260c00190565b6001600160a01b03929092168252602082015260400190565b901515815260200190565b6000602080835283518082850152825b818110156126d5578581018301518582016040015282016126b9565b818111156126e65783604083870101525b50601f01601f1916929092016040019392505050565b6020808252601b908201527f43414c4c45525f4d5553545f42455f4c454e44494e475f504f4f4c0000000000604082015260600190565b60208082526026908201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160408201526564647265737360d01b606082015260800190565b60208082526023908201527f6d6178416d6f756e74546f5377617020657863656564206d617820736c69707060408201526261676560e81b606082015260800190565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b602080825260139082015272494e434f4e53495354454e545f504152414d5360681b604082015260600190565b90815260200190565b60008382526040602083015261284060408301846125c1565b949350505050565b600086825285602083015260a0604083015261286760a08301866125c1565b6001600160a01b0394909416606083015250608001529392505050565b600086825285602083015284604083015283606083015260a060808301526128af60a08301846125c1565b979650505050505050565b600082198211156128cd576128cd612a3c565b500190565b6000826128ed57634e487b7160e01b81526012600452602481fd5b500490565b80825b6001808611612904575061292f565b81870482111561291657612916612a3c565b8086161561292357918102915b9490941c9380026128f5565b94509492505050565b60006116006000198484600082612951575060016113d1565b8161295e575060006113d1565b8160018114612974576002811461297e576129ab565b60019150506113d1565b60ff84111561298f5761298f612a3c565b6001841b9150848211156129a5576129a5612a3c565b506113d1565b5060208310610133831016604e8410600b84101617156129de575081810a838111156129d9576129d9612a3c565b6113d1565b6129eb84848460016128f2565b8086048211156129fd576129fd612a3c565b02949350505050565b6000816000190483118215151615612a2057612a20612a3c565b500290565b600082821015612a3757612a37612a3c565b500390565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612a7d57600080fd5b5056fea264697066735822122069b1ce2e3ef14e008b02dec8a5dc62058813af2dbe6df31c0ba14ed0d50f3e1264736f6c63430008000033";
//# sourceMappingURL=FlashLiquidationAdapterFactory.js.map