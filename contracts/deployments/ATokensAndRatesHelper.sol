// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {LendingPool} from "../protocol/lendingpool/LendingPool.sol";
import {LendingPoolAddressesProvider} from "../protocol/configuration/LendingPoolAddressesProvider.sol";
import {LendingPoolConfigurator} from "../protocol/lendingpool/LendingPoolConfigurator.sol";
import {AToken} from "../protocol/tokenization/AToken.sol";
import {DefaultReserveInterestRateStrategy} from "../protocol/lendingpool/DefaultReserveInterestRateStrategy.sol";
import {Ownable} from "../dependencies/openzeppelin/contracts/Ownable.sol";
import {StringLib} from "./StringLib.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";
import {Errors} from "../protocol/libraries/helpers/Errors.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../interfaces/ILendingPool.sol";

import {ReserveConfiguration} from "../protocol/libraries/configuration/ReserveConfiguration.sol";

contract ATokensAndRatesHelper is Ownable {
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

    address payable private pool;
    address private addressesProvider;
    address private poolConfigurator;
    uint256 internal DefaultVMEXReserveFactor;
    event deployedContracts(address aToken, address strategy);

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        require(
            ILendingPoolAddressesProvider(addressesProvider).getGlobalAdmin() ==
                msg.sender,
            "Caller not global VMEX admin"
        );
        _;
    }

    modifier onlyPoolAdmin(uint64 trancheId) {
        require(
            ILendingPoolAddressesProvider(addressesProvider).getPoolAdmin(
                trancheId
            ) ==
                msg.sender ||
                ILendingPoolAddressesProvider(addressesProvider)
                    .getGlobalAdmin() ==
                msg.sender, //getPoolAdmin(trancheId) gets the admin for a specific tranche
            Errors.CALLER_NOT_POOL_ADMIN
        );
        _;
    }

    struct InitDeploymentInput {
        address asset;
        uint256[6] rates;
    }

    struct ConfigureReserveInput {
        address asset;
        uint256 baseLTV;
        uint256 liquidationThreshold;
        uint256 liquidationBonus;
        uint256 reserveFactor;
        bool stableBorrowingEnabled;
        bool borrowingEnabled;
    }

    constructor(
        address payable _pool,
        address _addressesProvider,
        address _poolConfigurator,
        uint256 _DefaultVMEXReserveFactor
    ) public {
        pool = _pool; //not sure if this is LendingPool, but I think it should be
        addressesProvider = _addressesProvider;
        poolConfigurator = _poolConfigurator;
        DefaultVMEXReserveFactor = _DefaultVMEXReserveFactor;
    }

    function initDeployment(InitDeploymentInput[] calldata inputParams)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < inputParams.length; i++) {
            emit deployedContracts(
                address(new AToken()),
                address(
                    new DefaultReserveInterestRateStrategy(
                        LendingPoolAddressesProvider(addressesProvider),
                        inputParams[i].rates[0],
                        inputParams[i].rates[1],
                        inputParams[i].rates[2],
                        inputParams[i].rates[3],
                        inputParams[i].rates[4],
                        inputParams[i].rates[5]
                    )
                )
            );
        }
    }

    function configureReserves(
        ConfigureReserveInput[] calldata inputParams,
        uint64 trancheId
    ) external onlyPoolAdmin(trancheId) {
        LendingPoolConfigurator configurator = LendingPoolConfigurator(
            poolConfigurator
        );
        for (uint256 i = 0; i < inputParams.length; i++) {
            configurator.configureReserveAsCollateral(
                inputParams[i].asset,
                trancheId,
                inputParams[i].baseLTV,
                inputParams[i].liquidationThreshold,
                inputParams[i].liquidationBonus
            );

            if (inputParams[i].borrowingEnabled) {
                configurator.enableBorrowingOnReserve(
                    inputParams[i].asset,
                    trancheId,
                    inputParams[i].stableBorrowingEnabled
                );
            }
            setReserveFactor(
                inputParams[i].asset,
                trancheId,
                inputParams[i].reserveFactor
            );
            setVMEXReserveFactor(
                inputParams[i].asset,
                trancheId,
                DefaultVMEXReserveFactor
            );
        }
    }

    /**
     * @dev Emitted when a reserve factor is updated
     * @param asset The address of the underlying asset of the reserve
     * @param factor The new reserve factor
     **/
    event ReserveFactorChanged(address indexed asset, uint256 factor);

    /**
     * @dev Updates the reserve factor of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param reserveFactor The new reserve factor of the reserve
     **/
    function setReserveFactor(
        address asset,
        uint64 trancheId,
        uint256 reserveFactor
    ) public onlyPoolAdmin(trancheId) {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        currentConfig.setReserveFactor(reserveFactor);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit ReserveFactorChanged(asset, reserveFactor);
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param reserveFactor The new reserve factor of the reserve
     **/
    function setVMEXReserveFactor(
        address asset,
        uint64 trancheId,
        uint256 reserveFactor //the value here should only occupy 16 bits
    ) public onlyGlobalAdmin {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        currentConfig.setVMEXReserveFactor(reserveFactor);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit ReserveFactorChanged(asset, reserveFactor);
    }
}
