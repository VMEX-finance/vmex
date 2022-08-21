reservesConfigs.ts is the file you use to edit the risk levels of assets during init

How to connect metamask:

Follow metamask setup here: https://www.web3.university/article/how-to-build-a-react-dapp-with-hardhat-and-metamask

run `npm run vmex:node:fork:main` in one terminal (starts up localhost network) as a fork

metamask should now be able to connect to http://127.0.0.1:8545

run `npm run vmex:deploy` in another terminal to deploy the contracts and the fork of mainnet on the localhost network

you can use metamask to execute contract calls on the frontend

run `npm run console:localhost:fork` to start console that can interact with the above forked mainnet on the localhost network
run `npx hardhat run --network localhost localhost_tests/test-script.ts` to run a set of tests to interact with the chain

How to get all Curve token pool addresses, which is needed to input to Curve oracle
provider = Contract('0x0000000022D53366457F9d5E68Ec105046FC4383') //this address provider contract will always be at this address for mainnet
provider.get_registry() //registry contains the addresses for the pools

loop i from 0 to registry.pool_count():
registry.pool_list(i) //this contains the pool address we need to input to the curve oracle
// This is different than the Curve LP token though, which is what the users will actually deposit
x = registry.get_lp_token(registry.pool_list(i)) //this converts the pool address to the lp token for that pool. This is the address we probably want to store in the reserves
registry.get_pool_from_lp_token(x) //this converts lp token address to pool address (1 to 1 mapping between pool address and lp token address I think).

localhost addresses (I think this changes every deployment but double check)
LendingPoolAddressesProvider: 0xD6C850aeBFDC46D7F4c207e445cC0d6B0919BDBe
LendingPoolAddressesProviderRegistry: 0x8858eeB3DfffA017D4BCE9801D340D36Cf895CCf
ReserveLogic: 0x1d80315fac6aBd3EfeEbE97dEc44461ba7556160
GenericLogic: 0x2D8553F9ddA85A9B3259F6Bf26911364B85556F5
ValidationLogic: 0x52d3b94181f8654db2530b0fEe1B19173f519C52
LendingPoolImpl: 0x7e35Eaf7e8FBd7887ad538D4A38Df5BbD073814a
LendingPool: 0xda24DebbEcECe2270a5Ff889AEfC71Dcf4B8A3D5
LendingPoolConfiguratorImpl: 0x53369fd4680FfE3DfF39Fc6DDa9CfbfD43daeA2E
LendingPoolConfigurator: 0xE8606b4421B6dBC318BD51c24B7e3f98dA3A4621
StableAndVariableTokensHelper: 0x58F132FBB86E21545A4Bace3C19f1C05d86d7A22
ATokensAndRatesHelper: 0xa4bcDF64Cdd5451b6ac3743B414124A6299B65FF
AaveOracle: 0x6082731fdAba4761277Fb31299ebC782AD3bCf24
LendingRateOracle: 0x12080583C4F0211eC382d33a273E6D0f9fAb0F75
AaveProtocolDataProvider: 0x85bdE212E66e2BAE510E44Ed59116c1eC712795b
AToken: 0x22474D350EC2dA53D717E30b96e9a2B7628Ede5b
DelegationAwareAToken: 0x5A0773Ff307Bf7C71a832dBB5312237fD3437f9F
StableDebtToken: 0x18b9306737eaf6E8FC8e737F488a1AE077b18053
VariableDebtToken: 0xFAe0fd738dAbc8a0426F47437322b6d026A9FD95
DefaultReserveInterestRateStrategy: 0xdDD96662ea11dA6F289A5D00da41Ec5F3b67d2b4
rateStrategyAAVE: 0x00aD4926D7613c8e00cB6CFa61831D5668265724
rateStrategyVolatileOne: 0x79dC3dA279A2ADc72210BD00e10951AB9dC70ABc
rateStrategyStableOne: 0xF0B4ACda6D679ea22AC5C4fD1973D0d58eA10ec1
rateStrategyStableTwo: 0xE78d9772cED3eD5C595d9E438a87602eD86bfE9b
rateStrategyVolatileTwo: 0xA17827A991EB72793fa437e580B084ceB25Ab0f9
rateStrategyVolatileThree: 0x8565Fb7dfB5D36b2aA00086ffc920cfF20db4F2f
rateStrategyStableThree: 0x93C1e99C8dD990D77232821f9476c308FBad47f5
rateStrategyWETH: 0x57965788BD1a93639CE738a58176e1A3d6F4d04f
rateStrategyVolatileFour: 0xBbC60A8fAf66552554e460d55Ac0563Fb9e76c01
WalletBalanceProvider: 0xfec95864b4f5d68158C1c67981Bd5Ca0bC651571
WETHGateway: 0xe1B3b8F6b298b52bCd15357ED29e65e66a4045fF
DepositWithdrawLogic: 0xd15468525c35BDBC1eD8F2e09A00F8a173437f2f
UiPoolDataProvider: 0x6B22eee9Ae8aaE0893f465dDDD63Fbd394d9b4e4
vMath: 0x1750499D05Ed1674d822430FB960d5F6731fDf64
curveOracleImpl: 0xE4C10Db67595aF2Cb4166c8C274e0140f7E43059
rateStrategyCurve: 0xdDD96662ea11dA6F289A5D00da41Ec5F3b67d2b4
