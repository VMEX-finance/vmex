// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

library Constants {
    function token() internal pure returns (address[20] memory) {
        address[20] memory tokens = [
            0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9,
            0x0D8775F648430679A709E98d2b0Cb6250d2887EF,
            0x4Fabb145d64652a948d72533023f6E7A623C7C53,
            0x6B175474E89094C44Da98b954EedeAC495271d0F,
            0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c,
            0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202,
            0x514910771AF9Ca656af840dff83E8264EcF986CA,
            0x0F5D2fB29fb7d3CFeE444a200298f468908cC942,
            0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2,
            0x408e41876cCCDC0F92210600ef50372656052a38,
            0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F,
            0x57Ab1ec28D129707052df4dF418D58a2D46d5f51,
            0x0000000000085d4780B73119b644AE5ecd22b376,
            0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984,
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
            0xdAC17F958D2ee523a2206206994597C13D831ec7,
            0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599,
            0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e,
            0xE41d2489571d322189246DaFA5ebDe1F4699F498,
            0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272
        ];
        return tokens;
    }

    function tokenNames() internal pure returns (string[20] memory) {
        string[20] memory data = [
            "AAVE",
            "BAT",
            "BUSD",
            "DAI",
            "ENJ",
            "KNC",
            "LINK",
            "MANA",
            "MKR",
            "REN",
            "SNX",
            "SUSD",
            "TUSD",
            "UNI",
            "USDC",
            "USDT",
            "WBTC",
            "YFI",
            "ZRX",
            "xSUSHI"
        ];
        return data;
    }

    function ETHPriceOracles() internal pure returns (address[20] memory) {
        address[20] memory data = [
            0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012,
            0x0d16d4528239e9ee52fa531af613AcdB23D88c94,
            0x614715d2Af89E6EC99A233818275142cE88d1Cfd,
            0x773616E4d11A78F511299002da57A0a94577F1f4,
            0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B,
            0x656c0544eF4C98A6a98491833A89204Abb045d6b,
            0xDC530D9457755926550b59e8ECcdaE7624181557,
            0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9,
            0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2,
            0x3147D7203354Dc06D9fd350c7a2437bcA92387a4,
            0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c,
            0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757,
            0x3886BA987236181D98F2401c507Fb8BeA7871dF2,
            0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e,
            0x986b5E1e1755e3C2440e960477f25201B0a8bbD4,
            0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46,
            0xdeb288F737066589598e9214E782fa5A8eD689e8,
            0x7c5d4F8345e66f68099581Db340cd65B078C41f4,
            0x2Da4983a622a8498bb1a21FaE9D8F6C664939962,
            0x9b26214bEC078E68a394AaEbfbffF406Ce14893F
        ];
        return data;
    }

    function USDPriceOracles() internal pure returns (address[20] memory) {
        address[20] memory data = [
            0x547a514d5e3769680Ce22B2361c10Ea13619e8a9,
            0x9441D7556e7820B5ca42082cfa99487D56AcA958,
            0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A,
            0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9,
            0x23905C55dC11D609D5d11Dc604905779545De9a7,
            0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc,
            0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c,
            0x56a4857acbcfe3a66965c251628B1c9f1c408C19,
            0xec1D1B3b0443256cc3860e24a46F108e699484Aa,
            0x0f59666EDE214281e956cb3b2D0d69415AfF4A01,
            0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699,
            0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94,
            0xec746eCF986E2927Abd291a2A1716c940100f8Ba,
            0x553303d460EE0afB37EdFf9bE42922D8FF63220e,
            0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6,
            0x3E7d1eAB13ad0104d2750B8863b489D65364e32D,
            0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c,
            0xA027702dbb89fbd58938e4324ac03B58d812b0E1,
            0x2885d15b8Af22648b98B122b22FDF4D2a56c6023,
            0xCC1f5d9e6956447630d703C8e93b2345c2DE3D13
        ];
        return data;
    }
}
