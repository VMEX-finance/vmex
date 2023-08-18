"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveConfig = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const common_1 = require("../../common");
const reservesConfigs_1 = require("./reservesConfigs");
// ----------------
// POOL--SPECIFIC PARAMS
// ----------------
exports.AaveConfig = {
    ...common_1.CommonsConfig,
    MarketId: 'VMEX genesis market',
    ProviderId: 1,
    ReservesConfig: {
        AAVE: reservesConfigs_1.strategyAAVE,
        BAT: reservesConfigs_1.strategyBAT,
        BUSD: reservesConfigs_1.strategyBUSD,
        DAI: reservesConfigs_1.strategyDAI,
        ENJ: reservesConfigs_1.strategyENJ,
        KNC: reservesConfigs_1.strategyKNC,
        LINK: reservesConfigs_1.strategyLINK,
        MANA: reservesConfigs_1.strategyMANA,
        MKR: reservesConfigs_1.strategyMKR,
        REN: reservesConfigs_1.strategyREN,
        SNX: reservesConfigs_1.strategySNX,
        SUSD: reservesConfigs_1.strategySUSD,
        TUSD: reservesConfigs_1.strategyTUSD,
        UNI: reservesConfigs_1.strategyUNI,
        USDC: reservesConfigs_1.strategyUSDC,
        USDT: reservesConfigs_1.strategyUSDT,
        WBTC: reservesConfigs_1.strategyWBTC,
        WETH: reservesConfigs_1.strategyWETH,
        YFI: reservesConfigs_1.strategyYFI,
        ZRX: reservesConfigs_1.strategyZRX,
        Tricrypto2: reservesConfigs_1.strategyCurveV2LPToken,
        ThreePool: reservesConfigs_1.strategyCurveV1LPToken,
        StethEth: reservesConfigs_1.strategyCurveV1LPToken,
        Steth: reservesConfigs_1.strategySTETH,
        FraxUSDC: reservesConfigs_1.strategyCurveV1LPToken,
        Frax3Crv: reservesConfigs_1.strategyCurveV1LPToken,
        FRAX: reservesConfigs_1.strategyFrax,
        BAL: reservesConfigs_1.strategyBAL,
        CRV: reservesConfigs_1.strategyCRV,
        CVX: reservesConfigs_1.strategyCVX,
        BADGER: reservesConfigs_1.strategyBADGER,
        LDO: reservesConfigs_1.strategyLDO,
        ALCX: reservesConfigs_1.strategyALCX,
        Oneinch: reservesConfigs_1.strategyOneinch,
        yvTricrypto2: reservesConfigs_1.strategyYearnToken,
        yvThreePool: reservesConfigs_1.strategyYearnToken,
        yvStethEth: reservesConfigs_1.strategyYearnToken,
        yvFraxUSDC: reservesConfigs_1.strategyYearnToken,
        yvFrax3Crv: reservesConfigs_1.strategyYearnToken,
    },
    ReserveAssets: {
        [types_1.eEthereumNetwork.buidlerevm]: {},
        [types_1.eEthereumNetwork.hardhat]: {},
        [types_1.eEthereumNetwork.coverage]: {},
        [types_1.eEthereumNetwork.sepolia]: {},
        [types_1.eEthereumNetwork.goerli]: {
            AAVE: '0x5010abCF8A1fbE56c096DCE9Bb2D29d63e141361',
            BAT: '0x6206Ae429677EE65bF5Ea172730ccEB61BD91CE7',
            BUSD: '0xbF4C6eAbB6E9830e1C5A0A621451D666f5001AbF',
            DAI: '0xf2edF1c091f683E3fb452497d9a98A49cBA84666',
            KNC: '0x04de2Be167b41A0cFBAAc34Fe8937340273bfc57',
            LINK: '0xE4e0EB46c269B11067031b6F4B7b658E5dAE1B7b',
            MKR: '0x08a4a931bbBA6907a2BF4aA727527960886a6928',
            SNX: '0x94D031b0f2fdb2D10C40434485a6Ac7dC879AAd6',
            SUSD: '0xfbA16f2A86d409ecc05A242C8F7c99f30a144558',
            TUSD: '0xA4ba6E708312364C7D2839A56d1c1f2346f8db60',
            UNI: '0x4aecEB6486D25D5015bF8F8323914A36204ed4b7',
            USDC: '0x3a034fe373b6304f98b7a24a3f21c958946d4075',
            USDT: '0xC51FceEc013cD34aE2e95E6D64E9858F2aC28fFf',
            WBTC: '0xaC4EeaC5cC09B1A604E1b104D71cE6A38E4Fd0a9',
            WETH: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
            ZRX: '0x871DD7C2B4b25E1Aa18728e9D5f2Af4C4e431f5c',
            Tricrypto2: '',
            ThreePool: '',
            StethEth: '',
            Steth: '0xc9063c0da0E74F3c2628ece4D80E8D4702e6bFC1',
            FraxUSDC: '',
            Frax3Crv: '',
            FRAX: '0xCDfa0273cB2D4e07F3d8B2e3C9d97154cCDC62e8',
            BAL: '0xD38cBDADeDCFA2c4d6C89E79A7D8b305F93D2Ab0',
            CRV: '0x010f1296B1f2E23C7C0C903E8dBB0ce42bc7136b',
            CVX: '0x84F96e4e2c67C3737dA005572bEf639465a81777',
            BADGER: '0x44DdD5348871B027f148403b5130C2c91ED8c9a0',
            LDO: '0x82C9e904E3271747eb2b77E4F7e7A4055f75098c',
            ALCX: '0xB20C808861524a4A769e5fa93173A93B1b4aCfFD',
            Oneinch: '',
        },
        [types_1.eEthereumNetwork.kovan]: {
            AAVE: '0xB597cd8D3217ea6477232F9217fa70837ff667Af',
            BAT: '0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738',
            BUSD: '0x4c6E1EFC12FDfD568186b7BAEc0A43fFfb4bCcCf',
            DAI: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
            ENJ: '0xC64f90Cd7B564D3ab580eb20a102A8238E218be2',
            KNC: '0x3F80c39c0b96A0945f9F0E9f55d8A8891c5671A8',
            LINK: '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789',
            MANA: '0x738Dc6380157429e957d223e6333Dc385c85Fec7',
            MKR: '0x61e4CAE3DA7FD189e52a4879C7B8067D7C2Cc0FA',
            REN: '0x5eebf65A6746eed38042353Ba84c8e37eD58Ac6f',
            SNX: '0x7FDb81B0b8a010dd4FFc57C3fecbf145BA8Bd947',
            SUSD: '0x99b267b9D96616f906D53c26dECf3C5672401282',
            TUSD: '0x016750AC630F711882812f24Dba6c95b9D35856d',
            UNI: '0x075A36BA8846C6B6F53644fDd3bf17E5151789DC',
            USDC: '0xe22da380ee6B445bb8273C81944ADEB6E8450422',
            USDT: '0x13512979ADE267AB5100878E2e0f485B568328a4',
            WBTC: '0xD1B98B6607330172f1D991521145A22BCe793277',
            WETH: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            YFI: '0xb7c325266ec274fEb1354021D27FA3E3379D840d',
            ZRX: '0xD0d76886cF8D952ca26177EB7CfDf83bad08C00C',
            //add Tricrypto2
        },
        [types_1.eEthereumNetwork.ropsten]: {
            AAVE: '',
            BAT: '0x85B24b3517E3aC7bf72a14516160541A60cFF19d',
            BUSD: '0xFA6adcFf6A90c11f31Bc9bb59eC0a6efB38381C6',
            DAI: '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108',
            ENJ: constants_1.ZERO_ADDRESS,
            KNC: '0xCe4aA1dE3091033Ba74FA2Ad951f6adc5E5cF361',
            LINK: '0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486',
            MANA: '0x78b1F763857C8645E46eAdD9540882905ff32Db7',
            MKR: '0x2eA9df3bABe04451c9C3B06a2c844587c59d9C37',
            REN: constants_1.ZERO_ADDRESS,
            SNX: '0xF80Aa7e2Fda4DA065C55B8061767F729dA1476c7',
            SUSD: '0xc374eB17f665914c714Ac4cdC8AF3a3474228cc5',
            TUSD: '0xa2EA00Df6d8594DBc76b79beFe22db9043b8896F',
            UNI: constants_1.ZERO_ADDRESS,
            USDC: '0x851dEf71f0e6A903375C1e536Bd9ff1684BAD802',
            USDT: '0xB404c51BBC10dcBE948077F18a4B8E553D160084',
            WBTC: '0xa0E54Ab6AA5f0bf1D62EC3526436F3c05b3348A0',
            WETH: '0xc778417e063141139fce010982780140aa0cd5ab',
            YFI: constants_1.ZERO_ADDRESS,
            ZRX: '0x02d7055704EfF050323A2E5ee4ba05DB2A588959',
            //add Tricrypto2
        },
        [types_1.eEthereumNetwork.main]: {
            AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
            BAT: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
            BUSD: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            ENJ: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
            KNC: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
            LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            MANA: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
            MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
            REN: '0x408e41876cCCDC0F92210600ef50372656052a38',
            SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
            SUSD: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
            TUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
            UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
            ZRX: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
            Tricrypto2: '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff',
            ThreePool: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
            StethEth: '0x06325440D014e39736583c165C2963BA99fAf14E',
            Steth: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
            FraxUSDC: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
            Frax3Crv: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
            FRAX: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
            BAL: '0xba100000625a3754423978a60c9317c58a424e3D',
            CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
            CVX: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
            BADGER: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
            LDO: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
            ALCX: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',
            Oneinch: '0x111111111117dC0aa78b770fA6A738034120C302',
            yvTricrypto2: '0x8078198Fc424986ae89Ce4a910Fc109587b6aBF3',
            yvThreePool: '0x84E13785B5a27879921D6F685f041421C7F482dA',
            yvStethEth: '0x5B8C556B8b2a78696F0B9B830B3d67623122E270',
            yvFraxUSDC: '0x1A5ebfF0E881Aec34837845e4D0EB430a1B4b737',
            yvFrax3Crv: '0xb37094c1B5614Bd6EcE40AFb295C26F4377069d3',
        },
        [types_1.eEthereumNetwork.tenderly]: {
            AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
            BAT: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
            BUSD: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            ENJ: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
            KNC: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
            LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            MANA: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
            MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
            REN: '0x408e41876cCCDC0F92210600ef50372656052a38',
            SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
            SUSD: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
            TUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
            UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
            ZRX: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
            Tricrypto2: '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff',
            ThreePool: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
            StethEth: '0x06325440D014e39736583c165C2963BA99fAf14E',
            Steth: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
            FraxUSDC: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
            Frax3Crv: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
            FRAX: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
            BAL: '0xba100000625a3754423978a60c9317c58a424e3D',
            CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
            CVX: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
            BADGER: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
            LDO: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
            ALCX: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',
            Oneinch: '0x111111111117dC0aa78b770fA6A738034120C302',
            yvTricrypto2: '0x8078198Fc424986ae89Ce4a910Fc109587b6aBF3',
            yvThreePool: '0x84E13785B5a27879921D6F685f041421C7F482dA',
            yvStethEth: '0x5B8C556B8b2a78696F0B9B830B3d67623122E270',
            yvFraxUSDC: '0x1A5ebfF0E881Aec34837845e4D0EB430a1B4b737',
            yvFrax3Crv: '0xb37094c1B5614Bd6EcE40AFb295C26F4377069d3',
        },
    },
};
exports.default = exports.AaveConfig;
//# sourceMappingURL=index.js.map