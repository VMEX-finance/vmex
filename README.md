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
