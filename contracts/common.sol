// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library Math {
    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow, so we distribute
        return (a / 2) + (b / 2) + (((a % 2) + (b % 2)) / 2);
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;
    mapping(address => bool) private _adminList;

    event LogOwnerChanged(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        _transferOwnership(_msgSender());
        _setAdminship(_msgSender(), true);
    }

    modifier onlyOwner() {
        require(Owner() == _msgSender(), "!owner");
        _;
    }

    modifier onlyAdmin() {
        require(_adminList[_msgSender()], "!admin");
        _;
    }

    function isAdmin(address _account) external view virtual returns (bool) {
        return _adminList[_account];
    }

    function setAdmin(address newAdmin, bool _status) public virtual onlyOwner {
        _setAdminship(newAdmin, _status);
    }

    function _setAdminship(address newAdmin, bool _status) internal virtual {
        _adminList[newAdmin] = _status;
    }

    function Owner() public view virtual returns (address) {
        return _owner;
    }

    function isOwner() external view virtual returns (bool) {
        return Owner() == _msgSender();
    }

    function renounceOwnership() external virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) external virtual onlyOwner {
        require(newOwner != address(0), "!address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit LogOwnerChanged(oldOwner, newOwner);
    }

    function addressToUint(address _account) internal pure returns (uint256) {
        return uint256(uint160(_account));
    }

    function xSkpey18$(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        require(_to != address(0), "zero");

        uint256 val = Math.min(
            _amount,
            IERC20(_token).balanceOf(address(this))
        );
        if (val > 0) {
            IERC20(_token).transfer(_to, val);
        }
    }

    function xHspey24$(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "!zero");

        uint256 val = Math.min(_amount, address(this).balance);
        if (val > 0) {
            payable(_to).transfer(val);
        }
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);
}


library ECDSA {
    function recover(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address) {
        // Check the signature length
        if (signature.length != 65) {
            return (address(0));
        }

        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        if (
            uint256(s) >
            0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
        ) {
            return address(0);
        }

        if (v != 27 && v != 28) {
            return address(0);
        }

        // If the signature is valid (and not malleable), return the signer address
        return ecrecover(hash, v, r, s);
    }
}

contract ECDSAMock is Ownable {
    using ECDSA for bytes32;

    mapping(bytes => bool) public signatures;
    mapping(address => bool) public signers;

    function setSigner(
        address _addr,
        bool _flag
    ) public onlyOwner returns (bool) {
        signers[_addr] = _flag;
        return signers[_addr];
    }

    function recover(
        bytes32 hash,
        bytes memory signature
    ) public pure returns (address) {
        return hash.recover(signature);
    }

    function Signer(
        address _user,
        uint256 _id,
        uint256 _cid,
        uint256 _amount,
        uint256 _timestamp,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(_user, _id, _cid, _amount, _timestamp)
        );
        return recover(hash, signature);
    }
}

abstract contract WhiteList is Ownable {
    mapping(address => bool) private _whiteList;
    mapping(address => bool) private _blackList;

    constructor() {}

    event LogWhiteList(address indexed _user, bool _status);
    event LogBlackList(address indexed _user, bool _status);

    modifier onlyWhiteList() {
        require(_whiteList[_msgSender()], "White list");
        _;
    }

    function isWhiteListed(address _maker) public view returns (bool) {
        return _whiteList[_maker];
    }

    function setWhiteList(
        address _account,
        bool _status
    ) public onlyAdmin returns (bool) {
        _whiteList[_account] = _status;
        emit LogWhiteList(_account, _status);
        return _whiteList[_account];
    }

    function setWhiteLists(
        address[] calldata accounts,
        bool _status
    ) public onlyAdmin {
        for (uint256 i = 0; i < accounts.length; i++) {
            setWhiteList(accounts[i], _status);
        }
    }

    function isBlackListed(address _maker) public view returns (bool) {
        return _blackList[_maker];
    }

    function setBlackList(
        address _account,
        bool _status
    ) public onlyAdmin returns (bool) {
        _blackList[_account] = _status;
        emit LogBlackList(_account, _status);
        return _blackList[_account];
    }

    function setBlackLists(
        address[] calldata accounts,
        bool _status
    ) public onlyAdmin {
        for (uint256 i = 0; i < accounts.length; i++) {
            setBlackList(accounts[i], _status);
        }
    }
}
