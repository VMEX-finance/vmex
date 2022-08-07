reservesConfigs.ts is the file you use to edit the risk levels of assets during init

How to connect metamask:

Follow metamask setup here: https://www.web3.university/article/how-to-build-a-react-dapp-with-hardhat-and-metamask

run `npm run vmex:node:fork:main` in one terminal (starts up localhost network) as a fork

metamask should now be able to connect to http://127.0.0.1:8545

run `npm run vmex:deploy` in another terminal to deploy the contracts and the fork of mainnet on the localhost network

you can use metamask to execute contract calls on the frontend

run `npm run console:localhost:fork` to start console that can interact with the above forked mainnet on the localhost network
run `npx hardhat run --network localhost localhost_tests/test-script.ts` to run a set of tests to interact with the chain

localhost addresses
