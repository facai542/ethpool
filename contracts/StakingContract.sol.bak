// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingContract is ReentrancyGuard, Ownable, Pausable {
    IERC20 public stakingToken;
    
    // 质押信息结构
    struct StakeInfo {
        uint256 amount;          // 质押数量
        uint256 timestamp;       // 质押时间
        uint256 lastRewardTime;  // 上次奖励时间
        uint256 accumulatedReward; // 累计奖励
        bool isActive;           // 是否活跃
    }
    
    // 用户质押信息
    mapping(address => StakeInfo) public stakes;
    
    // 合约参数
    uint256 public totalStaked;           // 总质押数量
    uint256 public rewardRate = 100;      // 奖励率 (每日1%)
    uint256 public minStakeAmount = 10 * 10**18;  // 最小质押数量 (10 USDT)
    uint256 public maxStakeAmount = 10000 * 10**18; // 最大质押数量 (10000 USDT)
    
    // 时间常量
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant RATE_PRECISION = 10000;
    
    // 事件
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }
    
    // 质押代币
    function stake(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount >= minStakeAmount, "Amount too small");
        require(_amount <= maxStakeAmount, "Amount too large");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // 如果已经有质押，先计算奖励
        if (userStake.isActive) {
            _updateReward(msg.sender);
        }
        
        // 转账代币到合约
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // 更新用户信息
        userStake.amount += _amount;
        userStake.timestamp = block.timestamp;
        userStake.lastRewardTime = block.timestamp;
        userStake.isActive = true;
        
        // 更新总质押量
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }
    
    // 提取质押
    function withdraw(uint256 _amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        require(userStake.amount >= _amount, "Insufficient staked amount");
        
        // 更新奖励
        _updateReward(msg.sender);
        
        // 更新用户信息
        userStake.amount -= _amount;
        totalStaked -= _amount;
        
        // 如果提取完了，设置为非活跃
        if (userStake.amount == 0) {
            userStake.isActive = false;
        }
        
        // 转账代币给用户
        require(stakingToken.transfer(msg.sender, _amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, _amount);
    }
    
    // 领取奖励
    function claimReward() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        
        _updateReward(msg.sender);
        
        uint256 reward = userStake.accumulatedReward;
        require(reward > 0, "No reward to claim");
        
        userStake.accumulatedReward = 0;
        
        // 转账奖励 (需要合约有足够的代币余额)
        require(stakingToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    // 更新奖励
    function _updateReward(address _user) internal {
        StakeInfo storage userStake = stakes[_user];
        
        if (userStake.amount == 0) return;
        
        uint256 timeDiff = block.timestamp - userStake.lastRewardTime;
        uint256 dailyReward = (userStake.amount * rewardRate) / RATE_PRECISION;
        uint256 reward = (dailyReward * timeDiff) / SECONDS_PER_DAY;
        
        userStake.accumulatedReward += reward;
        userStake.lastRewardTime = block.timestamp;
    }
    
    // 查看待领取奖励
    function pendingReward(address _user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        
        if (userStake.amount == 0) return 0;
        
        uint256 timeDiff = block.timestamp - userStake.lastRewardTime;
        uint256 dailyReward = (userStake.amount * rewardRate) / RATE_PRECISION;
        uint256 reward = (dailyReward * timeDiff) / SECONDS_PER_DAY;
        
        return userStake.accumulatedReward + reward;
    }
    
    // 获取用户信息
    function getUserInfo(address _user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 pendingRewards,
        bool isActive
    ) {
        StakeInfo storage userStake = stakes[_user];
        return (
            userStake.amount,
            userStake.timestamp,
            this.pendingReward(_user),
            userStake.isActive
        );
    }
    
    // 管理员功能
    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
    }
    
    function setMinStakeAmount(uint256 _newMin) external onlyOwner {
        minStakeAmount = _newMin;
    }
    
    function setMaxStakeAmount(uint256 _newMax) external onlyOwner {
        maxStakeAmount = _newMax;
    }
    
    // 紧急提取
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        
        uint256 amount = userStake.amount;
        userStake.amount = 0;
        userStake.isActive = false;
        totalStaked -= amount;
        
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit EmergencyWithdraw(msg.sender, amount);
    }
    
    // 暂停/恢复合约
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // 提取合约中的代币 (仅限owner)
    function withdrawContractTokens(uint256 _amount) external onlyOwner {
        require(stakingToken.transfer(owner(), _amount), "Transfer failed");
    }
} 