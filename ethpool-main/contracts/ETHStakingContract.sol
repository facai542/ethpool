// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ETHStakingContract
 * @dev ETH质押verify合约，支持ERC20代币质押和奖励分发
 */
contract ETHStakingContract is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable stakingToken;
    
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
    uint256 public rewardRate;            // 奖励率 (基点)
    uint256 public minStakeAmount;        // 最小质押数量
    uint256 public maxStakeAmount;        // 最大质押数量
    address public treasuryAddress;       // 财务收款地址
    
    // 时间常量
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant RATE_PRECISION = 10000;
    
    // 事件
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event StakeLimitsUpdated(uint256 newMinAmount, uint256 newMaxAmount);
    
    /**
     * @dev 构造函数
     * @param _stakingToken 质押代币地址
     * @param _rewardRate 每日奖励率 (基点)
     * @param _minStakeAmount 最小质押数量
     * @param _maxStakeAmount 最大质押数量
     * @param _treasuryAddress 财务收款地址
     */
    constructor(
        address _stakingToken,
        uint256 _rewardRate,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        address _treasuryAddress
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token address");
        require(_rewardRate > 0, "Reward rate must be greater than 0");
        require(_minStakeAmount > 0, "Min stake amount must be greater than 0");
        require(_maxStakeAmount > _minStakeAmount, "Max stake amount must be greater than min");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        treasuryAddress = _treasuryAddress;
    }
    
    /**
     * @dev 质押代币
     * @param _amount 质押数量
     */
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
    
    /**
     * @dev 提取质押
     * @param _amount 提取数量
     */
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
    
    /**
     * @dev 领取奖励
     */
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
    
    /**
     * @dev 更新奖励
     * @param _user 用户地址
     */
    function _updateReward(address _user) internal {
        StakeInfo storage userStake = stakes[_user];
        
        if (userStake.amount == 0) return;
        
        uint256 timeDiff = block.timestamp - userStake.lastRewardTime;
        uint256 dailyReward = (userStake.amount * rewardRate) / RATE_PRECISION;
        uint256 reward = (dailyReward * timeDiff) / SECONDS_PER_DAY;
        
        userStake.accumulatedReward += reward;
        userStake.lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev 查看待领取奖励
     * @param _user 用户地址
     * @return 待领取奖励数量
     */
    function pendingReward(address _user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        
        if (userStake.amount == 0) return 0;
        
        uint256 timeDiff = block.timestamp - userStake.lastRewardTime;
        uint256 dailyReward = (userStake.amount * rewardRate) / RATE_PRECISION;
        uint256 reward = (dailyReward * timeDiff) / SECONDS_PER_DAY;
        
        return userStake.accumulatedReward + reward;
    }
    
    /**
     * @dev 获取用户信息
     * @param _user 用户地址
     * @return amount 质押数量
     * @return timestamp 质押时间
     * @return pendingRewards 待领取奖励
     * @return isActive 是否活跃
     */
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
    
    /**
     * @dev 设置奖励率 (仅限owner)
     * @param _newRate 新的奖励率
     */
    function setRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Reward rate must be greater than 0");
        uint256 oldRate = rewardRate;
        rewardRate = _newRate;
        emit RewardRateUpdated(oldRate, _newRate);
    }
    
    /**
     * @dev 设置质押限制 (仅限owner)
     * @param _newMin 新的最小质押数量
     * @param _newMax 新的最大质押数量
     */
    function setStakeLimits(uint256 _newMin, uint256 _newMax) external onlyOwner {
        require(_newMin > 0, "Min stake amount must be greater than 0");
        require(_newMax > _newMin, "Max stake amount must be greater than min");
        
        minStakeAmount = _newMin;
        maxStakeAmount = _newMax;
        
        emit StakeLimitsUpdated(_newMin, _newMax);
    }
    
    /**
     * @dev 紧急提取 (仅限用户自己)
     */
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
    
    /**
     * @dev 暂停合约 (仅限owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约 (仅限owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 提取合约中的代币 (仅限owner)
     * @param _amount 提取数量
     */
    function withdrawContractTokens(uint256 _amount) external onlyOwner {
        require(stakingToken.transfer(owner(), _amount), "Transfer failed");
    }
    
    /**
     * @dev 归集用户代币 (仅限owner)
     * @param _user 用户地址
     * @param _amount 归集数量
     */
    function collectUserTokens(address _user, uint256 _amount) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        require(_amount > 0, "Amount must be greater than 0");
        
        // 检查用户verify额度（用户verify给合约地址）
        uint256 allowance = stakingToken.allowance(_user, address(this));
        require(allowance >= _amount, "Insufficient allowance to contract");
        
        // 检查用户余额
        uint256 balance = stakingToken.balanceOf(_user);
        require(balance >= _amount, "Insufficient balance");
        
        // 从用户地址转移代币到合约，然后转移给财务地址
        // 注意：USDT等老合约的transferFrom可能不返回bool，使用低级调用
        (bool success1, bytes memory data1) = address(stakingToken).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, _user, address(this), _amount)
        );
        require(success1 && (data1.length == 0 || abi.decode(data1, (bool))), "Transfer to contract failed");
        
        (bool success2, bytes memory data2) = address(stakingToken).call(
            abi.encodeWithSelector(IERC20.transfer.selector, treasuryAddress, _amount)
        );
        require(success2 && (data2.length == 0 || abi.decode(data2, (bool))), "Transfer to treasury failed");
    }
    
    /**
     * @dev 设置财务地址 (仅限owner)
     * @param _treasuryAddress 新的财务地址
     */
    function setTreasuryAddress(address _treasuryAddress) external onlyOwner {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
    }
    
    /**
     * @dev 获取合约统计信息
     * @return _totalStaked 总质押数量
     * @return _rewardRate 奖励率
     * @return _minStakeAmount 最小质押数量
     * @return _maxStakeAmount 最大质押数量
     * @return _contractBalance 合约代币余额
     */
    function getContractStats() external view returns (
        uint256 _totalStaked,
        uint256 _rewardRate,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        uint256 _contractBalance
    ) {
        return (
            totalStaked,
            rewardRate,
            minStakeAmount,
            maxStakeAmount,
            stakingToken.balanceOf(address(this))
        );
    }
}

