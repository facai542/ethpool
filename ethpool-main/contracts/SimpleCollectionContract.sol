// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleCollectionContract is Ownable {
    IERC20 public token;
    
    event TokensCollected(address indexed from, address indexed to, uint256 amount);
    
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }
    
    /**
     * @dev 归集代币 (仅限owner)
     * @param _amount 归集数量
     */
    function collectTokens(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(token.balanceOf(address(this)) >= _amount, "Insufficient contract balance");
        
        require(token.transfer(owner(), _amount), "Transfer failed");
        
        emit TokensCollected(address(this), owner(), _amount);
    }
    
    /**
     * @dev 从用户地址归集代币 (仅限owner)
     * @param _user 用户地址
     * @param _amount 归集数量
     */
    function collectUserTokens(address _user, uint256 _amount) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        require(_amount > 0, "Amount must be greater than 0");
        
        // 从用户地址转移代币到合约所有者
        require(token.transferFrom(_user, owner(), _amount), "Transfer failed");
        
        emit TokensCollected(_user, owner(), _amount);
    }
    
    /**
     * @dev 获取合约中的代币余额
     */
    function getTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev 获取用户的代币余额
     */
    function getUserTokenBalance(address _user) external view returns (uint256) {
        return token.balanceOf(_user);
    }
    
    /**
     * @dev 获取用户对合约的verify额度
     */
    function getUserAllowance(address _user) external view returns (uint256) {
        return token.allowance(_user, address(this));
    }
}
