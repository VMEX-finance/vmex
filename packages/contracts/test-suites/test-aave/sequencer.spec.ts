import {
    APPROVAL_AMOUNT_LENDING_POOL,
    MAX_UINT_AMOUNT,
    ZERO_ADDRESS,
  } from "../../helpers/constants";
  import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
  import { expect } from "chai";
  import { ethers } from "ethers";
  import { RateMode, ProtocolErrors } from "../../helpers/types";
  import { makeSuite, TestEnv } from "./helpers/make-suite";
  import { CommonsConfig } from "../../markets/aave/commons";
import { deploySequencerUptimeFeed } from "../../helpers/contracts-deployments";
import { network } from "hardhat";
  
  makeSuite("Admin whitelisting and blacklisting tests", (testEnv: TestEnv) => {
    const {
        VO_SEQUENCER_DOWN,
        VO_SEQUENCER_GRACE_PERIOD_NOT_OVER,
      VL_TRANSFER_NOT_ALLOWED,
    } = ProtocolErrors;
  
    it("Deploy mock sequencer and test", async () => {
        const {vmexOracle, deployer, dai} = testEnv;
        //deploy mock sequencer uptime feed
        const seqAdd =await deploySequencerUptimeFeed();

        await vmexOracle.connect(deployer.signer).setSequencerUptimeFeed(
            31337,
            seqAdd.address
        )

        console.log("Set vmex oracle sequencer address");

        await seqAdd.connect(deployer.signer).setDown(0);
        await seqAdd.connect(deployer.signer).setStartedAt(0);


        const ans = await vmexOracle.getAssetPrice(dai.address);

        await seqAdd.connect(deployer.signer).setDown(1);

        console.log("Set down to: ", await seqAdd.connect(deployer.signer).isDown())

        await expect(vmexOracle.getAssetPrice(dai.address)).to.be.revertedWith(VO_SEQUENCER_DOWN);

        await seqAdd.connect(deployer.signer).setDown(0);
        console.log("started at: ", await seqAdd.connect(deployer.signer)._startedAt())
        await expect(vmexOracle.getAssetPrice(dai.address)).to.be.revertedWith(VO_SEQUENCER_GRACE_PERIOD_NOT_OVER);
        await network.provider.send("evm_increaseTime", [3601])
        await vmexOracle.getAssetPrice(dai.address);

    });
  });