// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {PausableUpgradeable} from "../../dependencies/openzeppelin/upgradeability2/PausableUpgradeable.sol";

import {IBaseStrategy} from "../../interfaces/IBaseStrategy.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {IAToken} from "../../interfaces/IAToken.sol";

import {vStrategyHelper} from "./deps/vStrategyHelper.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";

//import "hardhat/console.sol";

/*
    ===== Badger Base Strategy =====
    Common base class for all Sett strategies
    Changelog
    V1.1
    - Verify amount unrolled from strategy positions on withdraw() is within a threshold relative to the requested amount as a sanity check
    - Add version number which is displayed with baseStrategyVersion(). If a strategy does not implement this function, it can be assumed to be 1.0
    V1.2
    - Remove idle underlying handling from base withdraw() function. This should be handled as the strategy sees fit in _withdrawSome()
    V1.5
    - No controller as middleman. The Strategy directly interacts with the lendingPool
    - withdrawToLendingPool would withdraw all the funds from the strategy and move it into lendingPool
    - strategy would take the actors from the lendingPool it is connected to
        - SettAccessControl removed
    - fees calculation for autocompounding rewards moved to lendingPool
    - autoCompoundRatio param added to keep a track in which ratio harvested rewards are being autocompounded
*/

//using camelCase this time even if it kills me inside
abstract contract BaseStrategy is PausableUpgradeable, IBaseStrategy {
    using PercentageMath for uint256;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

    uint256 public constant MAX_BPS = 10_000; // MAX_BPS in terms of BPS = 100%
    uint256 public constant LEFTOVER = 1000; //amount to be kept in the strategy contract for quick withdrawals

    ILendingPoolAddressesProvider public addressProvider; // lending pool address provider
    address public lendingPool; // address of the lending pool
    address public treasury;

    address public underlying; // Token used for pulls //CHANGED from want to underlying to make clear that is the underlying token of the lending pool
    uint64 public tranche; // tranche of lending pool the strategy is attached to
    address public vToken; // address of the vToken the strategy is attached to
    uint256 public withdrawalMaxDeviationThreshold; // max allowed slippage when withdrawing

    uint256 internal constant SECONDS_PER_YEAR = 365 days;

    /// @notice percentage of rewards converted to underlying
    /// @dev converting of rewards to underlying during harvest should take place in this ratio
    /// @dev change this ratio if rewards are converted in a different percentage
    /// value ranges from 0 to 10_000
    /// 0: keeping 100% harvest in reward tokens
    /// 10_000: converting all rewards tokens to underlying token
    uint256 public autoCompoundRatio; // NOTE: I believe this is unused

    // NOTE: You have to set autoCompoundRatio in the initializer of your strategy

    mapping(address => uint256) public extraRewardsTended; //can be multiple additional rewards, depending on pool I believe

    uint256 public lastHarvestTime;

    mapping(uint8 => uint256) public averageR; //store the last 7 days of rates of return. First value is index, which points to the uint256 value that has the averageR
    uint8 internal index;
    uint8 internal lengthOfMovingAverage;

    /// @notice Initializes BaseStrategy. Can only be called once.
    ///         Make sure to call it from the initializer of the derived strategy.
    function __BaseStrategy_init(
        address _addressProvider,
        address _underlying,
        uint64 _tranche
    ) public initializer whenNotPaused {
        require(_addressProvider != address(0), "Address 0");
        __Pausable_init();

        addressProvider = ILendingPoolAddressesProvider(_addressProvider);
        lendingPool = addressProvider.getLendingPool();
        underlying = _underlying; //the CRV LP token used in the strategy
        tranche = _tranche;
        vToken = ILendingPool(lendingPool)
            .getReserveData(underlying, tranche)
            .aTokenAddress;
        require(vToken != address(0), "vToken address can not be zero");

        withdrawalMaxDeviationThreshold = 50; // BPS
        // NOTE: See above
        autoCompoundRatio = 10_000;

        // give the reserve's vtoken full access to underlying
        // vStrategyHelper.tokenAllowAll(underlying, vToken);

        index = 0; //placed in init so can be upgraded
        lengthOfMovingAverage = 7; //7 days moving average
    }

    // ===== Modifiers =====

    function governance() public view returns (address) {
        return addressProvider.getPoolAdmin(tranche);
    }

    /// @notice Checks whether a call is from governance.
    /// @dev For functions that only the governance should be able to call
    ///      Most of the time setting setters, or to rescue/sweep funds
    function _onlyGovernance() internal view {
        require(msg.sender == governance(), "onlyGovernance");
    }

    /// @notice Checks whether a call is from strategy user (the lending pool) or governance.
    /// @dev For functions that only known benign entities should call
    function _onlyAuthorizedActors() internal view {
        require(
            msg.sender == vToken || msg.sender == governance(),
            "onlyAuthorizedActors"
        );
    }

    /// @notice Checks whether a call is from the lendingPool.
    /// @dev For functions that only the lendingPool should use
    function _onlyVault() internal view {
        require(msg.sender == vToken, "onlyVault");
    }

    /// @notice Checks whether a call is from guardian or governance.
    /// @dev Modifier used exclusively for pausing
    function _onlyAuthorizedPausers() internal view {
        require(msg.sender == governance(), "onlyPausers");
    }

    /// ===== View Functions =====
    /// @notice Used to track the deployed version of BaseStrategy.
    /// @return Current version of the contract.
    function baseStrategyVersion()
        external
        pure
        override
        returns (string memory)
    {
        return "1.0";
    }

    /// @notice Gives the balance of underlying held idle in the Strategy.
    /// @dev Public because used internally for accounting
    /// @return Balance of underlying held idle in the strategy.
    function balanceOfWant() public view returns (uint256) {
        return IERC20(underlying).balanceOf(address(this));
    }

    /// @notice Gives the total balance of underlying managed by the strategy.
    ///         This includes all underlying pulled to active strategy positions as well as any idle underlying in the strategy.
    /// @return Total balance of underlying managed by the strategy.
    function balanceOf() external view override returns (uint256) {
        return balanceOfWant() + balanceOfPool();
    }

    /// @notice Tells whether the strategy is supposed to be tended.
    /// @dev This is usually a constant. The harvest keeper would only call `tend` if this is true.
    /// @return Boolean indicating whether strategy is supposed to be tended or not.
    function isTendable() external pure returns (bool) {
        return _isTendable();
    }

    function _isTendable() internal pure virtual returns (bool);

    /// @notice Checks whether a token is a protected token.
    ///         Protected tokens are managed by the strategy and can't be transferred/sweeped.
    /// @return Boolean indicating whether the token is a protected token.
    function isProtectedToken(address token) public view returns (bool) {
        require(token != address(0), "Address 0");

        address[] memory protectedTokens = getProtectedTokens();
        for (uint256 i = 0; i < protectedTokens.length; i++) {
            if (token == protectedTokens[i]) {
                return true;
            }
        }
        return false;
    }

    /// ===== Permissioned Actions: Governance =====

    /// @notice Sets the max withdrawal deviation (percentage loss) that is acceptable to the strategy.
    ///         This can only be called by governance.
    /// @dev This is used as a slippage check against the actual funds withdrawn from strategy positions.
    ///      See `withdraw`.
    function setWithdrawalMaxDeviationThreshold(uint256 _threshold)
        external
        override
    {
        _onlyGovernance();
        require(_threshold <= MAX_BPS, "_threshold should be <= MAX_BPS");
        withdrawalMaxDeviationThreshold = _threshold;
        emit SetWithdrawalMaxDeviationThreshold(_threshold);
    }

    /// @notice Deposits any idle underlying in the strategy into positions.
    ///         This can be called by either the lendingPool, keeper or governance.
    ///         Note that pulls don't work when the strategy is paused.
    /// @dev Is basically the same as tend, except without custom code for it
    function pull() external override whenNotPaused returns (uint256) {
        // _onlyAuthorizedActors();
        uint256 pullFromPool = IERC20(underlying).balanceOf(address(vToken));
        if (pullFromPool > 0) {
            // do not keep 10% in pool for now
            // uint256 amountKeptInPool = checkForMaxDepositAmount(pullFromPool);

            IERC20(underlying).transferFrom(
                address(vToken),
                address(this),
                pullFromPool
            );
            emit StrategyPullFromLendingPool(lendingPool, pullFromPool);
        }
        uint256 _amount = IERC20(underlying).balanceOf(address(this));
        if (_amount > 0) {
            _pull(_amount);
        }

        return pullFromPool;
    }

    function checkForMaxDepositAmount(uint256 newDeposits)
        internal
        view
        returns (uint256)
    {
        //get new total amount that will be in the strategy
        uint256 amountInStrategy = balanceOfPool();
        uint256 currentHeld = IERC20(underlying).balanceOf(address(this));
        uint256 newTotal = amountInStrategy + newDeposits;

        //this is how much needs to remain in this contract to achieve 10% held
        uint256 newPercentage = (newTotal * LEFTOVER) / 1e4;

        //get the amount needed to be kept to create a constant 10% withdrawal buffer
        uint256 dif = newPercentage - currentHeld;
        return dif;
    }

    //using the tend data, we can get the current rate of return since the last harvest, or r value;
    //		i = underlying gained
    //		p = principal
    //this can be used to find the APY by using the (1 + r/n)^n - 1 formula
    //NOTE: i already includes deductions from fees and swaps, no need to calc that in
    //NOTE: divide the result by 1e18, then multiply by 100 for a percentage
    function interestRate(uint256 i, uint256 p, uint256 timeDifference) internal returns (uint256 r) {
        uint256 m = ILendingPool(lendingPool)
            .getReserveData(underlying, tranche)
            .configuration
            .data;
        uint256 scaledAmount = i.percentMul(
            PercentageMath.PERCENTAGE_FACTOR - (ReserveConfiguration.getVMEXReserveFactorData(m))
        );

        r = (scaledAmount * WadRayMath.ray() * SECONDS_PER_YEAR) / (p  * timeDifference) ; //*365 if we tend every day.
        //WadRayMath.ray() is 1e27. This is the same units as currentLiquidityRate
        // if we know the timestamp difference between this and last update, can extrapolate using that

        //global index to keep track of which is the oldest element in the array
        //every day, we increment the global index by 1 and replace the indexed value with the new r value
        //order does not matter in this context, but we do need to know which of the values is the oldest
        averageR[index] = r;
        index++;

        //once we hit the length of the array, we reset the global index to 0 to restart the process
        if (index >= lengthOfMovingAverage) {
            index = 0;
        }

        emit InterestRateUpdated(scaledAmount,timeDifference, p,SECONDS_PER_YEAR, r);

        return r;
    }
    //this will only be used for purpose of frontend
    function calculateAverageRate() external view override returns (uint256 r) {
        uint256 ret = 0;
        for (uint8 i = 0; i < lengthOfMovingAverage; i++) {
            ret += averageR[i];
        }
        ret /= lengthOfMovingAverage;
        return ret;
    }

    function getLatestRate() external view returns (uint256 r) {
        if(index == 0)
            return averageR[lengthOfMovingAverage-1];
        return averageR[index-1];
    }

    // ===== Permissioned Actions: Vault =====

    /// @notice Withdraw all funds from the strategy to the lendingPool, unrolling all positions.
    ///         This can only be called by the lendingPool.
    /// @dev This can be called even when paused, and strategist can trigger this via the lendingPool.
    ///      The idea is that this can allow recovery of funds back to the strategy faster.
    ///      The risk is that if _withdrawAll causes a loss, this can be triggered.
    ///      However the loss could only be triggered once (just like if governance called)
    ///      as pausing the strats would prevent earning again.
    function withdrawAll() external override {
        _onlyVault();

        _withdrawAll();

        uint256 balance = IERC20(underlying).balanceOf(address(this));
        _transferToLendingPool(balance);
    }

    /// @notice Withdraw partial funds from the strategy to the lendingPool, unrolling from strategy positions as necessary.
    ///         This can only be called by the lendingPool.
    ///         Note that withdraws don't work when the strategy is paused.
    /// @dev If the strategy fails to recover sufficient funds (defined by `withdrawalMaxDeviationThreshold`),
    ///      the withdrawal would fail so that this unexpected behavior can be investigated.
    /// @param _amount Amount of funds required to be withdrawn.
    function withdraw(uint256 _amount) external override whenNotPaused {
        _onlyVault();
        require(_amount != 0, "Amount 0");

        // Withdraw from strategy positions, typically taking from any idle underlying first.
        uint256 _beforeWithdraw = IERC20(underlying).balanceOf(address(this));
        if (_beforeWithdraw < _amount) {
            _withdrawSome(_amount - _beforeWithdraw);
        }
        uint256 _postWithdraw = IERC20(underlying).balanceOf(address(this));

        // Sanity check: Ensure we were able to retrieve sufficient underlying from strategy positions
        // If we end up with less than the amount requested, make sure it does not deviate beyond a maximum threshold
        if (_postWithdraw < _amount) {
            uint256 diff = _diff(_amount, _postWithdraw);

            // Require that difference between expected and actual values is less than the deviation threshold percentage
            require(
                diff <= (_amount * withdrawalMaxDeviationThreshold) / MAX_BPS,
                "withdraw-exceed-max-deviation-threshold"
            );
        }

        // Return the amount actually withdrawn if less than amount requested
        uint256 _toWithdraw = vStrategyHelper.min(_postWithdraw, _amount);

        // Transfer remaining to Vault to handle withdrawal
        _transferToLendingPool(_toWithdraw);
    }

    // Discussion: https://discord.com/channels/785315893960900629/837083557557305375
    /// @notice Sends balance of any extra token earned by the strategy (from airdrops, donations etc.) to the lendingPool.
    ///         The `_token` should be different from any tokens managed by the strategy.
    ///         This can only be called by the lendingPool.
    /// @dev This is a counterpart to `_processExtraToken`.
    ///      This is for tokens that the strategy didn't expect to receive. Instead of sweeping, we can directly
    ///      emit them via the badgerTree. This saves time while offering security guarantees.
    ///      No address(0) check because _onlyNotProtectedTokens does it.
    ///      This is not a rug vector as it can't use protected tokens.
    /// @param _token Address of the token to be emitted.
    function emitNonProtectedToken(address _token) external override {
        _onlyVault();
        _onlyNotProtectedTokens(_token);
        // TODO: transfer extra rewards to who?
        revert("Extra rewards not implemented");
        // IERC20(_token).transfer(lendingPool, IERC20(_token).balanceOf(address(this)));
        //ILendingPool(lendingPool).reportAdditionalToken(_token); //vault specific code, gives bonus tokens to users
    }

    /// @notice Withdraw the balance of a non-protected token to the lendingPool.
    ///         This can only be called by the lendingPool.
    /// @dev Should only be used in an emergency to sweep any asset.
    ///      This is the version that sends the assets to governance.
    ///      No address(0) check because _onlyNotProtectedTokens does it.
    /// @param _asset Address of the token to be withdrawn.
    function withdrawOther(address _asset) external override {
        _onlyVault();
        _onlyNotProtectedTokens(_asset);
        revert("Extra rewards not implemented");
        // IERC20(_asset).transfer(, IERC20(_asset).balanceOf(address(this)));
    }

    /// ===== Permissioned Actions: Authorized Contract Pausers =====

    /// @notice Pauses the strategy.
    ///         This can be called by either guardian or governance.
    /// @dev Check the `onlyWhenPaused` modifier for functionality that is blocked when pausing
    function pause() external override {
        _onlyAuthorizedPausers();
        _pause();
    }

    /// @notice Unpauses the strategy.
    ///         This can only be called by governance (usually a multisig behind a timelock).
    function unpause() external override {
        _onlyGovernance();
        _unpause();
    }

    /// ===== Internal Helper Functions =====

    /// @notice Transfers `_amount` of underlying to the lendingPool.
    /// @dev Strategy should have idle funds >= `_amount`.
    /// @param _amount Amount of underlying to be transferred to the lendingPool.
    function _transferToLendingPool(uint256 _amount) internal {
        if (_amount > 0) {
            IERC20(underlying).transfer(vToken, _amount);
        }
    }

    /// @notice Report an harvest to the lendingPool.
    /// @param _harvestedAmount Amount of underlying token autocompounded during harvest.
    function _reportToLendingPool(uint256 _harvestedAmount) internal {
        //ILendingPool(lendingPool).reportHarvest(_harvestedAmount);
    }

    /// @notice Sends balance of an additional token (eg. reward token) earned by the strategy to the lendingPool.
    ///         This should usually be called exclusively on protectedTokens.
    ///         Calls `Vault.reportAdditionalToken` to process fees and forward amount to badgerTree to be emitted.
    /// @dev This is how you emit tokens in V1.5
    ///      After calling this function, the tokens are gone, sent to fee receivers and badgerTree
    ///      This is a rug vector as it allows to move funds to the tree
    ///      For this reason, it is recommended to verify the tree is the badgerTree from the registry
    ///      and also check for this to be used exclusively on harvest, exclusively on protectedTokens.
    /// @param _token Address of the token to be emitted.
    /// @param _amount Amount of token to transfer to lendingPool.
    function _processExtraToken(address _token, uint256 _amount) internal {
        require(
            _token != underlying,
            "Not underlying, use _reportToLendingPool"
        );
        require(_token != address(0), "Address 0");
        require(_amount != 0, "Amount 0");

        IERC20(_token).transfer(lendingPool, _amount);
        //ILendingPool(lendingPool).reportAdditionalToken(_token); //vault specific code (?)
    }

    /// @notice Utility function to diff two numbers, expects higher value in first position
    function _diff(uint256 a, uint256 b) internal pure returns (uint256) {
        require(a >= b, "a should be >= b");
        return a - b;
    }

    // ===== Abstract Functions: To be implemented by specific Strategies =====

    /// @dev Internal pull logic to be implemented by a derived strategy.
    /// @param _underlying Amount of underlying token to be pulled into the strategy.
    function _pull(uint256 _underlying) internal virtual;

    /// @notice Checks if a token is not used in yield process.
    /// @param _asset Address of token.
    function _onlyNotProtectedTokens(address _asset) internal view {
        require(!isProtectedToken(_asset), "_onlyNotProtectedTokens");
    }

    /// @notice Gives the list of protected tokens used in the yield process.
    /// @return Array of protected tokens.
    function getProtectedTokens()
        public
        view
        virtual
        returns (address[] memory);

    /// @dev Internal logic for strategy migration. Should exit positions as efficiently as possible.
    function _withdrawAll() internal virtual;

    /// @dev Internal logic for partial withdrawals. Should exit positions as efficiently as possible.
    ///      Should ideally use idle underlying in the strategy before attempting to exit strategy positions.
    /// @param _amount Amount of underlying token to be withdrawn from the strategy.
    /// @return Withdrawn amount from the strategy.
    function _withdrawSome(uint256 _amount) internal virtual returns (uint256);

    /// @notice Realize returns from strategy positions.
    ///         This can only be called by keeper or governance.
    ///         Note that harvests don't work when the strategy is paused.
    /// @dev Returns can be reinvested into positions, or distributed in another fashion.
    /// @return harvested An array of `TokenAmount` containing the address and amount harvested for each token.
    function harvest()
        external
        override
        whenNotPaused
        returns (TokenAmount[] memory harvested)
    {
        //_onlyAuthorizedActors();
        return _harvest();
    }

    /// @dev Virtual function that should be overridden with the logic for harvest.
    ///      Should report any underlying or non-underlying gains to the lendingPool.
    ///      Also see `harvest`.
    function _harvest()
        internal
        virtual
        returns (TokenAmount[] memory harvested);

    /// @notice Tend strategy positions as needed to maximize returns.
    ///         This can only be called by keeper or governance.
    ///         Note that tend doesn't work when the strategy is paused.
    /// @dev Is only called by the keeper when `isTendable` is true.
    /// @return tended An array of `TokenAmount` containing the address and amount tended for each token.
    function tend() external override whenNotPaused returns (TendData memory) {
        //_onlyAuthorizedActors();

        return _tend();
    }

    // function tend() external override whenNotPaused returns (uint256 crvTended,
    //     uint256 cvxTended,
    //     uint256 cvxCrvTended,
    //     uint256 extraRewardsTended) {
    //     //_onlyAuthorizedActors();
    //     TendData memory t = _tend();
    //     crvTended = t.crvTended;
    //     cvxTended = t.cvxTended;
    //     cvxCrvTended = t.cvxCrvTended;
    //     extraRewardsTended = t.extraRewardsTended;
    // }

    /// @dev Virtual function that should be overridden with the logic for tending.
    ///      Also see `tend`.
    function _tend() internal virtual returns (TendData memory);

    /// @notice Fetches the name of the strategy.
    /// @dev Should be user-friendly and easy to read.
    /// @return Name of the strategy.
    function getName() external pure virtual override returns (string memory);

    /// @notice Gives the balance of underlying held in strategy positions.
    /// @return Balance of underlying held in strategy positions.
    function balanceOfPool() public view virtual returns (uint256);

    /// @notice Gives the total amount of pending rewards accrued for each token.
    /// @dev Should take into account all reward tokens.
    /// @return rewards An array of `TokenAmount` containing the address and amount of each reward token.
    function balanceOfRewards()
        external
        view
        virtual
        override
        returns (TokenAmount[] memory rewards);


    /// @notice Mints to treasury aTokens fees and updates liquidity index when tending
    function _updateState(uint256 amount) internal {
        uint256 m = ILendingPool(lendingPool)
            .getReserveData(underlying, tranche)
            .configuration
            .data;
        uint256 scaledAmount = amount.percentMul(
            ReserveConfiguration.getVMEXReserveFactorData(m)
        );


        uint256 userAmount = amount - scaledAmount;
        uint128 prevLiquidityIndex = ILendingPool(lendingPool).getReserveData(underlying, tranche).liquidityIndex;
        uint128 newLiquidityIndex = uint128( (userAmount*WadRayMath.ray())/IAToken(vToken).scaledTotalSupply() ) + prevLiquidityIndex;
        ILendingPool(lendingPool).setReserveDataLI(underlying, tranche, newLiquidityIndex);

        //this needs to be done last to be updated with most recent liquidity index
        IAToken(vToken).mintToVMEXTreasury(
            scaledAmount,
            newLiquidityIndex
        );
    }

    uint256[49] private __gap;
}
