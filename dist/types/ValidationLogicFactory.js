"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationLogicFactory = void 0;
const contracts_1 = require("@ethersproject/contracts");
class ValidationLogicFactory extends contracts_1.ContractFactory {
    constructor(linkLibraryAddresses, signer) {
        super(_abi, ValidationLogicFactory.linkBytecode(linkLibraryAddresses), signer);
    }
    static linkBytecode(linkLibraryAddresses) {
        let linkedBytecode = _bytecode;
        linkedBytecode = linkedBytecode.replace(new RegExp("__\\$52a8a86ab43135662ff256bbc95497e8e3\\$__", "g"), linkLibraryAddresses["__$52a8a86ab43135662ff256bbc95497e8e3$__"]
            .replace(/^0x/, "")
            .toLowerCase());
        return linkedBytecode;
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
exports.ValidationLogicFactory = ValidationLogicFactory;
const _abi = [
    {
        inputs: [],
        name: "REBALANCE_UP_LIQUIDITY_RATE_THRESHOLD",
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
        name: "REBALANCE_UP_USAGE_RATIO_THRESHOLD",
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
];
const _bytecode = "0x6126ac61003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061009d5760003560e01c80635494eb8a116100705780635494eb8a146100f0578063a8695b1d1461010e578063abfcc86a14610121578063d915715414610129578063fa0c21491461013c5761009d565b80630eca322b146100a2578063343b088f146100b757806350419a10146100ca578063548cad09146100dd575b600080fd5b6100b56100b036600461227c565b61014f565b005b6100b56100c5366004612014565b610217565b6100b56100d8366004612148565b610713565b6100b56100eb3660046121cd565b6108ea565b6100f8610be0565b604051610105919061245d565b60405180910390f35b6100b561011c366004612234565b610bf0565b6100f8610eb1565b6100b5610137366004611f6a565b610eb7565b6100b561014a36600461229d565b61109a565b60008061015b84611208565b50506040805180820190915260018152603160f81b60208201529193509150836101a15760405162461bcd60e51b8152600401610198919061234a565b60405180910390fd5b506040805180820190915260018152601960f91b6020820152826101d85760405162461bcd60e51b8152600401610198919061234a565b506040805180820190915260018152603360f81b602082015281156102105760405162461bcd60e51b8152600401610198919061234a565b5050505050565b61021f611dbd565b6102288a611208565b151561014085015215156101208401521515610100830152151560e082018190526040805180820190915260018152601960f91b60208201529061027f5760405162461bcd60e51b8152600401610198919061234a565b5080610100015115604051806040016040528060018152602001603360f81b815250906102bf5760405162461bcd60e51b8152600401610198919061234a565b5060808b01516040805180820190915260018152603160f81b6020820152906102fb5760405162461bcd60e51b8152600401610198919061234a565b50806101200151604051806040016040528060018152602001603760f81b8152509061033a5760405162461bcd60e51b8152600401610198919061234a565b5060a08b015160021480610352575060a08b01516001145b604051806040016040528060018152602001600760fb1b8152509061038a5760405162461bcd60e51b8152600401610198919061234a565b506040805180820182528c8201516001600160a01b031681526020808e01516001600160401b0316818301528251908101909252875482526103d191899088888888611240565b60c08601526020808601919091529084526080840191909152606083018290526040805180820190915260018152603960f81b91810191909152906104295760405162461bcd60e51b8152600401610198919061234a565b50670de0b6b3a76400008160c001511160405180604001604052806002815260200161031360f41b815250906104725760405162461bcd60e51b8152600401610198919061234a565b508051608082015161048f9190610489908c6118be565b906118d3565b6040808301829052606083015181518083019092526002825261313160f01b6020830152909111156104d45760405162461bcd60e51b8152600401610198919061234a565b5060018b60a0015114156107065780610140015160405180604001604052806002815260200161189960f11b815250906105215760405162461bcd60e51b8152600401610198919061234a565b5060078a015460408051602081019091528754815261054991600160a01b900460ff1661199d565b158061055b57506105598a611a03565b155b806105ed57506004808b01546040808e015190516370a0823160e01b81526001600160a01b03909216926370a082319261059692910161230e565b60206040518083038186803b1580156105ae57600080fd5b505afa1580156105c2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105e691906122f6565b8b60800151115b60405180604001604052806002815260200161313360f01b815250906106265760405162461bcd60e51b8152600401610198919061234a565b508a516004808c01546040516370a0823160e01b81526001600160a01b03938416936370a082319361065c93909116910161230e565b60206040518083038186803b15801561067457600080fd5b505afa158015610688573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106ac91906122f6565b60a082018190526000906106c0908a611a0f565b9050808c608001511115604051806040016040528060028152602001610c4d60f21b815250906107035760405162461bcd60e51b8152600401610198919061234a565b50505b5050505050505050505050565b6004808a01546040516370a0823160e01b81526000926001600160a01b03909216916370a08231916107479133910161230e565b60206040518083038186803b15801561075f57600080fd5b505afa158015610773573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061079791906122f6565b90506000811160405180604001604052806002815260200161313960f01b815250906107d65760405162461bcd60e51b8152600401610198919061234a565b5087806108b157506040805160a0810182526001600160a01b038b8116825260078d0154600160a81b90046001600160401b0316602083015233828401526060820184905285166080820152905163f91ea5ff60e01b815273__$52a8a86ab43135662ff256bbc95497e8e3$__9163f91ea5ff9161086191908b908b908b908b908a906004016123f0565b60206040518083038186803b15801561087957600080fd5b505af415801561088d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108b19190611ff8565b60405180604001604052806002815260200161032360f41b815250906107065760405162461bcd60e51b8152600401610198919061234a565b60006108f586611208565b505050905080604051806040016040528060018152602001601960f91b815250906109335760405162461bcd60e51b8152600401610198919061234a565b506000610a29610a24856001600160a01b03166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561097557600080fd5b505afa158015610989573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109ad91906122f6565b876001600160a01b03166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156109e657600080fd5b505afa1580156109fa573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a1e91906122f6565b906118be565b611ab6565b90506000610aac876001600160a01b03166370a08231866040518263ffffffff1660e01b8152600401610a5c919061230e565b60206040518083038186803b158015610a7457600080fd5b505afa158015610a88573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a2491906122f6565b905060008215610acf57610aca610ac383856118be565b8490611b19565b610ad2565b60005b60028a015460078b0154604080516380031e3760e01b815290519394506fffffffffffffffffffffffffffffffff909216926000926001600160a01b03909216916380031e37916004808301926020929190829003018186803b158015610b3857600080fd5b505afa158015610b4c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b7091906122f6565b90506b0311d253316c79d3760000008310158015610b995750610b9581610fa0611a0f565b8211155b60405180604001604052806002815260200161191960f11b81525090610bd25760405162461bcd60e51b8152600401610198919061234a565b505050505050505050505050565b6b0311d253316c79d37600000081565b60008080610bfd88611208565b9350509250925082604051806040016040528060018152602001601960f91b81525090610c3d5760405162461bcd60e51b8152600401610198919061234a565b506040805180820190915260018152603360f81b60208201528215610c755760405162461bcd60e51b8152600401610198919061234a565b506001846002811115610c9857634e487b7160e01b600052602160045260246000fd5b1415610cdb57604080518082019091526002815261313760f01b602082015286610cd55760405162461bcd60e51b8152600401610198919061234a565b50610ea7565b6002846002811115610cfd57634e487b7160e01b600052602160045260246000fd5b1415610e7857604080518082019091526002815261062760f31b602082015285610d3a5760405162461bcd60e51b8152600401610198919061234a565b50604080518082019091526002815261189960f11b602082015281610d725760405162461bcd60e51b8152600401610198919061234a565b506007880154604080516020810190915288548152610d9a91600160a01b900460ff1661199d565b1580610dac5750610daa88611a03565b155b80610e3f57506004808901546040516370a0823160e01b81526001600160a01b03909116916370a0823191610de39133910161230e565b60206040518083038186803b158015610dfb57600080fd5b505afa158015610e0f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e3391906122f6565b610e3d87876118be565b115b60405180604001604052806002815260200161313360f01b81525090610cd55760405162461bcd60e51b8152600401610198919061234a565b60408051808201825260018152600760fb1b6020820152905162461bcd60e51b8152610198919060040161234a565b5050505050505050565b610fa081565b6040805180820190915260018152603160f81b602082015288610eed5760405162461bcd60e51b8152600401610198919061234a565b506040805180820190915260018152603560f81b602082015287891115610f275760405162461bcd60e51b8152600401610198919061234a565b506001600160a01b038a166000908152602087815260408083206001600160401b038d1684529091528120610f5b90611208565b505050905080604051806040016040528060018152602001601960f91b81525090610f995760405162461bcd60e51b8152600401610198919061234a565b506040805160a0810182526001600160a01b03808e1682526001600160401b038d1660208301523382840152606082018c905285166080820152905163f91ea5ff60e01b815273__$52a8a86ab43135662ff256bbc95497e8e3$__9163f91ea5ff9161101291908b908b908b908b908a906004016123f0565b60206040518083038186803b15801561102a57600080fd5b505af415801561103e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110629190611ff8565b604051806040016040528060018152602001601b60f91b81525090610bd25760405162461bcd60e51b8152600401610198919061234a565b60006110a587611bdb565b905080604051806040016040528060018152602001601960f91b815250906110e05760405162461bcd60e51b8152600401610198919061234a565b506040805180820190915260018152603160f81b6020820152866111175760405162461bcd60e51b8152600401610198919061234a565b506000831180156111475750600185600281111561114557634e487b7160e01b600052602160045260246000fd5b145b8061117c575060008211801561117c5750600285600281111561117a57634e487b7160e01b600052602160045260246000fd5b145b60405180604001604052806002815260200161313560f01b815250906111b55760405162461bcd60e51b8152600401610198919061234a565b50600019861415806111cf5750336001600160a01b038516145b60405180604001604052806002815260200161189b60f11b81525090610ea75760405162461bcd60e51b8152600401610198919061234a565b54600160381b811615159167020000000000000082161515916704000000000000008116151591670800000000000000909116151590565b6000806000806000611250611e1f565b8c516001600160a01b03166102a082015260208d01516001600160401b03166102c082015261127e8b611be7565b1561129c5760008060008060001995509550955095509550506118af565b60006101008201525b88816101000151101561180e576101008101516112c3908c90611bec565b6112cc576117f5565b896000826101000151815260200190815260200160002060009054906101000a90046001600160a01b03168161020001906001600160a01b031690816001600160a01b03168152505060008c60008361020001516001600160a01b03166001600160a01b031681526020019081526020016000206000836102c001516001600160401b03166001600160401b031681526020019081526020016000209050886001600160a01b0316631a9dffb38960008561020001516001600160a01b03166001600160a01b0316815260200190815260200160002060009054906101000a900460ff166040518263ffffffff1660e01b81526004016113cc9190612322565b60206040518083038186803b1580156113e457600080fd5b505afa1580156113f8573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061141c9190611f4e565b6001600160a01b03166102808301526102c08201516007820154600160a81b90046001600160401b039081169116146114675760405162461bcd60e51b81526004016101989061239d565b61147081611c47565b5060a0860181905260e08601929092525060c084019190915261149490600a61251b565b8260400181815250508161028001516001600160a01b031663b3596f078361020001516040518263ffffffff1660e01b81526004016114d3919061230e565b60206040518083038186803b1580156114eb57600080fd5b505afa1580156114ff573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061152391906122f6565b602083015260e0820151158015906115475750610100820151611547908d9061199d565b15611688576004808201546102a08401516040516370a0823160e01b81526001600160a01b03909216926370a082319261158292910161230e565b60206040518083038186803b15801561159a57600080fd5b505afa1580156115ae573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115d291906122f6565b60608301819052604083015160208401516115f7926115f19190611c72565b90611c7e565b6102608301819052600882015410156116165760088101546102608301525b61026082015161014083015161162b916118be565b61014083015260c08201516102608301516116569161164a9190611c72565b610180840151906118be565b61018083015260e0820151610260830151611681916116759190611c72565b6101a0840151906118be565b6101a08301525b610100820151611699908d90611c8a565b156117f35760058101546102a08301516040516370a0823160e01b81526001600160a01b03909216916370a08231916116d49160040161230e565b60206040518083038186803b1580156116ec57600080fd5b505afa158015611700573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061172491906122f6565b608083015260068101546102a08301516040516370a0823160e01b81526117bd926001600160a01b0316916370a0823191611762919060040161230e565b60206040518083038186803b15801561177a57600080fd5b505afa15801561178e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117b291906122f6565b6080840151906118be565b60808301819052604083015160208401516117ec926117e092916115f191611c72565b610160840151906118be565b6101608301525b505b61010081018051906118068261261f565b9052506112a5565b600081610140015111611822576000611837565b61014081015161018082015161183791611c7e565b61018082015261014081015161184e576000611863565b6101408101516101a082015161186391611c7e565b6101a0820181905261014082015161016083015161188092611cd5565b61012082018190526101408201516101608301516101808401516101a090940151919850965091945090925090505b97509750975097509792505050565b60006118ca828461249d565b90505b92915050565b604080518082019091526002815261035360f41b60208201526000908261190d5760405162461bcd60e51b8152600401610198919061234a565b50600061191b6002846124b5565b905061271061192c82600019612608565b61193691906124b5565b84111560405180604001604052806002815260200161068760f31b815250906119725760405162461bcd60e51b8152600401610198919061234a565b508281611981612710876125e9565b61198b919061249d565b61199591906124b5565b949350505050565b60006080821060405180604001604052806002815260200161373760f01b815250906119dc5760405162461bcd60e51b8152600401610198919061234a565b506119e88260026125e9565b6119f390600161249d565b925190921c600116151592915050565b805461ffff165b919050565b6000821580611a1c575081155b15611a29575060006118cd565b81611a3760026127106124b5565b611a4390600019612608565b611a4d91906124b5565b83111560405180604001604052806002815260200161068760f31b81525090611a895760405162461bcd60e51b8152600401610198919061234a565b50612710611a986002826124b5565b611aa284866125e9565b611aac919061249d565b6118ca91906124b5565b600080611ac7633b9aca00846125e9565b905082611ad8633b9aca00836124b5565b1460405180604001604052806002815260200161068760f31b81525090611b125760405162461bcd60e51b8152600401610198919061234a565b5092915050565b604080518082019091526002815261035360f41b602082015260009082611b535760405162461bcd60e51b8152600401610198919061234a565b506000611b616002846124b5565b90506b033b2e3c9fd0803ce8000000611b7c82600019612608565b611b8691906124b5565b84111560405180604001604052806002815260200161068760f31b81525090611bc25760405162461bcd60e51b8152600401610198919061234a565b5082816119816b033b2e3c9fd0803ce8000000876125e9565b54600160381b16151590565b511590565b60006080821060405180604001604052806002815260200161373760f01b81525090611c2b5760405162461bcd60e51b8152600401610198919061234a565b50611c378260026125e9565b925190921c600316151592915050565b5461ffff80821692601083901c821692602081901c831692603082901c60ff169260409290921c1690565b60006118ca82846125e9565b60006118ca82846124b5565b60006080821060405180604001604052806002815260200161373760f01b81525090611cc95760405162461bcd60e51b8152600401610198919061234a565b506119f38260026125e9565b600082611ce55750600019611cfc565b611cf983611cf38685611a0f565b90611d03565b90505b9392505050565b604080518082019091526002815261035360f41b602082015260009082611d3d5760405162461bcd60e51b8152600401610198919061234a565b506000611d4b6002846124b5565b9050670de0b6b3a7640000611d6282600019612608565b611d6c91906124b5565b84111560405180604001604052806002815260200161068760f31b81525090611da85760405162461bcd60e51b8152600401610198919061234a565b508281611981670de0b6b3a7640000876125e9565b604051806101600160405280600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000151581526020016000151581526020016000151581526020016000151581525090565b604051806102e0016040528060006001600160401b03168152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160001515815260200160006001600160a01b031681526020016000151581526020016000151581526020016000815260200160006001600160a01b0316815260200160006001600160a01b0316815260200160006001600160401b031681525090565b8035611a0a81612650565b8035611a0a81612668565b803560038110611a0a57600080fd5b803561ffff81168114611a0a57600080fd5b80356001600160401b0381168114611a0a57600080fd5b600060208284031215611f5f578081fd5b8151611cfc81612650565b6000806000806000806000806000806101408b8d031215611f89578586fd5b8a35611f9481612650565b9950611fa260208c01611f37565b985060408b0135975060608b0135965060808b0135955060a08b0135945060c08b0135935060e08b013592506101008b0135611fdd81612650565b809250506101208b013590509295989b9194979a5092959850565b600060208284031215612009578081fd5b8151611cfc81612668565b6000806000806000806000806000808a8c03610280811215612034578687fd5b61016080821215612043578788fd5b61204c81612466565b91506120578d611f00565b825261206560208e01611f37565b602083015261207660408e01611f00565b604083015261208760608e01611f00565b606083015260808d0135608083015260a08d013560a08301526120ac60c08e01611f00565b60c08301526120bd60e08e01611f25565b60e08301526101006120d0818f01611f0b565b908301526101208d81013590830152610140808e013590830152909a508b013598506101808b013597506101a08b013596506101c08b013595506101e08b013594506102008b013593506102208b0135925061212f6102408c01611f00565b91506102608b013590509295989b9194979a5092959850565b60008060008060008060008060006101208a8c031215612166578283fd5b8935985060208a013561217881612650565b975060408a013561218881612668565b965060608a0135955060808a0135945060a08a0135935060c08a0135925060e08a01356121b481612650565b809250506101008a013590509295985092959850929598565b600080600080600060a086880312156121e4578283fd5b8535945060208601356121f681612650565b9350604086013561220681612650565b9250606086013561221681612650565b9150608086013561222681612650565b809150509295509295909350565b600080600080600060a0868803121561224b578283fd5b8535945060208601359350604086013592506060860135915061227060808701611f16565b90509295509295909350565b6000806040838503121561228e578182fd5b50508035926020909101359150565b60008060008060008060c087890312156122b5578384fd5b86359550602087013594506122cc60408801611f16565b935060608701356122dc81612650565b9598949750929560808101359460a0909101359350915050565b600060208284031215612307578081fd5b5051919050565b6001600160a01b0391909116815260200190565b602081016002831061234457634e487b7160e01b600052602160045260246000fd5b91905290565b6000602080835283518082850152825b818110156123765785810183015185820160400152820161235a565b818111156123875783604083870101525b50601f01601f1916929092016040019392505050565b60208082526033908201527f63616c63756c617465557365724163636f756e7444617461207472616e6368656040820152720496420646f6573206e6f74206c696e6520757606c1b606082015260800190565b86516001600160a01b0390811682526020808901516001600160401b03169083015260408089015182169083015260608089015190830152608097880151169681019690965260a0860194909452915460c085015260e08401526101008301526101208201526101400190565b90815260200190565b6040518181016001600160401b038111828210171561249557634e487b7160e01b600052604160045260246000fd5b604052919050565b600082198211156124b0576124b061263a565b500190565b6000826124d057634e487b7160e01b81526012600452602481fd5b500490565b80825b60018086116124e75750612512565b8187048211156124f9576124f961263a565b8086161561250657918102915b9490941c9380026124d8565b94509492505050565b60006118ca600019848460008261253457506001611cfc565b8161254157506000611cfc565b816001811461255757600281146125615761258e565b6001915050611cfc565b60ff8411156125725761257261263a565b6001841b9150848211156125885761258861263a565b50611cfc565b5060208310610133831016604e8410600b84101617156125c1575081810a838111156125bc576125bc61263a565b611cfc565b6125ce84848460016124d5565b8086048211156125e0576125e061263a565b02949350505050565b60008160001904831182151516156126035761260361263a565b500290565b60008282101561261a5761261a61263a565b500390565b60006000198214156126335761263361263a565b5060010190565b634e487b7160e01b600052601160045260246000fd5b6001600160a01b038116811461266557600080fd5b50565b801515811461266557600080fdfea2646970667358221220b9302da7058d749ac0f87d14a3ff1d2307b8620f8adf478e4dd08344b4c2c78864736f6c63430008000033";
//# sourceMappingURL=ValidationLogicFactory.js.map