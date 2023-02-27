// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface ILendingPoolConfigurator {
    struct UpdateATokenInput {
        address asset;
        uint64 trancheId;
        address implementation;
    }

    struct UpdateDebtTokenInput {
        address asset;
        uint64 trancheId;
        address implementation;
    }




    /**
     * @dev Emitted when a reserve factor is updated
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param factor The new reserve factor
     **/
    event ReserveFactorChanged(address indexed asset, uint64 indexed trancheId, uint256 factor);
    event TrancheNameChanged(uint64 indexed trancheId, string indexed name);
    event AddedWhitelistedDepositBorrow(address indexed user);

    event UpdatedTreasuryAddress(uint64 trancheId, address newAddress);

    event UserSetWhitelistEnabled(uint64 indexed trancheId, bool isWhitelisted);

    event UserChangedWhitelist(uint64 indexed trancheId, address indexed user, bool isWhitelisted);
    event UserChangedBlacklist(uint64 indexed trancheId, address indexed user, bool isBlacklisted);

    /**
     * @dev Emitted when a reserve is frozen
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     **/
    event ReserveFrozenChanged(address indexed asset, uint64 indexed trancheId, bool isFrozen);

    /**
     * @dev Emitted when a tranche is initialized.
     * @param trancheId The trancheId
     * @param trancheName The name of the tranche
     **/
    event TrancheInitialized(uint256 indexed trancheId, string trancheName, address admin);

    /**
     * @dev Emitted when a reserve is initialized.
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param aToken The address of the associated aToken contract
     * @param variableDebtToken The address of the associated variable rate debt token
     * @param interestRateStrategyAddress The address of the interest rate strategy for the reserve
     * @param borrowingEnabled Whether or not borrowing is enabled on the reserve
     * @param collateralEnabled Whether or not usage as collateral is enabled on the reserve
     * @param reserveFactor The reserve factor of the reserve
     **/
    event ReserveInitialized(
        address indexed asset,
        uint64 indexed trancheId,
        address indexed aToken,
        address variableDebtToken,
        address interestRateStrategyAddress,
        bool borrowingEnabled,
        bool collateralEnabled,
        uint256 reserveFactor
    );

    /**
     * @dev Emitted when borrowing is enabled on a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     **/
    event BorrowingSetOnReserve(
        address indexed asset,
        uint64 indexed trancheId,
        bool borrowingEnabled
    );

    /**
     * @dev Emitted when collateral is enabled on a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     **/
    event CollateralSetOnReserve(address indexed asset, uint64 indexed trancheId, bool collateralEnabled);

    /**
     * @dev Emitted when a reserve is activated
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     **/
    event ReserveActivated(address indexed asset, uint64 indexed trancheId);

    /**
     * @dev Emitted when a reserve is deactivated
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     **/
    event ReserveDeactivated(address indexed asset, uint64 indexed trancheId);

    /**
     * @dev Emitted when the reserve decimals are updated
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param decimals The new decimals
     **/
    event ReserveDecimalsChanged(address indexed asset, uint64 indexed trancheId, uint256 decimals);

    /**
     * @dev Emitted when a reserve interest strategy contract is updated
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param strategy The new address of the interest strategy contract
     **/
    event ReserveInterestRateStrategyChanged(
        address indexed asset,
        uint64 indexed trancheId,
        address strategy
    );

    event AssetDataChanged(address indexed asset, uint64 indexed trancheId, uint8 _assetType);

    /**
     * @dev Emitted when an aToken implementation is upgraded
     * @param asset The address of the underlying asset of the reserve
     * @param proxy The aToken proxy address
     * @param implementation The new aToken implementation
     **/
    event ATokenUpgraded(
        address indexed asset,
        uint64 trancheId,
        address indexed proxy,
        address indexed implementation
    );


    /**
     * @dev Emitted when the implementation of a variable debt token is upgraded
     * @param asset The address of the underlying asset of the reserve
     * @param proxy The variable debt token proxy address
     * @param implementation The new aToken implementation
     **/
    event VariableDebtTokenUpgraded(
        address indexed asset,
        uint64 trancheId,
        address indexed proxy,
        address indexed implementation
    );

    function trancheAdminTreasuryAddresses(uint64 trancheId) external view returns(address);

    function totalTranches() external view returns(uint64);
}
