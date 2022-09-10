"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../helpers/constants");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const make_suite_1 = require("./helpers/make-suite");
const utils_1 = require("ethers/lib/utils");
const misc_utils_1 = require("../../helpers/misc-utils");
const ethers_1 = require("ethers");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const { expect } = require('chai');
(0, make_suite_1.makeSuite)('Use native ETH at LendingPool via WETHGateway', (testEnv) => {
    const zero = ethers_1.BigNumber.from('0');
    const depositSize = (0, utils_1.parseEther)('5');
    const daiSize = (0, utils_1.parseEther)('10000');
    it('Deposit WETH via WethGateway and DAI', async () => {
        const { users, wethGateway, aWETH, pool } = testEnv;
        const user = users[1];
        const depositor = users[0];
        // Deposit liquidity with native ETH
        await wethGateway
            .connect(depositor.signer)
            .depositETH(pool.address, depositor.address, '0', { value: depositSize });
        // Deposit with native ETH
        await wethGateway
            .connect(user.signer)
            .depositETH(pool.address, user.address, '0', { value: depositSize });
        const aTokensBalance = await aWETH.balanceOf(user.address);
        expect(aTokensBalance).to.be.gt(zero);
        expect(aTokensBalance).to.be.gte(depositSize);
    });
    it('Withdraw WETH - Partial', async () => {
        const { users, wethGateway, aWETH, pool } = testEnv;
        const user = users[1];
        const priorEthersBalance = await user.signer.getBalance();
        const aTokensBalance = await aWETH.balanceOf(user.address);
        expect(aTokensBalance).to.be.gt(zero, 'User should have aTokens.');
        // Partially withdraw native ETH
        const partialWithdraw = await (0, contracts_helpers_1.convertToCurrencyDecimals)(aWETH.address, '2');
        // Approve the aTokens to Gateway so Gateway can withdraw and convert to Ether
        const approveTx = await aWETH
            .connect(user.signer)
            .approve(wethGateway.address, constants_1.MAX_UINT_AMOUNT);
        const { gasUsed: approveGas } = await (0, misc_utils_1.waitForTx)(approveTx);
        // Partial Withdraw and send native Ether to user
        const { gasUsed: withdrawGas } = await (0, misc_utils_1.waitForTx)(await wethGateway
            .connect(user.signer)
            .withdrawETH(pool.address, partialWithdraw, user.address));
        const afterPartialEtherBalance = await user.signer.getBalance();
        const afterPartialATokensBalance = await aWETH.balanceOf(user.address);
        const gasCosts = approveGas.add(withdrawGas).mul(approveTx.gasPrice);
        expect(afterPartialEtherBalance).to.be.equal(priorEthersBalance.add(partialWithdraw).sub(gasCosts), 'User ETHER balance should contain the partial withdraw');
        expect(afterPartialATokensBalance).to.be.equal(aTokensBalance.sub(partialWithdraw), 'User aWETH balance should be substracted');
    });
    it('Withdraw WETH - Full', async () => {
        const { users, aWETH, wethGateway, pool } = testEnv;
        const user = users[1];
        const priorEthersBalance = await user.signer.getBalance();
        const aTokensBalance = await aWETH.balanceOf(user.address);
        expect(aTokensBalance).to.be.gt(zero, 'User should have aTokens.');
        // Approve the aTokens to Gateway so Gateway can withdraw and convert to Ether
        const approveTx = await aWETH
            .connect(user.signer)
            .approve(wethGateway.address, constants_1.MAX_UINT_AMOUNT);
        const { gasUsed: approveGas } = await (0, misc_utils_1.waitForTx)(approveTx);
        // Full withdraw
        const { gasUsed: withdrawGas } = await (0, misc_utils_1.waitForTx)(await wethGateway
            .connect(user.signer)
            .withdrawETH(pool.address, constants_1.MAX_UINT_AMOUNT, user.address));
        const afterFullEtherBalance = await user.signer.getBalance();
        const afterFullATokensBalance = await aWETH.balanceOf(user.address);
        const gasCosts = approveGas.add(withdrawGas).mul(approveTx.gasPrice);
        expect(afterFullEtherBalance).to.be.eq(priorEthersBalance.add(aTokensBalance).sub(gasCosts), 'User ETHER balance should contain the full withdraw');
        expect(afterFullATokensBalance).to.be.eq(0, 'User aWETH balance should be zero');
    });
    it('Borrow stable WETH and Full Repay with ETH', async () => {
        const { users, wethGateway, aDai, weth, dai, pool, helpersContract } = testEnv;
        const borrowSize = (0, utils_1.parseEther)('1');
        const repaySize = borrowSize.add(borrowSize.mul(5).div(100));
        const user = users[1];
        const depositor = users[0];
        // Deposit with native ETH
        await wethGateway
            .connect(depositor.signer)
            .depositETH(pool.address, depositor.address, '0', { value: depositSize });
        const { stableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(weth.address);
        const stableDebtToken = await (0, contracts_getters_1.getStableDebtToken)(stableDebtTokenAddress);
        // Deposit 10000 DAI
        await dai.connect(user.signer).mint(daiSize);
        await dai.connect(user.signer).approve(pool.address, daiSize);
        await pool.connect(user.signer).deposit(dai.address, daiSize, user.address, '0');
        const aTokensBalance = await aDai.balanceOf(user.address);
        expect(aTokensBalance).to.be.gt(zero);
        expect(aTokensBalance).to.be.gte(daiSize);
        // Borrow WETH with WETH as collateral
        await (0, misc_utils_1.waitForTx)(await pool.connect(user.signer).borrow(weth.address, borrowSize, '1', '0', user.address));
        const debtBalance = await stableDebtToken.balanceOf(user.address);
        expect(debtBalance).to.be.gt(zero);
        // Full Repay WETH with native ETH
        await (0, misc_utils_1.waitForTx)(await wethGateway
            .connect(user.signer)
            .repayETH(pool.address, constants_1.MAX_UINT_AMOUNT, '1', user.address, { value: repaySize }));
        const debtBalanceAfterRepay = await stableDebtToken.balanceOf(user.address);
        expect(debtBalanceAfterRepay).to.be.eq(zero);
        // Withdraw DAI
        await aDai.connect(user.signer).approve(pool.address, constants_1.MAX_UINT_AMOUNT);
        await pool.connect(user.signer).withdraw(dai.address, constants_1.MAX_UINT_AMOUNT, user.address);
    });
    it('Borrow variable WETH and Full Repay with ETH', async () => {
        const { users, wethGateway, aWETH, weth, pool, helpersContract } = testEnv;
        const borrowSize = (0, utils_1.parseEther)('1');
        const repaySize = borrowSize.add(borrowSize.mul(5).div(100));
        const user = users[1];
        const { variableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(weth.address);
        const varDebtToken = await (0, contracts_getters_1.getVariableDebtToken)(variableDebtTokenAddress);
        // Deposit with native ETH
        await wethGateway
            .connect(user.signer)
            .depositETH(pool.address, user.address, '0', { value: depositSize });
        const aTokensBalance = await aWETH.balanceOf(user.address);
        expect(aTokensBalance).to.be.gt(zero);
        expect(aTokensBalance).to.be.gte(depositSize);
        // Borrow WETH with WETH as collateral
        await (0, misc_utils_1.waitForTx)(await pool.connect(user.signer).borrow(weth.address, borrowSize, '2', '0', user.address));
        const debtBalance = await varDebtToken.balanceOf(user.address);
        expect(debtBalance).to.be.gt(zero);
        // Partial Repay WETH loan with native ETH
        const partialPayment = repaySize.div(2);
        await (0, misc_utils_1.waitForTx)(await wethGateway
            .connect(user.signer)
            .repayETH(pool.address, partialPayment, '2', user.address, { value: partialPayment }));
        const debtBalanceAfterPartialRepay = await varDebtToken.balanceOf(user.address);
        expect(debtBalanceAfterPartialRepay).to.be.lt(debtBalance);
        // Full Repay WETH loan with native ETH
        await (0, misc_utils_1.waitForTx)(await wethGateway
            .connect(user.signer)
            .repayETH(pool.address, constants_1.MAX_UINT_AMOUNT, '2', user.address, { value: repaySize }));
        const debtBalanceAfterFullRepay = await varDebtToken.balanceOf(user.address);
        expect(debtBalanceAfterFullRepay).to.be.eq(zero);
    });
    it('Borrow ETH via delegateApprove ETH and repays back', async () => {
        const { users, wethGateway, aWETH, weth, helpersContract, pool } = testEnv;
        const borrowSize = (0, utils_1.parseEther)('1');
        const user = users[2];
        const { variableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(weth.address);
        const varDebtToken = await (0, contracts_getters_1.getVariableDebtToken)(variableDebtTokenAddress);
        const priorDebtBalance = await varDebtToken.balanceOf(user.address);
        expect(priorDebtBalance).to.be.eq(zero);
        // Deposit WETH with native ETH
        await wethGateway
            .connect(user.signer)
            .depositETH(pool.address, user.address, '0', { value: depositSize });
        const aTokensBalance = await aWETH.balanceOf(user.address);
        expect(aTokensBalance).to.be.gt(zero);
        expect(aTokensBalance).to.be.gte(depositSize);
        // Delegates borrowing power of WETH to WETHGateway
        await (0, misc_utils_1.waitForTx)(await varDebtToken.connect(user.signer).approveDelegation(wethGateway.address, borrowSize));
        // Borrows ETH with WETH as collateral
        await (0, misc_utils_1.waitForTx)(await wethGateway.connect(user.signer).borrowETH(pool.address, borrowSize, '2', '0'));
        const debtBalance = await varDebtToken.balanceOf(user.address);
        expect(debtBalance).to.be.gt(zero);
        // Full Repay WETH loan with native ETH
        await (0, misc_utils_1.waitForTx)(await wethGateway
            .connect(user.signer)
            .repayETH(pool.address, constants_1.MAX_UINT_AMOUNT, '2', user.address, { value: borrowSize.mul(2) }));
        const debtBalanceAfterFullRepay = await varDebtToken.balanceOf(user.address);
        expect(debtBalanceAfterFullRepay).to.be.eq(zero);
    });
    it('Should revert if receiver function receives Ether if not WETH', async () => {
        const { users, wethGateway } = testEnv;
        const user = users[0];
        const amount = (0, utils_1.parseEther)('1');
        // Call receiver function (empty data + value)
        await expect(user.signer.sendTransaction({
            to: wethGateway.address,
            value: amount,
            gasLimit: misc_utils_1.DRE.network.config.gas,
        })).to.be.revertedWith('Receive not allowed');
    });
    it('Should revert if fallback functions is called with Ether', async () => {
        const { users, wethGateway } = testEnv;
        const user = users[0];
        const amount = (0, utils_1.parseEther)('1');
        const fakeABI = ['function wantToCallFallback()'];
        const abiCoder = new misc_utils_1.DRE.ethers.utils.Interface(fakeABI);
        const fakeMethodEncoded = abiCoder.encodeFunctionData('wantToCallFallback', []);
        // Call fallback function with value
        await expect(user.signer.sendTransaction({
            to: wethGateway.address,
            data: fakeMethodEncoded,
            value: amount,
            gasLimit: misc_utils_1.DRE.network.config.gas,
        })).to.be.revertedWith('Fallback not allowed');
    });
    it('Should revert if fallback functions is called', async () => {
        const { users, wethGateway } = testEnv;
        const user = users[0];
        const fakeABI = ['function wantToCallFallback()'];
        const abiCoder = new misc_utils_1.DRE.ethers.utils.Interface(fakeABI);
        const fakeMethodEncoded = abiCoder.encodeFunctionData('wantToCallFallback', []);
        // Call fallback function without value
        await expect(user.signer.sendTransaction({
            to: wethGateway.address,
            data: fakeMethodEncoded,
            gasLimit: misc_utils_1.DRE.network.config.gas,
        })).to.be.revertedWith('Fallback not allowed');
    });
    it('Owner can do emergency token recovery', async () => {
        const { users, dai, wethGateway, deployer } = testEnv;
        const user = users[0];
        const amount = (0, utils_1.parseEther)('1');
        await dai.connect(user.signer).mint(amount);
        const daiBalanceAfterMint = await dai.balanceOf(user.address);
        await dai.connect(user.signer).transfer(wethGateway.address, amount);
        const daiBalanceAfterBadTransfer = await dai.balanceOf(user.address);
        expect(daiBalanceAfterBadTransfer).to.be.eq(daiBalanceAfterMint.sub(amount), 'User should have lost the funds here.');
        await wethGateway
            .connect(deployer.signer)
            .emergencyTokenTransfer(dai.address, user.address, amount);
        const daiBalanceAfterRecovery = await dai.balanceOf(user.address);
        expect(daiBalanceAfterRecovery).to.be.eq(daiBalanceAfterMint, 'User should recover the funds due emergency token transfer');
    });
    it('Owner can do emergency native ETH recovery', async () => {
        const { users, wethGateway, deployer } = testEnv;
        const user = users[0];
        const amount = (0, utils_1.parseEther)('1');
        const userBalancePriorCall = await user.signer.getBalance();
        // Deploy contract with payable selfdestruct contract
        const selfdestructContract = await (0, contracts_deployments_1.deploySelfdestructTransferMock)();
        // Selfdestruct the mock, pointing to WETHGateway address
        const callTx = await selfdestructContract
            .connect(user.signer)
            .destroyAndTransfer(wethGateway.address, { value: amount });
        const { gasUsed } = await (0, misc_utils_1.waitForTx)(callTx);
        const gasFees = gasUsed.mul(callTx.gasPrice);
        const userBalanceAfterCall = await user.signer.getBalance();
        expect(userBalanceAfterCall).to.be.eq(userBalancePriorCall.sub(amount).sub(gasFees), '');
        ('User should have lost the funds');
        // Recover the funds from the contract and sends back to the user
        await wethGateway.connect(deployer.signer).emergencyEtherTransfer(user.address, amount);
        const userBalanceAfterRecovery = await user.signer.getBalance();
        const wethGatewayAfterRecovery = await misc_utils_1.DRE.ethers.provider.getBalance(wethGateway.address);
        expect(userBalanceAfterRecovery).to.be.eq(userBalancePriorCall.sub(gasFees), 'User should recover the funds due emergency eth transfer.');
        expect(wethGatewayAfterRecovery).to.be.eq('0', 'WETHGateway ether balance should be zero.');
    });
});
