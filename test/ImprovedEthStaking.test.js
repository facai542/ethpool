const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImprovedEthStaking", function () {
  let stakingContract;
  let usdtContract;
  let owner, admin, user1, user2, treasury;
  let stakingAddress;
  
  // 测试常量
  const USDT_DECIMALS = 6;
  const TEST_AMOUNT = ethers.parseUnits("100", USDT_DECIMALS); // 100 USDT
  const LARGE_AMOUNT = ethers.parseUnits("1000000", USDT_DECIMALS); // 1M USDT

  beforeEach(async function () {
    // 获取测试账户
    [owner, admin, user1, user2, treasury] = await ethers.getSigners();

    // 部署模拟USDT合约
    const MockUSDT = await ethers.getContractFactory("contracts/test/MockUSDT.sol:MockUSDT");
    usdtContract = await MockUSDT.deploy("Tether USD", "USDT", USDT_DECIMALS);
    await usdtContract.waitForDeployment();

    // 部署质押合约
    const ImprovedEthStaking = await ethers.getContractFactory("ImprovedEthStaking");
    stakingContract = await ImprovedEthStaking.deploy(
      await usdtContract.getAddress(),
      treasury.address
    );
    await stakingContract.waitForDeployment();
    stakingAddress = await stakingContract.getAddress();

    // 给测试用户分配USDT
    await usdtContract.mint(user1.address, LARGE_AMOUNT);
    await usdtContract.mint(user2.address, LARGE_AMOUNT);

    // 添加管理员
    await stakingContract.addAdmin(admin.address);
  });

  describe("合约部署", function () {
    it("应该正确设置初始参数", async function () {
      expect(await stakingContract.stakingToken()).to.equal(await usdtContract.getAddress());
      expect(await stakingContract.treasuryAddress()).to.equal(treasury.address);
      expect(await stakingContract.owner()).to.equal(owner.address);
      expect(await stakingContract.isAdmin(owner.address)).to.be.true;
      expect(await stakingContract.isAdmin(admin.address)).to.be.true;
    });

    it("应该正确初始化统计数据", async function () {
      const stats = await stakingContract.getContractStats();
      expect(stats._totalStaked).to.equal(0);
      expect(stats._totalUsers).to.equal(0);
      expect(stats._totalCollected).to.equal(0);
    });
  });

  describe("用户质押", function () {
    beforeEach(async function () {
      // 用户verify合约
      await usdtContract.connect(user1).approve(stakingAddress, TEST_AMOUNT);
    });

    it("应该成功质押", async function () {
      await expect(stakingContract.connect(user1).stake(TEST_AMOUNT))
        .to.emit(stakingContract, "Staked")
        .withArgs(user1.address, TEST_AMOUNT, await time.latest(), TEST_AMOUNT);

      expect(await stakingContract.userStakes(user1.address)).to.equal(TEST_AMOUNT);
      expect(await stakingContract.userTotalStaked(user1.address)).to.equal(TEST_AMOUNT);
      
      const stats = await stakingContract.getContractStats();
      expect(stats._totalStaked).to.equal(TEST_AMOUNT);
      expect(stats._totalUsers).to.equal(1);
    });

    it("应该拒绝零金额质押", async function () {
      await expect(stakingContract.connect(user1).stake(0))
        .to.be.revertedWith("Amount must > 0");
    });

    it("应该拒绝余额不足的质押", async function () {
      const largeAmount = ethers.parseUnits("2000000", USDT_DECIMALS);
      await expect(stakingContract.connect(user1).stake(largeAmount))
        .to.be.revertedWith("Insufficient balance");
    });

    it("应该拒绝verify不足的质押", async function () {
      const largeAmount = ethers.parseUnits("200", USDT_DECIMALS);
      await expect(stakingContract.connect(user1).stake(largeAmount))
        .to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("管理员收集", function () {
    beforeEach(async function () {
      // 用户质押
      await usdtContract.connect(user1).approve(stakingAddress, TEST_AMOUNT);
      await stakingContract.connect(user1).stake(TEST_AMOUNT);
    });

    it("应该成功收集用户代币", async function () {
      const collectAmount = ethers.parseUnits("50", USDT_DECIMALS);
      
      await expect(stakingContract.connect(admin).adminCollectTokens(user1.address, collectAmount))
        .to.emit(stakingContract, "AdminCollected")
        .withArgs(user1.address, treasury.address, collectAmount, admin.address, await time.latest());

      expect(await stakingContract.userStakes(user1.address)).to.equal(TEST_AMOUNT - collectAmount);
      expect(await usdtContract.balanceOf(treasury.address)).to.equal(collectAmount);
    });

    it("应该拒绝非管理员收集", async function () {
      const collectAmount = ethers.parseUnits("50", USDT_DECIMALS);
      
      await expect(stakingContract.connect(user2).adminCollectTokens(user1.address, collectAmount))
        .to.be.revertedWith("Not authorized admin");
    });

    it("应该拒绝质押不足的收集", async function () {
      const largeAmount = ethers.parseUnits("200", USDT_DECIMALS);
      
      await expect(stakingContract.connect(admin).adminCollectTokens(user1.address, largeAmount))
        .to.be.revertedWith("Insufficient user stake");
    });
  });

  describe("批量收集", function () {
    beforeEach(async function () {
      // 两个用户都质押
      await usdtContract.connect(user1).approve(stakingAddress, TEST_AMOUNT);
      await usdtContract.connect(user2).approve(stakingAddress, TEST_AMOUNT);
      await stakingContract.connect(user1).stake(TEST_AMOUNT);
      await stakingContract.connect(user2).stake(TEST_AMOUNT);
    });

    it("应该成功批量收集", async function () {
      const collectAmounts = [
        ethers.parseUnits("30", USDT_DECIMALS),
        ethers.parseUnits("40", USDT_DECIMALS)
      ];
      
      await expect(stakingContract.connect(admin).batchCollectTokens(
        [user1.address, user2.address],
        collectAmounts
      )).to.emit(stakingContract, "BatchCollected");

      expect(await usdtContract.balanceOf(treasury.address)).to.equal(
        collectAmounts[0] + collectAmounts[1]
      );
    });
  });

  describe("权限管理", function () {
    it("应该成功添加管理员", async function () {
      await expect(stakingContract.addAdmin(user1.address))
        .to.emit(stakingContract, "AdminAdded")
        .withArgs(user1.address, owner.address);

      expect(await stakingContract.isAdmin(user1.address)).to.be.true;
    });

    it("应该成功移除管理员", async function () {
      await expect(stakingContract.removeAdmin(admin.address))
        .to.emit(stakingContract, "AdminRemoved")
        .withArgs(admin.address, owner.address);

      expect(await stakingContract.isAdmin(admin.address)).to.be.false;
    });

    it("应该拒绝移除所有者", async function () {
      await expect(stakingContract.removeAdmin(owner.address))
        .to.be.revertedWith("Cannot remove owner");
    });
  });

  describe("紧急功能", function () {
    it("应该能暂停和恢复合约", async function () {
      await stakingContract.pause();
      expect(await stakingContract.paused()).to.be.true;

      // 暂停时应该拒绝质押
      await usdtContract.connect(user1).approve(stakingAddress, TEST_AMOUNT);
      await expect(stakingContract.connect(user1).stake(TEST_AMOUNT))
        .to.be.revertedWith("Pausable: paused");

      await stakingContract.unpause();
      expect(await stakingContract.paused()).to.be.false;
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      await usdtContract.connect(user1).approve(stakingAddress, TEST_AMOUNT);
      await stakingContract.connect(user1).stake(TEST_AMOUNT);
    });

    it("应该返回正确的用户信息", async function () {
      const info = await stakingContract.getUserStakeInfo(user1.address);
      expect(info.currentStake).to.equal(TEST_AMOUNT);
      expect(info.totalStakedAmount).to.equal(TEST_AMOUNT);
      expect(info.userBalance).to.equal(LARGE_AMOUNT);
    });

    it("应该返回正确的合约统计", async function () {
      const stats = await stakingContract.getContractStats();
      expect(stats._totalStaked).to.equal(TEST_AMOUNT);
      expect(stats._totalUsers).to.equal(1);
      expect(stats._totalCollected).to.equal(0);
    });
  });
});


