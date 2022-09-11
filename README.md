### Setup

Run `yarn install` to install node_modules or update them

### How to deploy:

run `npm run vmex:node:fork:main` in one terminal (starts up localhost network) as a fork

metamask should now be able to connect to http://127.0.0.1:8545

run `npm run vmex:deploy` in another terminal to deploy the contracts and the fork of mainnet on the localhost network

you can use metamask to execute contract calls on the frontend

run `npm run console:localhost:fork` to start console that can interact with the above forked mainnet on the localhost network

copy test files in `localhost_tests` directly to the console to run the tests.

### VMEX supported assets

BUSD (L&B only)
DAI (L&B + Collateral)
LINK (L&B + Collateral)
MANA (L&B + Collateral)
MKR (L&B + Collateral)
REN (L&B + Collateral)
SNX (L&B + Collateral)
SUSD (L&B only)
UNI (L&B + Collateral)
USDC (L&B + Collateral)
USDT (L&B + Collateral)
WBTC (L&B + Collateral)
YFI (L&B + Collateral)
ZRX (L&B + Collateral)
xSUSHI (L&B + Collateral)

Our special assets
FRAX (L&B only)
Steth (L&B + Collateral)

BAL (L&B + Collateral)
CRV (Collateral)
CVX (Collateral)
BADGER (L&B + Collateral)
LDO (L&B + Collateral)
ALCX (L&B + Collateral)
1inch (L&B + Collateral)

Tricrypto2 Curve LP (Collateral only)
ThreePool Curve LP (Collateral only)
StethEth Curve LP (Collateral only)
FraxUSDC Curve LP (Collateral only)
Frax3Crv Curve LP (Collateral only)
