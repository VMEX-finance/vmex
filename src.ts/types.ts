export type Tranche = {
    index: number | string;
    name: string;
    admin?: string;
    adminFee?: number | string;
    protocolFee: number | string;
    closeFactor: number | string;
}  

export type Market = {
    assetAddress: Asset["address"];
    trancheIndex: Tranche["index"];
    loanToValue: number | string;
    curveProfileTier: CurveProfile["tier"];
    reserveFactor?: number | string;
}

export type ERC20 = {
    tokenAddress: string;
    tokenName: string;
    totalSupply: number | string;
}

export type Asset = {
    address: string;
    curveProfileIndex: CurveProfile["index"];
    loanToValue: number | string;
    liquidationPenalty: number | string;
    liquidationThreshold: number | string;
    alias2: Array<string> | object;
}

export type CurveProfile = {
    index: number | string;
    tier: number | string;
    curveIndex: Curves["index"];
}

export type Curves = {
    index: number | string;
    base: number | string;
    optimalUtil: number | string;
    slope1: number | string;
    slope2: number | string;
}

export type MarketData = {
    assetAddress: Asset["address"];
    circulatingSupply: number | string;
    oneDayVolume: number | string;
}

export type AssetWhitelist = {
    index: number | string;
    assetAddress: Asset["address"];
}

export type RiskData = {
    assetAddress: Asset["address"];
    rating: string;
}
