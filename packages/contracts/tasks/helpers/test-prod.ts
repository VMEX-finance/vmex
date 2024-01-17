import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts, waitForTx } from '../../helpers/misc-utils';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { buildTestEnv } from '../../helpers/contracts-deployments';
import { getDbEntry, getFirstSigner, getLendingPool, getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
import { eContractid } from '../../helpers/types';
import { ethers } from 'ethers';
import { MAX_UINT_AMOUNT } from '../../helpers/constants';
import { veloSwapForTokens } from '../../localhost_tests_utils/helpers/swap-tokens';

task('vmex:test-prod', 'Deploy development enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    const lendingPool = await getLendingPool("0x60F015F66F3647168831d31C7048ca95bb4FeaF9");
    const signer = await getFirstSigner()
    await veloSwapForTokens("0x7F5c764cBc14f9669B88837ca1490cCa17c31607", signer)
    await waitForTx(
      await lendingPool.deposit("0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 0, ethers.utils.parseUnits("5",6), await signer.getAddress(), 0)
    );
    await waitForTx(
        await lendingPool.withdraw("0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 0, MAX_UINT_AMOUNT, "0x464eD76C6B2DdeCC9aa1E990211670a81b93474B")
      );
  });
