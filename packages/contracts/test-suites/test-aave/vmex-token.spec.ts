import { expect } from "chai";
import { makeSuite, TestEnv } from "./helpers/make-suite";
import { ethers } from "ethers";
import { DRE, waitForTx } from "../../helpers/misc-utils";
import { BUIDLEREVM_CHAINID } from "../../helpers/buidler-constants";
import {
  buildPermitParams,
  getSignatureFromTypedData,
} from "../../helpers/contracts-helpers";
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from "../../helpers/constants";
import { deployDoubleTransferHelper } from "../../helpers/contracts-deployments";

makeSuite("Vmex token tests", (testEnv: TestEnv) => {
  it("Checks initial configuration", async () => {
    const { vmexToken } = testEnv;

    expect(await vmexToken.name()).to.be.equal(
      "Vmex Token",
      "Invalid token name"
    );

    expect(await vmexToken.symbol()).to.be.equal(
      "VMEX",
      "Invalid token symbol"
    );

    expect((await vmexToken.decimals()).toString()).to.be.equal(
      "18",
      "Invalid token decimals"
    );
  });

  it("Checks the allocation of the initial AAVE supply", async () => {
    const { vmexToken, deployer } = testEnv;

    const deployerBalance = await vmexToken.balanceOf(deployer.address);

    expect(deployerBalance.toString()).to.be.equal(
      ethers.utils.parseEther("100000000"), // 100 mil vmex tokens
      "Invalid deployer balance"
    );
  });

  it("Checks there is no voting power when delegate is not called", async () => {
    const { vmexToken, deployer } = testEnv;

    const userCountOfSnapshots = await vmexToken.numCheckpoints(
      deployer.address
    );
    expect(userCountOfSnapshots.toString()).to.be.equal(
      "0",
      "INVALID_SNAPSHOT_COUNT"
    );
  });

  it("Checks the snapshots emitted after the initial allocation", async () => {
    const { vmexToken, deployer } = testEnv;

    await waitForTx(
      await vmexToken.connect(deployer.signer).delegate(deployer.address)
    );

    const userCountOfSnapshots = await vmexToken.numCheckpoints(
      deployer.address
    );
    expect(userCountOfSnapshots.toString()).to.be.equal(
      "1",
      "INVALID_SNAPSHOT_COUNT"
    );

    const snapshot = await vmexToken.checkpoints(
      deployer.address,
      userCountOfSnapshots - 1
    );
    expect(snapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("100000000"),
      "INVALID_SNAPSHOT_VALUE"
    );
  });

  it("Record correctly snapshot on transfer", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const from = deployer.address;
    const to = users[1].address;
    const toSigner = users[1].signer;
    await waitForTx(await vmexToken.connect(toSigner).delegate(to));
    await waitForTx(await vmexToken.transfer(to, ethers.utils.parseEther("1")));
    const fromCountOfSnapshots = await vmexToken.numCheckpoints(from);
    const fromLastSnapshot = await vmexToken.checkpoints(
      from,
      fromCountOfSnapshots - 1
    );
    const fromPreviousSnapshot = await vmexToken.checkpoints(
      from,
      fromCountOfSnapshots - 2
    );

    const toCountOfSnapshots = await vmexToken.numCheckpoints(to);
    const toSnapshot = await vmexToken.checkpoints(to, toCountOfSnapshots - 1);

    expect(fromCountOfSnapshots.toString()).to.be.equal(
      "2",
      "INVALID_SNAPSHOT_COUNT"
    );
    expect(fromLastSnapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("99999999"), // transferred away 1e18 tokens
      "INVALID_SNAPSHOT_VALUE"
    );
    expect(fromPreviousSnapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("100000000"),
      "INVALID_SNAPSHOT_VALUE"
    );

    expect(toCountOfSnapshots.toString()).to.be.equal(
      "1",
      "INVALID_SNAPSHOT_COUNT"
    );
    expect(toSnapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("1"),
      "INVALID_SNAPSHOT_VALUE"
    );
  });

  it("Reverts submitting a permit with 0 expiration", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const chainId = DRE.network.config.chainId || BUIDLEREVM_CHAINID;
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const expiration = 0;
    const nonce = (await vmexToken.nonces(owner)).toNumber();
    const permitAmount = ethers.utils.parseEther("2").toString();
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      permitAmount,
      expiration.toFixed()
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    expect((await vmexToken.allowance(owner, spender)).toString()).to.be.equal(
      "0",
      "INVALID_ALLOWANCE_BEFORE_PERMIT"
    );

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      vmexToken
        .connect(users[1].signer)
        .permit(owner, spender, permitAmount, expiration, v, r, s)
    ).to.be.revertedWith("ERC20Permit: expired deadline");

    expect((await vmexToken.allowance(owner, spender)).toString()).to.be.equal(
      "0",
      "INVALID_ALLOWANCE_AFTER_PERMIT"
    );
  });

  it("Submits a permit with maximum expiration length", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const { chainId } = await DRE.ethers.provider.getNetwork();
    const configChainId = DRE.network.config.chainId;
    expect(configChainId).to.be.equal(chainId);
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const deadline = MAX_UINT_AMOUNT;
    const nonce = (await vmexToken.nonces(owner)).toNumber();
    const permitAmount = ethers.utils.parseEther("2").toString();
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    expect((await vmexToken.allowance(owner, spender)).toString()).to.be.equal(
      "0",
      "INVALID_ALLOWANCE_BEFORE_PERMIT"
    );

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await waitForTx(
      await vmexToken
        .connect(users[1].signer)
        .permit(owner, spender, permitAmount, deadline, v, r, s)
    );

    expect((await vmexToken.nonces(owner)).toNumber()).to.be.equal(1);
  });

  it("Cancels the previous permit", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const { chainId } = await DRE.ethers.provider.getNetwork();
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const deadline = MAX_UINT_AMOUNT;
    const nonce = (await vmexToken.nonces(owner)).toNumber();
    const permitAmount = "0";
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    expect((await vmexToken.allowance(owner, spender)).toString()).to.be.equal(
      ethers.utils.parseEther("2"),
      "INVALID_ALLOWANCE_BEFORE_PERMIT"
    );

    await waitForTx(
      await vmexToken
        .connect(users[1].signer)
        .permit(owner, spender, permitAmount, deadline, v, r, s)
    );
    expect((await vmexToken.allowance(owner, spender)).toString()).to.be.equal(
      permitAmount,
      "INVALID_ALLOWANCE_AFTER_PERMIT"
    );

    expect((await vmexToken.nonces(owner)).toNumber()).to.be.equal(2);
  });

  it("Tries to submit a permit with invalid nonce", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const { chainId } = await DRE.ethers.provider.getNetwork();
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const deadline = MAX_UINT_AMOUNT;
    const nonce = 1000;
    const permitAmount = "0";
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      vmexToken
        .connect(users[1].signer)
        .permit(owner, spender, permitAmount, deadline, v, r, s)
    ).to.be.revertedWith("ERC20Permit: invalid signature");
  });

  it("Tries to submit a permit with invalid expiration (previous to the current block)", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const { chainId } = await DRE.ethers.provider.getNetwork();
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const expiration = "1";
    const nonce = (await vmexToken.nonces(owner)).toNumber();
    const permitAmount = "0";
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      expiration,
      permitAmount
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      vmexToken
        .connect(users[1].signer)
        .permit(owner, spender, expiration, permitAmount, v, r, s)
    ).to.be.revertedWith("ERC20Permit: expired deadline");
  });

  it("Tries to submit a permit with invalid signature", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const { chainId } = await DRE.ethers.provider.getNetwork();
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const deadline = MAX_UINT_AMOUNT;
    const nonce = (await vmexToken.nonces(owner)).toNumber();
    const permitAmount = "0";
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      deadline,
      permitAmount
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      vmexToken
        .connect(users[1].signer)
        .permit(owner, ZERO_ADDRESS, permitAmount, deadline, v, r, s)
    ).to.be.revertedWith("ERC20Permit: invalid signature");
  });

  it("Tries to submit a permit with invalid owner", async () => {
    const { vmexToken, deployer, users } = testEnv;
    const owner = deployer.address;
    const spender = users[1].address;

    const { chainId } = await DRE.ethers.provider.getNetwork();
    if (!chainId) {
      fail("Current network doesn't have CHAIN ID");
    }
    const expiration = MAX_UINT_AMOUNT;
    const nonce = (await vmexToken.nonces(owner)).toNumber();
    const permitAmount = "0";
    const msgParams = buildPermitParams(
      chainId,
      vmexToken.address,
      "1",
      "Vmex Token",
      owner,
      spender,
      nonce,
      expiration,
      permitAmount
    );

    const ownerPrivateKey = require("../../test-wallets.js").accounts[0]
      .secretKey;
    if (!ownerPrivateKey) {
      throw new Error("INVALID_OWNER_PK");
    }

    const { v, r, s } = getSignatureFromTypedData(ownerPrivateKey, msgParams);

    await expect(
      vmexToken
        .connect(users[1].signer)
        .permit(ZERO_ADDRESS, spender, permitAmount, expiration, v, r, s)
    ).to.be.revertedWith("ERC20Permit: invalid signature");
  });

  it("Correct snapshotting on double action in the same block", async () => {
    const { vmexToken, users } = testEnv;

    const doubleTransferHelper = await deployDoubleTransferHelper(
      vmexToken.address
    );

    const receiver = users[2].address;
    const transferBalance = ethers.utils.parseEther("1");

    // enable doubletransferhelper, user2 for voting
    await waitForTx(await doubleTransferHelper.enableVoting());

    await waitForTx(
      await vmexToken.connect(users[2].signer).delegate(users[2].address)
    );

    // send tokens
    await waitForTx(
      await vmexToken
        .connect(users[1].signer)
        .transfer(doubleTransferHelper.address, transferBalance)
    );

    await waitForTx(
      await doubleTransferHelper.doubleSend(
        receiver,
        ethers.utils.parseEther("0.2"),
        ethers.utils.parseEther("0.8")
      )
    );

    const countSnapshotsReceiver = (
      await vmexToken.numCheckpoints(receiver)
    ).toString();
    expect(countSnapshotsReceiver).to.be.equal(
      "1",
      "INVALID_COUNT_SNAPSHOTS_RECEIVER"
    );

    const snapshotReceiver = await vmexToken.checkpoints(receiver, 0);

    expect(snapshotReceiver.votes.toString()).to.be.equal(
      ethers.utils.parseEther("1")
    );

    const countSnapshotsSender = (
      await vmexToken.numCheckpoints(doubleTransferHelper.address)
    ).toString();

    expect(countSnapshotsSender).to.be.equal(
      "2",
      "INVALID_COUNT_SNAPSHOTS_SENDER"
    );
    const snapshotsSender = [
      await vmexToken.checkpoints(doubleTransferHelper.address, 0),
      await vmexToken.checkpoints(doubleTransferHelper.address, 1),
    ];

    expect(snapshotsSender[0].votes.toString()).to.be.equal(
      ethers.utils.parseEther("1"),
      "INVALID_SENDER_SNAPSHOT"
    );
    expect(snapshotsSender[1].votes.toString()).to.be.equal(
      ethers.utils.parseEther("0"),
      "INVALID_SENDER_SNAPSHOT"
    );
  });

  //   it('Emits correctly mock event of the _beforeTokenTransfer hook', async () => {
  //     const {vmexToken, mockTransferHook, users} = testEnv;

  //     const recipient = users[2].address;

  //     await expect(vmexToken.connect(users[1].signer).transfer(recipient, 1)).to.emit(
  //       mockTransferHook,
  //       'MockHookEvent'
  //     );
  //   });

  it("Don't record snapshot when sending funds to itself", async () => {
    const { vmexToken, deployer } = testEnv;
    const from = deployer.address;
    const to = from;
    expect((await vmexToken.numCheckpoints(from)).toString()).to.be.equal(
      "2",
      "INVALID_SNAPSHOT_COUNT"
    );
    await waitForTx(await vmexToken.transfer(to, ethers.utils.parseEther("1")));
    const fromCountOfSnapshots = await vmexToken.numCheckpoints(from);
    const fromLastSnapshot = await vmexToken.checkpoints(
      from,
      fromCountOfSnapshots - 1
    );
    const fromPreviousSnapshot = await vmexToken.checkpoints(
      from,
      fromCountOfSnapshots - 2
    );

    const toCountOfSnapshots = await vmexToken.numCheckpoints(to);
    const toSnapshot = await vmexToken.checkpoints(to, toCountOfSnapshots - 1);

    expect(fromCountOfSnapshots.toString()).to.be.equal(
      "2",
      "INVALID_SNAPSHOT_COUNT"
    );
    expect(fromLastSnapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("99999999"),
      "INVALID_SNAPSHOT_VALUE"
    );
    expect(fromPreviousSnapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("100000000"),
      "INVALID_SNAPSHOT_VALUE"
    );

    expect(toCountOfSnapshots.toString()).to.be.equal(
      "2",
      "INVALID_SNAPSHOT_COUNT"
    );
    expect(toSnapshot.votes.toString()).to.be.equal(
      ethers.utils.parseEther("99999999"),
      "INVALID_SNAPSHOT_VALUE"
    );
  });
});
