### Setup

Run `yarn install` to install node_modules or update them
Copy .env template into .env file with the required fields

### How to deploy on mainnet:

run `yarn vmex:node:fork:main` in one terminal (starts up localhost network) as a fork

metamask should now be able to connect to http://127.0.0.1:8545

run `yarn vmex:deploy:fork:main` in another terminal to deploy the contracts and the fork of mainnet on the localhost network

Or, run `yarn start:dev` to run a node and deploy in the same terminal

you can use metamask to execute contract calls on the frontend

run `yarn console:localhost:fork` to start console that can interact with the above forked mainnet on the localhost network

**Remeber to run** `yarn localhost:deployIncentivesController` to deploy the incentives controller which is required for tests

Run `yarn vmex:mainnetfork:unit-tests` to test all localhost tests

### How to deploy on Sepolia:

Setup

- Make sure your .env file has the SEPOLIA_ALCHEMY_KEY and MNEMONIC set
- Fill up your wallet 0 with ~0.5 ETH, wallet 3 with ~0.05 ETH, and wallet 7 with ~0.05 ETH

run `yarn vmex:sepolia:deploy`

OPTIONAL: If the mock tokens are already deployed, use `getAllMockedTokens` instead of `deployAllMockTokens` inside the `buildTestEnv` function in the `contract-deployments.ts` file

### How to deploy on OP fork:

run `yarn vmex:node:fork:optimism` in one terminal (starts up localhost network) as a fork

metamask should now be able to connect to http://127.0.0.1:8545

run `yarn vmex:deploy:fork:optimism` in another terminal to deploy the contracts and the fork of OP on the localhost network

Run `yarn vmex:OPfork:unit-tests` to test all localhost tests

### How to test in hardhat network mock environment:

Run `yarn test`
These are a separate set of tests than the above unit-tests

Or, to avoid having to redeploy on a hardhat network every test (if debugging tests), first run a local node and then deploy (in another terminal):

1. `yarn vmex:node`
2. `yarn vmex:dev:deploy`
   _Note that this doesn't require calling separate script to deploy incentives controller since in step 2 it is already deployed_

Then you can keep running `yarn vmex:dev:test` without having to redeploy the test contracts

### Check and update uniswapv3 pool addresses with most volume

Run `yarn get-uniswap-data`
Copy the output in the terminal to markets/aave/commons.ts

# Contract verification

Common errors and fixes:

```
ENOENT: no such file or directory ...
```

Fix:

```
npx hardhat clean
yarn compile
# rerun scripts
```

# Foundry testing

1. Install foundry: https://book.getfoundry.sh/getting-started/installation
2. Run `yarn` (make sure @nomicfoundation/hardhat-foundry is installed)
3. Initialize with `npx hardhat init-foundry`
4. Now can build and run tests: `forge test --fork-url https://mainnet.base.org --fork-block-number 4924830 --match-contract CLSyncOracle -vvvv`

# Hardhat Accounts

Account #0: 0xc783df8a850f42e7F7e57013759C285caa701eB6 (1000000 ETH)

Account #1: 0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4 (1000000 ETH)

Account #2: 0xE5904695748fe4A84b40b3fc79De2277660BD1D3 (1000000 ETH)

Account #3: 0x92561F28Ec438Ee9831D00D1D59fbDC981b762b2 (1000000 ETH)

Account #4: 0x2fFd013AaA7B5a7DA93336C2251075202b33FB2B (1000000 ETH)

Account #5: 0x9FC9C2DfBA3b6cF204C37a5F690619772b926e39 (1000000 ETH)

Account #6: 0xaD9fbD38281F615e7DF3DeF2Aad18935a9e0fFeE (1000000 ETH)

Account #7: 0x8BffC896D42F07776561A5814D6E4240950d6D3a (1000000 ETH)
