import { task } from 'hardhat/config';
import { eNetwork } from '../../helpers/types';
import { deployVmexToken } from '../../helpers/contracts-deployments';

task('deploy-VmexToken', 'Deploys the Vmex Token')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, DRE) => {
    await DRE.run('set-DRE');
    const network = <eNetwork>DRE.network.name;

    const vmexToken = await deployVmexToken(verify);

    console.log(
      `Deployed Vmex Token on ${network} with address "${vmexToken.address}"`
    );
  });
