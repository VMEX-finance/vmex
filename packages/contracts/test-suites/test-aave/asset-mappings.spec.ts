import { TestEnv, makeSuite } from "./helpers/make-suite";
import { APPROVAL_AMOUNT_LENDING_POOL, RAY } from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { ProtocolErrors } from "../../helpers/types";
import { strategyWETH } from "../../markets/aave/reservesConfigs";
import { ethers } from "ethers";

const { expect } = require("chai");

makeSuite("Asset mappings", (testEnv: TestEnv) => {
  const {
    CALLER_NOT_TRANCHE_ADMIN,
    CALLER_NOT_GLOBAL_ADMIN,
    LPC_RESERVE_LIQUIDITY_NOT_0,
    RC_INVALID_LTV,
    RC_INVALID_LIQ_THRESHOLD,
    RC_INVALID_LIQ_BONUS,
    RC_INVALID_DECIMALS,
    RC_INVALID_RESERVE_FACTOR,
  } = ProtocolErrors;

  const factor = 14;

  it("Determine number of approved assets", async () => {
    const { assetMappings } = testEnv;
    const numTokens = await assetMappings.getNumApprovedTokens();
    expect(
      numTokens
    ).to.be.equal(39,"Incorrect number of approved tokens");
  });

  it("Determine addresses of approved tokens", async () => {
    const { assetMappings } = testEnv;

    const tokens = await assetMappings.getAllApprovedTokens();

    // console.log("Tokens:", tokens);
    const expected = [
      '0x8858eeB3DfffA017D4BCE9801D340D36Cf895CCf',
      '0xf4e77E5Da47AC3125140c470c71cBca77B5c638c',
      '0x52d3b94181f8654db2530b0fEe1B19173f519C52',
      '0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F',
      '0x3521eF8AaB0323004A6dD8b03CE890F4Ea3A13f5',
      '0xEcc0a6dbC0bb4D51E4F84A315a9e5B0438cAD4f0',
      '0x8B5B7a6055E54a36fF574bbE40cf2eA68d5554b3',
      '0x20Ce94F404343aD2752A2D01b43fa407db9E0D00',
      '0xc4905364b78a742ccce7B890A89514061E47068D',
      '0x1d80315fac6aBd3EfeEbE97dEc44461ba7556160',
      '0x2D8553F9ddA85A9B3259F6Bf26911364B85556F5',
      '0x1A1FEe7EeD918BD762173e4dc5EfDB8a78C924A8',
      '0x0078371BDeDE8aAc7DeBfFf451B74c5EDB385Af7',
      '0x5bcb88A0d20426e451332eE6C4324b0e663c50E0',
      '0x3619DbE27d7c1e7E91aA738697Ae7Bc5FC3eACA5',
      '0x038B86d9d8FAFdd0a02ebd1A476432877b0107C8',
      '0xD6C850aeBFDC46D7F4c207e445cC0d6B0919BDBe',
      '0xf784709d2317D872237C4bC22f867d1BAe2913AB',
      '0x7e35Eaf7e8FBd7887ad538D4A38Df5BbD073814a',
      '0x500D1d6A4c7D8Ae28240b47c8FCde034D827fD5e',
      '0x099d9fF8F818290C8b5B7Db5bFca84CEebd2714c',
      '0x85bdE212E66e2BAE510E44Ed59116c1eC712795b',
      '0xe1B3b8F6b298b52bCd15357ED29e65e66a4045fF',
      '0x8731324a6C09a1745bD15009Dc8FcceF11c05F4a',
      '0x00aD4926D7613c8e00cB6CFa61831D5668265724',
      '0x79dC3dA279A2ADc72210BD00e10951AB9dC70ABc',
      '0xF0B4ACda6D679ea22AC5C4fD1973D0d58eA10ec1',
      '0xE78d9772cED3eD5C595d9E438a87602eD86bfE9b',
      '0xA17827A991EB72793fa437e580B084ceB25Ab0f9',
      '0x8565Fb7dfB5D36b2aA00086ffc920cfF20db4F2f',
      '0x93C1e99C8dD990D77232821f9476c308FBad47f5',
      '0x57965788BD1a93639CE738a58176e1A3d6F4d04f',
      '0xBbC60A8fAf66552554e460d55Ac0563Fb9e76c01',
      '0xdDD96662ea11dA6F289A5D00da41Ec5F3b67d2b4',
      '0xecE50C63d1Ae02Ba306c2b2E1579d0327220196e',
      '0x0D8448C0fBB84c30395838C8b3fD64722ea94532',
      '0x053568617FFccEe2F75073975CC0e1549Ff9db71',
      '0xA40A2298B02a8597321580fdAD8518A6d6601b6C',
      '0x26d1E94963C8b382Ad66320826399E4B30347404'
    ]

    for(let i = 0; i<tokens.length;i++){
      expect(
        tokens[i]
      ).to.be.equal(expected[i],"Incorrect token "+i);
    }

    
  });

  it("Deletes weth from approved tokens", async () => {
    const { assetMappings, weth } = testEnv;
    await assetMappings.removeAsset(weth.address);
    await expect(assetMappings.getAssetMapping(weth.address)).to.be.revertedWith("Asset is not allowed in asset mappings");
  });

  it("Determine number of approved assets", async () => {
    const { assetMappings } = testEnv;
    const numTokens = await assetMappings.getNumApprovedTokens();
    expect(
      numTokens
    ).to.be.equal(38,"Incorrect number of approved tokens");
  });

  it("Determine addresses of approved tokens after delete", async () => {
    const { assetMappings } = testEnv;

    const tokens = await assetMappings.getAllApprovedTokens();

    console.log("Tokens:", tokens);

    const expected = [
      '0x8858eeB3DfffA017D4BCE9801D340D36Cf895CCf',
      '0xf4e77E5Da47AC3125140c470c71cBca77B5c638c',
      '0x52d3b94181f8654db2530b0fEe1B19173f519C52',
      '0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F',
      '0x3521eF8AaB0323004A6dD8b03CE890F4Ea3A13f5',
      '0xEcc0a6dbC0bb4D51E4F84A315a9e5B0438cAD4f0',
      '0x8B5B7a6055E54a36fF574bbE40cf2eA68d5554b3',
      '0x20Ce94F404343aD2752A2D01b43fa407db9E0D00',
      '0xc4905364b78a742ccce7B890A89514061E47068D',
      '0x1d80315fac6aBd3EfeEbE97dEc44461ba7556160',
      '0x2D8553F9ddA85A9B3259F6Bf26911364B85556F5',
      '0x1A1FEe7EeD918BD762173e4dc5EfDB8a78C924A8',
      '0x0078371BDeDE8aAc7DeBfFf451B74c5EDB385Af7',
      '0x5bcb88A0d20426e451332eE6C4324b0e663c50E0',
      '0x3619DbE27d7c1e7E91aA738697Ae7Bc5FC3eACA5',
      '0x038B86d9d8FAFdd0a02ebd1A476432877b0107C8',
      '0xD6C850aeBFDC46D7F4c207e445cC0d6B0919BDBe',
      '0x7e35Eaf7e8FBd7887ad538D4A38Df5BbD073814a',
      '0x500D1d6A4c7D8Ae28240b47c8FCde034D827fD5e',
      '0x099d9fF8F818290C8b5B7Db5bFca84CEebd2714c',
      '0x85bdE212E66e2BAE510E44Ed59116c1eC712795b',
      '0xe1B3b8F6b298b52bCd15357ED29e65e66a4045fF',
      '0x8731324a6C09a1745bD15009Dc8FcceF11c05F4a',
      '0x00aD4926D7613c8e00cB6CFa61831D5668265724',
      '0x79dC3dA279A2ADc72210BD00e10951AB9dC70ABc',
      '0xF0B4ACda6D679ea22AC5C4fD1973D0d58eA10ec1',
      '0xE78d9772cED3eD5C595d9E438a87602eD86bfE9b',
      '0xA17827A991EB72793fa437e580B084ceB25Ab0f9',
      '0x8565Fb7dfB5D36b2aA00086ffc920cfF20db4F2f',
      '0x93C1e99C8dD990D77232821f9476c308FBad47f5',
      '0x57965788BD1a93639CE738a58176e1A3d6F4d04f',
      '0xBbC60A8fAf66552554e460d55Ac0563Fb9e76c01',
      '0xdDD96662ea11dA6F289A5D00da41Ec5F3b67d2b4',
      '0xecE50C63d1Ae02Ba306c2b2E1579d0327220196e',
      '0x0D8448C0fBB84c30395838C8b3fD64722ea94532',
      '0x053568617FFccEe2F75073975CC0e1549Ff9db71',
      '0xA40A2298B02a8597321580fdAD8518A6d6601b6C',
      '0x26d1E94963C8b382Ad66320826399E4B30347404'
    ]

    for(let i = 0;i<tokens.length;i++){
      expect(
        tokens[i]
      ).to.be.equal(expected[i],"Incorrect token "+i);
    }

    
  });
});
