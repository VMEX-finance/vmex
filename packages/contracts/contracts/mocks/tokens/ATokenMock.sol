// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {IIncentivesController} from '../../interfaces/IIncentivesController.sol';
import {DistributionTypes} from '../../protocol/libraries/types/DistributionTypes.sol';
import {MintableERC20} from './MintableERC20.sol';

contract ATokenMock is MintableERC20 {
  IIncentivesController public _aic;
  uint256 internal _userBalance;
  uint256 internal _totalSupply;

  // hack to be able to test event from EI properly
  event RewardsAccrued(address indexed user, uint256 amount);

  // hack to be able to test event from Distribution manager properly
  event AssetConfigUpdated(address indexed asset, uint256 emission);
  event AssetIndexUpdated(address indexed asset, uint256 index);
  event UserIndexUpdated(address indexed user, address indexed asset, uint256 index);

  constructor(IIncentivesController aic) MintableERC20('Atoken Mock', 'aMOCK', 18) {
    _aic = aic;
  }

  function handleActionOnAic(
    address user,
    uint256 oldBalance,
    uint256 totalSupply,
    uint256 newBalance,
    DistributionTypes.Action action
  ) external {
    _aic.handleAction(user, totalSupply, oldBalance, newBalance, action);
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
}
