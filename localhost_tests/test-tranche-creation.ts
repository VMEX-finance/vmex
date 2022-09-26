

    // Load the HRE into helpers to access signers
    const fs = require('fs');
    await run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');
    const contractHelpers = require('./helpers/contracts-helpers');
    const initHelpers = require('./helpers/init-helpers');

    const lendingPool = await contractGetters.getLendingPool();


// Load the first signer
var signer = await contractGetters.getFirstSigner();

const emergency = (await ethers.getSigners())[1]


/************************************************************************************/
/****************** unpause lending pools **********************/ 
/************************************************************************************/
const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()

await lendingPoolConfig.connect(emergency).setPoolPause(false)

var addressesProvider = await contractGetters.getLendingPoolAddressesProvider()
await addressesProvider.connect(signer).getPoolAdmin() //signer is pool admin

// initHelpers.initReservesByHelper()
//in theory this is entirely possible

await lendingPoolConfig.connect(signer).batchInitReserve()