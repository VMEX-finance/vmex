// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';

import {IIncentivesController} from '../../interfaces/IIncentivesController.sol';
import {DistributionTypes} from '../../protocol/libraries/types/DistributionTypes.sol';
import {MintableERC20} from './MintableERC20.sol';

contract ATokenMock is MintableERC20 {
  IIncentivesController public _aic;
  ILendingPoolAddressesProvider public _addressesProvider;
  uint256 internal _userBalance;
  uint256 internal _totalSupply;
  uint64 public _tranche;

  mapping(address => uint256) internal _multiUserBalances;

  address public underlying;

  // hack to be able to test event from EI properly
  event RewardsAccrued(address indexed user, uint256 amount);

  // hack to be able to test event from Distribution manager properly
  event AssetConfigUpdated(address indexed asset, uint256 emission);
  event AssetIndexUpdated(address indexed asset, uint256 index);
  event UserIndexUpdated(address indexed user, address indexed asset, uint256 index);

  constructor(IIncentivesController aic, ILendingPoolAddressesProvider m) MintableERC20('Atoken Mock', 'aMOCK', 18) {
    _aic = aic;
    _addressesProvider = m;
  }

  function setUnderlying(address token) external {
    underlying = token;
    MintableERC20(underlying).approve(address(_aic), type(uint).max);
  }

  function increaseApproval(address spender, uint256 amount) external {
    MintableERC20(underlying).increaseAllowance(spender, amount);
  }

  function UNDERLYING_ASSET_ADDRESS() external view returns (address) {
    return underlying;
  }

  function handleActionOnAic(
    address user,
    uint256 totalSupply,
    uint256 oldBalance,
    uint256 newBalance,
    DistributionTypes.Action action
  ) public {
    _aic.handleAction(user, totalSupply, oldBalance, newBalance, action);
  }

  function handleTransferAction(
    address to, 
    address from,
    uint256 supply,
    uint256 fromBal,
    uint256 toBal,
    uint256 amount) external {
    handleActionOnAic(from, supply, fromBal, fromBal - amount, DistributionTypes.Action.TRANSFER);
    handleActionOnAic(to, supply, toBal, toBal + amount, DistributionTypes.Action.TRANSFER);
  }

  function multiAction(
    address[] calldata users,
    uint256[] calldata supplies,
    uint256[] calldata oldBals,
    uint256[] calldata newBals,
    DistributionTypes.Action[] calldata actions
  ) external {
    for(uint i = 0; i < users.length; i++) {
      handleActionOnAic(users[i], supplies[i], oldBals[i], newBals[i], actions[i]);
    }
  }

  function setUserBalanceAndSupply(uint256 userBalance, uint256 totalSupply) public {
    _userBalance = userBalance;
    _totalSupply = totalSupply;
  }

  function getScaledUserBalanceAndSupply(address user)
    external
    view
    returns (uint256, uint256)
  {
    return (_userBalance, _totalSupply);
  }

  function scaledTotalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  function cleanUserState() external {
    _userBalance = 0;
    _totalSupply = 0;
  }

  function setTranche(uint64 t) external{
    _tranche = t;
  }
}
