#VMEX LP Oracles

### This repo contains the oracles used for getting an LP price on-chain for the VMEX protocol


#### To Use
Only one instance of the oracle needs to be deployed. They are less of an oracle, and more of a math helper library, simply performing the calculations necessary to obtain a price from given inputs. You will need a price oracle for the underlying tokens in the LP token that you wish to price. Pass in the appropriate parameters to the oracle function and receive a price for the underlying LP token.  


#### Available LP Token Prices
    - CurveV1 Tokens (stable pool) 
    - CurveV2 Tokens (non-stable pools)
    - UniswapV2-style (Sushi) 
    - UniswapV3 NFTs
    - Yearn Vaults 
    - Convex Tokens for CurveV1 and V2 pools (currently unused by VMEX but supported)
