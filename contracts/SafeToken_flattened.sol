// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

/**
 * @title SafeMath
 * @dev 安全数学运算库，防止溢出
 */
library SafeMath {
    /**
     * @dev 返回两个数字的加法，如果溢出则回滚。
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    /**
     * @dev 返回两个数字的减法，如果溢出则回滚。
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    /**
     * @dev 返回两个数字的乘法，如果溢出则回滚。
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    /**
     * @dev 返回两个数字的除法，如果除以0则回滚。
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }
}

/**
 * @title Context
 * @dev 提供有关当前执行上下文的信息
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @title Ownable
 * @dev 实现所有权功能的合约
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev 初始化合约，将部署者设为所有者
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev 返回当前所有者
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev 只允许所有者调用的修饰符
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev 放弃所有权，将所有者设为零地址
     * 注意：一旦放弃，所有权将无法恢复
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev 将所有权转移到新地址
     * @param newOwner 新所有者的地址
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev 转移所有权的内部函数
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title IERC20
 * @dev ERC20标准接口
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeToken
 * @dev 安全代币实现，具有基本功能和保护措施
 */
contract SafeToken is Context, IERC20, Ownable {
    using SafeMath for uint256;

    // 代币基本信息
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalSupply;

    // 余额和verify映射
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // 交易费用设置
    uint256 public transactionFeePercent = 0; // 默认无交易费
    address public feeCollector;
    
    // 黑名单功能
    mapping(address => bool) private _blacklist;
    
    // 交易控制
    bool public tradingEnabled = true;

    /**
     * @dev 构造函数
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address initialHolder_
    ) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        
        // 将初始供应量铸造给指定地址
        address recipient = initialHolder_ == address(0) ? _msgSender() : initialHolder_;
        _mint(recipient, initialSupply_ * 10**decimals_);
        
        // 设置费用接收地址
        feeCollector = _msgSender();
    }

    /**
     * @dev 返回代币名称
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev 返回代币符号
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev 返回代币小数位数
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @dev 返回代币总供应量
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev 返回账户余额
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev 转账函数
     */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev 返回verify额度
     */
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev verify函数
     */
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev 从授权地址转账
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }
        
        return true;
    }

    /**
     * @dev 增加verify额度
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    /**
     * @dev 减少verify额度
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        _approve(_msgSender(), spender, currentAllowance.sub(subtractedValue));
        return true;
    }

    /**
     * @dev 内部转账函数
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(!_blacklist[sender], "ERC20: sender is blacklisted");
        require(!_blacklist[recipient], "ERC20: recipient is blacklisted");
        require(tradingEnabled || sender == owner() || recipient == owner(), "Trading is currently disabled");
        
        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        // 计算交易费用
        uint256 fee = 0;
        if (transactionFeePercent > 0 && sender != owner() && recipient != owner() && feeCollector != address(0)) {
            fee = amount.mul(transactionFeePercent).div(10000); // 基于10000的百分比
        }
        
        uint256 receivedAmount = amount.sub(fee);
        
        _balances[sender] = senderBalance.sub(amount);
        _balances[recipient] = _balances[recipient].add(receivedAmount);
        
        emit Transfer(sender, recipient, receivedAmount);
        
        // 处理费用
        if (fee > 0) {
            _balances[feeCollector] = _balances[feeCollector].add(fee);
            emit Transfer(sender, feeCollector, fee);
        }

        _afterTokenTransfer(sender, recipient, amount);
    }

    /**
     * @dev 内部铸造函数
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev 内部销毁函数
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        _balances[account] = accountBalance.sub(amount);
        _totalSupply = _totalSupply.sub(amount);

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev 内部verify函数
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev 转账前钩子函数
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /**
     * @dev 转账后钩子函数
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    // 管理功能

    /**
     * @dev 设置交易费用百分比
     * @param newFeePercent 新的费用百分比（基于10000）
     */
    function setTransactionFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%"); // 最大10%
        transactionFeePercent = newFeePercent;
    }

    /**
     * @dev 设置费用接收地址
     */
    function setFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "Fee collector cannot be zero address");
        feeCollector = newFeeCollector;
    }

    /**
     * @dev 添加/移除黑名单地址
     */
    function setBlacklist(address account, bool blacklisted) external onlyOwner {
        _blacklist[account] = blacklisted;
    }

    /**
     * @dev 启用/禁用交易
     */
    function setTradingEnabled(bool enabled) external onlyOwner {
        tradingEnabled = enabled;
    }

    /**
     * @dev 铸造新代币（仅限所有者）
     */
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    /**
     * @dev 销毁代币（仅限所有者）
     */
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    /**
     * @dev 紧急提取任何意外发送到合约的代币
     */
    function rescueTokens(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    /**
     * @dev 提取合约中的BNB
     */
    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // 接收BNB的回退函数
    receive() external payable {}
} 