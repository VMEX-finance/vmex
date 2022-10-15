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

# Accounts

Account #0: 0xc783df8a850f42e7F7e57013759C285caa701eB6 (1000000 ETH)

Account #1: 0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4 (1000000 ETH)

Account #2: 0xE5904695748fe4A84b40b3fc79De2277660BD1D3 (1000000 ETH)

Account #3: 0x92561F28Ec438Ee9831D00D1D59fbDC981b762b2 (1000000 ETH)

Account #4: 0x2fFd013AaA7B5a7DA93336C2251075202b33FB2B (1000000 ETH)

Account #5: 0x9FC9C2DfBA3b6cF204C37a5F690619772b926e39 (1000000 ETH)

Account #6: 0xaD9fbD38281F615e7DF3DeF2Aad18935a9e0fFeE (1000000 ETH)

Account #7: 0x8BffC896D42F07776561A5814D6E4240950d6D3a (1000000 ETH)

Users in scenario-engine:

$$
USERS:  [
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4'
  },
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0xE5904695748fe4A84b40b3fc79De2277660BD1D3',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0xE5904695748fe4A84b40b3fc79De2277660BD1D3'
  },
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0x92561F28Ec438Ee9831D00D1D59fbDC981b762b2',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0x92561F28Ec438Ee9831D00D1D59fbDC981b762b2'
  },
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0x2fFd013AaA7B5a7DA93336C2251075202b33FB2B',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0x2fFd013AaA7B5a7DA93336C2251075202b33FB2B'
  },
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0x9FC9C2DfBA3b6cF204C37a5F690619772b926e39',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0x9FC9C2DfBA3b6cF204C37a5F690619772b926e39'
  },
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0xaD9fbD38281F615e7DF3DeF2Aad18935a9e0fFeE',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0xaD9fbD38281F615e7DF3DeF2Aad18935a9e0fFeE'
  },
  {
    signer: SignerWithAddress {
      _isSigner: true,
      address: '0x8BffC896D42F07776561A5814D6E4240950d6D3a',
      _signer: [JsonRpcSigner],
      provider: [EthersProviderWrapper]
    },
    address: '0x8BffC896D42F07776561A5814D6E4240950d6D3a'
  }
]
$$




$$$$$$$$$$$$ addressList:  [
  '0xc783df8a850f42e7F7e57013759C285caa701eB6',
  '0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4',
  '0xE5904695748fe4A84b40b3fc79De2277660BD1D3',
  '0x92561F28Ec438Ee9831D00D1D59fbDC981b762b2',
  '0x2fFd013AaA7B5a7DA93336C2251075202b33FB2B',
  '0x9FC9C2DfBA3b6cF204C37a5F690619772b926e39',
  '0xaD9fbD38281F615e7DF3DeF2Aad18935a9e0fFeE',
  '0x8BffC896D42F07776561A5814D6E4240950d6D3a'
]
$$$$$$$$$$ admin of tranche 1:  0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4
$$
