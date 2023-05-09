// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {DebtTokenBase} from "./base/DebtTokenBase.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {IIncentivesController} from "../../interfaces/IIncentivesController.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import "../../dependencies/openzeppelin/contracts/utils/Strings.sol";
/**
 * @title VariableDebtToken
 * @notice Implements a variable debt token to track the borrowing positions of users
 * at variable rate mode
 * @author Aave, Vmex
 **/
contract VariableDebtToken is DebtTokenBase, IVariableDebtToken {
    using WadRayMath for uint256;
    using Helpers for address;

    uint256 public constant DEBT_TOKEN_REVISION = 0x1;

    ILendingPool public _pool;
    address public _underlyingAsset;
    uint64 public _tranche;
    ILendingPoolAddressesProvider public _addressesProvider;

    /**
     * @dev Initializes the debt token.
     * @param pool The address of the lending pool where this aToken will be used
     * @param underlyingAsset The address of the underlying asset of this aToken (E.g. WETH for aWETH)
     * @param addressesProvider The address provider
     */
    function initialize(
        ILendingPool pool,
        address underlyingAsset,
        uint64 trancheId,
        ILendingPoolAddressesProvider addressesProvider
    ) public override initializer {

        uint8 debtTokenDecimals = IERC20Detailed(underlyingAsset).decimals();
        string memory debtTokenName = string(
                    abi.encodePacked(
                        "Vmex variable debt bearing ",
                        underlyingAsset.getName(),
                        Strings.toString(trancheId)
                    )
                );
        string memory debtTokenSymbol = string(
                    abi.encodePacked(
                        "variableDebt",
                        underlyingAsset.getSymbol(),
                        Strings.toString(trancheId)
                    )
                );

        _setName(debtTokenName);
        _setSymbol(debtTokenSymbol);
        _setDecimals(debtTokenDecimals);

        _pool = pool;
        _underlyingAsset = underlyingAsset;
        _tranche = trancheId;
        _addressesProvider = addressesProvider;

        emit Initialized(
            underlyingAsset,
            trancheId,
            address(pool),
            address(addressesProvider),
            debtTokenDecimals,
            debtTokenName,
            debtTokenSymbol
        );
    }

    /**
     * @dev Gets the revision of the variable debt token implementation
     * @return The debt token implementation revision
     **/
    function getRevision() internal pure virtual override returns (uint256) {
        return DEBT_TOKEN_REVISION;
    }

    /**
     * @dev Calculates the accumulated debt balance of the user
     * @return The debt balance of the user
     **/
    function balanceOf(address user)
        public
        view
        virtual
        override
        returns (uint256)
    {
        uint256 scaledBalance = super.balanceOf(user);

        if (scaledBalance == 0) {
            return 0;
        }

        return
            scaledBalance.rayMul(
                _pool.getReserveNormalizedVariableDebt(
                    _underlyingAsset,
                    _tranche
                )
            );
    }

    /**
     * @dev Mints debt token to the `onBehalfOf` address
     * -  Only callable by the LendingPool
     * @param user The address receiving the borrowed underlying, being the delegatee in case
     * of credit delegate, or same as `onBehalfOf` otherwise
     * @param onBehalfOf The address receiving the debt tokens
     * @param amount The amount of debt being minted
     * @param index The variable debt index of the reserve
     * @return `true` if the the previous balance of the user is 0
     **/
    function mint(
        address user,
        address onBehalfOf,
        uint256 amount,
        uint256 index
    ) external override onlyLendingPool returns (bool) {
        if (user != onBehalfOf) {
            _decreaseBorrowAllowance(onBehalfOf, user, amount);
        }

        uint256 previousBalance = super.balanceOf(onBehalfOf);
        uint256 amountScaled = amount.rayDiv(index);
        require(amountScaled != 0, Errors.CT_INVALID_MINT_AMOUNT);

        _mint(onBehalfOf, amountScaled);

        emit Transfer(address(0), onBehalfOf, amount);
        emit Mint(user, onBehalfOf, amount, index);

        return previousBalance == 0;
    }

    /**
     * @dev Burns user variable debt
     * - Only callable by the LendingPool
     * @param user The user whose debt is getting burned
     * @param amount The amount getting burned
     * @param index The variable debt index of the reserve
     **/
    function burn(
        address user,
        uint256 amount,
        uint256 index
    ) external override onlyLendingPool {
        uint256 amountScaled = amount.rayDiv(index);
        require(amountScaled != 0, Errors.CT_INVALID_BURN_AMOUNT);

        _burn(user, amountScaled);

        emit Transfer(user, address(0), amount);
        emit Burn(user, amount, index);
    }

    /**
     * @dev Returns the principal debt balance of the user from
     * @return The debt balance of the user since the last burn/mint action
     **/
    function scaledBalanceOf(address user)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return super.balanceOf(user);
    }

    /**
     * @dev Returns the total supply of the variable debt token. Represents the total debt accrued by the users
     * @return The total supply
     **/
    function totalSupply() public view virtual override returns (uint256) {
        return
            super.totalSupply().rayMul(
                _pool.getReserveNormalizedVariableDebt(
                    _underlyingAsset,
                    _tranche
                )
            );
    }

    /**
     * @dev Returns the scaled total supply of the variable debt token. Represents sum(debt/index)
     * @return the scaled total supply
     **/
    function scaledTotalSupply()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return super.totalSupply();
    }

    /**
     * @dev Returns the principal balance of the user and principal total supply.
     * @param user The address of the user
     * @return The principal balance of the user
     * @return The principal total supply
     **/
    function getScaledUserBalanceAndSupply(address user)
        external
        view
        override
        returns (uint256, uint256)
    {
        return (super.balanceOf(user), super.totalSupply());
    }

    /**
     * @dev Returns the address of the underlying asset of this aToken (E.g. WETH for aWETH)
     **/
    function UNDERLYING_ASSET_ADDRESS() public view returns (address) {
        return _underlyingAsset;
    }

    /**
     * @dev Returns the address of the incentives controller contract
     **/
    function getIncentivesController()
        external
        view
        override
        returns (IIncentivesController)
    {
        return _getIncentivesController();
    }

    /**
     * @dev Returns the address of the lending pool where this aToken is used
     **/
    function POOL() public view returns (ILendingPool) {
        return _pool;
    }

    function _getIncentivesController()
        internal
        view
        override
        returns (IIncentivesController)
    {
        return IIncentivesController(_addressesProvider.getIncentivesController());
    }

    function _getUnderlyingAssetAddress()
        internal
        view
        override
        returns (address)
    {
        return _underlyingAsset;
    }

    function _getLendingPool() internal view override returns (ILendingPool) {
        return _pool;
    }
}
