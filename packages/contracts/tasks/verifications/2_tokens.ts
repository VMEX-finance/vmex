import { ethers } from "ethers";
import { task } from "hardhat/config";
import {
  loadPoolConfig,
  ConfigNames,
  getTreasuryAddress,
} from "../../helpers/configuration";
import { ZERO_ADDRESS } from "../../helpers/constants";
import {
  getAddressById,
  getAToken,
  getATokenBeacon,
  getFirstSigner,
  getInterestRateStrategy,
  getLendingPoolAddressesProvider,
  getProxy,
  getStableDebtToken,
  getVariableDebtToken,
  getVariableDebtTokenBeacon,
} from "../../helpers/contracts-getters";
import {
  getParamPerNetwork,
  verifyContract,
} from "../../helpers/contracts-helpers";
import {
  eContractid,
  eNetwork,
  ICommonConfiguration,
  IReserveParams,
  tEthereumAddress,
} from "../../helpers/types";
import {
  LendingPoolConfiguratorFactory,
  LendingPoolFactory,
} from "../../types";
import AToken from "../../artifacts/contracts/protocol/tokenization/AToken.sol/AToken.json";
import VariableDebtToken from "../../artifacts/contracts/protocol/tokenization/VariableDebtToken.sol/VariableDebtToken.json"

task("verify:tokens", "Deploy oracles for dev enviroment")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, all, pool }, localDRE) => {
    await localDRE.run("set-DRE");
    const network = localDRE.network.name as eNetwork;
    const poolConfig = loadPoolConfig(pool);
    const { ReserveAssets, ReservesConfig } =
      poolConfig as ICommonConfiguration;

    const addressesProvider = await getLendingPoolAddressesProvider();
    const aTokenImpl = await addressesProvider.getAToken();
    const varDebtImpl = await addressesProvider.getVariableDebtToken();
    const aTokenBeacon = await addressesProvider.getATokenBeacon();
    const debtBeacon = await addressesProvider.getVariableDebtTokenBeacon();

    console.log('\n- Verifying atoken impl...\n');
    await verifyContract(
      eContractid.AToken, 
      await getAToken(aTokenImpl), 
      [],
      0
    );

    console.log('\n- Verifying var debt impl...\n');
    await verifyContract(
      eContractid.VariableDebtToken, 
      await getVariableDebtToken(varDebtImpl), 
      [],
      0
    );

    console.log('\n- Verifying atoken beacon...\n');
    await verifyContract(
      eContractid.ATokenBeacon, 
      await getATokenBeacon(aTokenBeacon), 
      [
        aTokenImpl,
      ],
      0
    );

    console.log('\n- Verifying variable debt beacon...\n');
    await verifyContract(
      eContractid.VariableDebtTokenBeacon, 
      await getVariableDebtTokenBeacon(debtBeacon), 
      [
        varDebtImpl,
      ],
      0
    );
    const lendingPoolProxy = LendingPoolFactory.connect(
      await addressesProvider.getLendingPool(),
      await getFirstSigner()
    );

    const lendingPoolConfigurator = LendingPoolConfiguratorFactory.connect(
      await addressesProvider.getLendingPoolConfigurator(),
      await getFirstSigner()
    );

    const totalTranches = await lendingPoolConfigurator.totalTranches();

    const configs = Object.entries(ReservesConfig) as [
      string,
      IReserveParams
    ][];

    interface InitializeTreasuryVars{
      lendingPoolConfigurator: tEthereumAddress;
      addressesProvider: tEthereumAddress;
      underlyingAsset: tEthereumAddress;
      trancheId: string;
    }

    const aTokenInterface = new ethers.utils.Interface(AToken.abi);
    const varDebtInterface = new ethers.utils.Interface(VariableDebtToken.abi);
    for (let i = 0; i < Number(totalTranches); i++) {
      for (const entry of Object.entries(
        getParamPerNetwork(ReserveAssets, network)
      )) {
        const [token, tokenAddress] = entry;
        console.log(`- Verifying ${token} token related contracts in tranche ${i}`);
        const {
          variableDebtTokenAddress,
          aTokenAddress,
          interestRateStrategyAddress,
        } = await lendingPoolProxy.getReserveData(tokenAddress, i);

        const tokenConfig = configs.find(([symbol]) => symbol === token);
        if (!tokenConfig) {
          throw `ReservesConfig not found for ${token} token`;
        }

        const {
          optimalUtilizationRate,
          baseVariableBorrowRate,
          variableRateSlope1,
          variableRateSlope2
        } = tokenConfig[1].strategy;

        const vars: InitializeTreasuryVars = {
          lendingPoolConfigurator: lendingPoolConfigurator.address,
          addressesProvider: addressesProvider.address,
          underlyingAsset: tokenAddress,
          trancheId: i.toString()
        }

        const aTokenEncodedCall = aTokenInterface.encodeFunctionData("initialize", [
          lendingPoolProxy.address,
          vars
        ])

        const varDebtEncodedCall = varDebtInterface.encodeFunctionData("initialize", [
          lendingPoolProxy.address,
          tokenAddress,
          i.toString(),
          addressesProvider.address,
        ])

        console.log("aTokenAddress: ", aTokenAddress)
        console.log("variableDebtTokenAddress: ", variableDebtTokenAddress)

        // Proxy Variable Debt
        console.log(`\n- Verifying  Debt Token proxy ${token} ${i}...\n`);
        await verifyContract(
          eContractid.InitializableAdminUpgradeabilityProxy,
          await getProxy(variableDebtTokenAddress),
          [debtBeacon, varDebtEncodedCall],
          100,
        );

        // Proxy aToken
        console.log(`\n- Verifying aToken proxy ${token} ${i}...\n`);
        await verifyContract(
          eContractid.InitializableAdminUpgradeabilityProxy,
          await getProxy(aTokenAddress),
          [aTokenBeacon, aTokenEncodedCall],
          0,
          1
        );

        // Strategy Rate
        console.log(`\n- Verifying Strategy rate ${token} ${i}....\n`);
        await verifyContract(
          eContractid.DefaultReserveInterestRateStrategy,
          await getInterestRateStrategy(interestRateStrategyAddress),
          [
            addressesProvider.address,
            optimalUtilizationRate,
            baseVariableBorrowRate,
            variableRateSlope1,
            variableRateSlope2,
          ],
          100
        );

        // const variableDebt = await getAddressById(`variableDebt${token}`);
        // const aToken = await getAddressById(`a${token}`);

        // if (aToken) {
        //   console.log("\n- Verifying aToken...\n");
        //   await verifyContract(eContractid.AToken, await getAToken(aToken), [
        //     lendingPoolProxy.address,
        //     lendingPoolConfigurator.address,
        //     addressesProvider.address,
        //     tokenAddress,
        //     i.toString(),
        //   ]);
        // } else {
        //   console.error(
        //     `Skipping aToken verify for ${token}. Missing address at JSON DB.`
        //   );
        // }
        // if (variableDebt) {
        //   console.log("\n- Verifying VariableDebtToken...\n");
        //   await verifyContract(
        //     eContractid.VariableDebtToken,
        //     await getVariableDebtToken(variableDebt),
        //     [
        //       lendingPoolProxy.address,
        //       tokenAddress,
        //       i.toString(),
        //       addressesProvider.address,
        //     ]
        //   );
        // } else {
        //   console.error(
        //     `Skipping variable debt verify for ${token}. Missing address at JSON DB.`
        //   );
        // }
      }
    }
  });
