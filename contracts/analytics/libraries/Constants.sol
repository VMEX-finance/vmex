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
            0xF256CC7847E919FAc9B808cC216cAc87CCF2f47a
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
}
