// // SPDX-License-Identifier: agpl-3.0
// pragma solidity >=0.8.0;

// import {LendingPool} from "../protocol/lendingpool/LendingPool.sol";
// import {LendingPoolAddressesProvider} from "../protocol/configuration/LendingPoolAddressesProvider.sol";
// import {LendingPoolConfigurator} from "../protocol/lendingpool/LendingPoolConfigurator.sol";
// import {AToken} from "../protocol/tokenization/AToken.sol";
// import {DefaultReserveInterestRateStrategy} from "../protocol/lendingpool/DefaultReserveInterestRateStrategy.sol";
// import {Ownable} from "../dependencies/openzeppelin/contracts/Ownable.sol";
// import {StringLib} from "./StringLib.sol";
// import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";
// import {Errors} from "../protocol/libraries/helpers/Errors.sol";
// import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
// import {ILendingPool} from "../interfaces/ILendingPool.sol";

// import {ReserveConfiguration} from "../protocol/libraries/configuration/ReserveConfiguration.sol";

// import {AssetMappings} from "../protocol/lendingpool/AssetMappings.sol";

// contract ATokensAndRatesHelper is Ownable {
//     using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

//     address payable private pool;
//     address private addressesProvider;
//     address private poolConfigurator;
//     event deployedContracts(address aToken, address strategy);

//     modifier onlyGlobalAdmin() {
//         //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
//         _onlyGlobalAdmin();
//         _;
//     }

//     function _onlyGlobalAdmin() internal view {
//         //this contract handles the updates to the configuration
//         require(
//             ILendingPoolAddressesProvider(addressesProvider).getGlobalAdmin() == msg.sender,
//             "Caller not global VMEX admin"
//         );
//     }

//     modifier onlyPoolAdmin(uint64 trancheId) {
//         _onlyPoolAdmin(trancheId);
//         _;
//     }

//     function _onlyPoolAdmin(uint64 trancheId) internal view {
//         //this contract handles the updates to the configuration
//         require(
//             ILendingPoolAddressesProvider(addressesProvider).getPoolAdmin(trancheId) == msg.sender ||
//                 ILendingPoolAddressesProvider(addressesProvider).getGlobalAdmin() == msg.sender, //getPoolAdmin(trancheId) gets the admin for a specific tranche
//             Errors.CALLER_NOT_POOL_ADMIN
//         );
//     }

//     struct InitDeploymentInput {
//         address asset;
//         uint256[6] rates;
//     }

//     // struct ConfigureReserveInput {
//     //     address asset;
//     //     uint256 reserveFactor;
//     // }

//     constructor(
//         address payable _pool,
//         address _addressesProvider,
//         address _poolConfigurator
//     ) public {
//         pool = _pool; //not sure if this is LendingPool, but I think it should be
//         addressesProvider = _addressesProvider;
//         poolConfigurator = _poolConfigurator;
//     }

//     function initDeployment(InitDeploymentInput[] calldata inputParams)
//         external
//         onlyOwner
//     {
//         for (uint256 i = 0; i < inputParams.length; i++) {
//             emit deployedContracts(
//                 address(new AToken()),
//                 address(
//                     new DefaultReserveInterestRateStrategy(
//                         LendingPoolAddressesProvider(addressesProvider),
//                         inputParams[i].rates[0],
//                         inputParams[i].rates[1],
//                         inputParams[i].rates[2],
//                         inputParams[i].rates[3],
//                         inputParams[i].rates[4],
//                         inputParams[i].rates[5]
//                     )
//                 )
//             );
//         }
//     }

//     // function configureReserves(
//     //     ConfigureReserveInput[] calldata inputParams,
//     //     uint64 trancheId
//     // ) external onlyPoolAdmin(trancheId) {
//     //     LendingPoolConfigurator configurator = LendingPoolConfigurator(
//     //         poolConfigurator
//     //     );
//     //     for (uint256 i = 0; i < inputParams.length; i++) {
//     //         DataTypes.AssetDataConfiguration memory vars = AssetMappings(ILendingPoolAddressesProvider(addressesProvider).getAssetMappings()).getAssetConfigurationMapping(inputParams[i].asset);
//     //         configurator.configureReserveAsCollateral(
//     //             inputParams[i].asset,
//     //             trancheId,
//     //             vars.baseLTV,
//     //             vars.liquidationThreshold,
//     //             vars.liquidationBonus
//     //         );

//     //         if (vars.borrowingEnabled) {
//     //             configurator.enableBorrowingOnReserve(
//     //                 inputParams[i].asset,
//     //                 trancheId,
//     //                 vars.stableBorrowingEnabled
//     //             );
//     //         }
//     //         setReserveFactor(
//     //             inputParams[i].asset,
//     //             trancheId,
//     //             inputParams[i].reserveFactor
//     //         );
//     //         setVMEXReserveFactor(
//     //             inputParams[i].asset,
//     //             trancheId,
//     //             DefaultVMEXReserveFactor
//     //         );
//     //     }
//     // }



//     // /**
//     //  * @dev Emitted when stable rate borrowing is enabled on a reserve
//     //  * @param asset The address of the underlying asset of the reserve
//     //  **/
//     // event StableRateEnabledOnReserve(address indexed asset);

//     // /**
//     //  * @dev Emitted when stable rate borrowing is disabled on a reserve
//     //  * @param asset The address of the underlying asset of the reserve
//     //  **/
//     // event StableRateDisabledOnReserve(address indexed asset);

//     // /**
//     //  * @dev Enable stable rate borrowing on a reserve
//     //  * @param asset The address of the underlying asset of the reserve
//     //  **/
//     // function enableReserveStableRate(address asset, uint64 trancheId)
//     //     external
//     //     onlyPoolAdmin(trancheId)
//     // {
//     //     DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
//     //         pool
//     //     )
//     //         .getConfiguration(asset, trancheId);

//     //     currentConfig.setStableRateBorrowingEnabled(true);

//     //     ILendingPool(
//     //         pool
//     //     ).setConfiguration(asset, trancheId, currentConfig.data);

//     //     emit StableRateEnabledOnReserve(asset);
//     // }

//     // /**
//     //  * @dev Disable stable rate borrowing on a reserve
//     //  * @param asset The address of the underlying asset of the reserve
//     //  **/
//     // function disableReserveStableRate(address asset, uint64 trancheId)
//     //     external
//     //     onlyPoolAdmin(trancheId)
//     // {
//     //     DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
//     //         pool
//     //     )
//     //         .getConfiguration(asset, trancheId);

//     //     currentConfig.setStableRateBorrowingEnabled(false);

//     //     ILendingPool(
//     //         pool
//     //     ).setConfiguration(asset, trancheId, currentConfig.data);

//     //     emit StableRateDisabledOnReserve(asset);
//     // }
// }
