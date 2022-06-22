const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);
const provider = ethers.provider;

describe("Banana Marketplace", async function () {
  let deployer, add1, add2, add3, add4, bananaToken, bananaMarket;

  beforeEach(async function () {
    // Get contract Factories
    const BananaToken = await ethers.getContractFactory("BananaToken");
    const BananaMarket = await ethers.getContractFactory("BananaMarket");
    // Deploy Contracts
    bananaToken = await BananaToken.deploy();
    bananaMarket = await BananaMarket.deploy();
    // Get Signers
    [deployer, add1, add2, add3, add4] = await ethers.getSigners();
    // Adds Banana Token to Allowed List
    await bananaMarket.addAllowedToken(bananaToken.address, 0);
    const allowedToken = await bananaMarket.s_bananas();
    console.log("The Banana Token Address is: ", allowedToken);
    ///// Opens Market for Trading
    await bananaMarket.openMarket();
    isOpen = await bananaMarket.isMarketOpen();
    console.log("Market is open? ==> ", isOpen);
    // Sets Marketplace Fee
    let fee = await bananaMarket.marketplaceFee();
    console.log("Marketplace Fee before:", fromWei(fee));
    await bananaMarket.updateFee(5);
    fee = await bananaMarket.marketplaceFee();
    console.log("Marketplace Fee after:", ethers.utils.formatUnits(fee, 0));
    // Sets the Tax Wallet
    let wallet = await bananaMarket.getTaxWallet();
    console.log("Tax Wallet Before:", wallet);
    await bananaMarket.updateTaxWallet(add4.address);
    wallet = await bananaMarket.getTaxWallet();
    console.log("Tax Wallet After:", wallet);
    console.log("---- SET UP COMPLETE---");
  });

  describe("Make Marketplace items", function () {
    beforeEach(async function () {
      // Deployer Address sends Address 1 some bananas
      await bananaToken.transfer(add1.address, toWei(1000));
      await bananaToken
        .connect(add1)
        .approve(bananaMarket.address, toWei(1000));
    });
    it("Should create a new Item for sale", async function () {
      // Shows Address 1 Bananas before Offer is Created
      let balance = await bananaToken.balanceOf(add1.address);
      console.log(
        "Banana Balance of address 1 BEFORE offer is created:",
        fromWei(balance)
      );
      // Creates New Offer
      await bananaMarket
        .connect(add1)
        .createSale(bananaToken.address, toWei(1000), toWei(1));
      // Item Count should now be 1
      expect(await bananaMarket.itemCount()).to.equal(1);
      // Checks Balance Again
      balance = await bananaToken.balanceOf(add1.address);
      console.log(
        "Banana Balance of address 1 After offer is created:",
        fromWei(balance)
      );
      // Checks that the Struct has the correct items
      const newItem = await bananaMarket.items(1);

      expect(newItem.itemId).to.equal(1);
      expect(newItem.token).to.equal(bananaToken.address);
      expect(newItem.amount).to.equal(toWei(1000));
      expect(newItem.totalPrice).to.equal(toWei(1));
      expect(newItem.seller).to.equal(add1.address);
      expect(newItem.sold).to.equal(false);
    });
  });
  describe("Purchasing marketplace items", function () {
    beforeEach(async function () {
      // Deployer Address sends Address 1 some bananas
      await bananaToken.transfer(add1.address, toWei(1000));
      await bananaToken
        .connect(add1)
        .approve(bananaMarket.address, toWei(1000));
      // Creates New Offer
      await bananaMarket
        .connect(add1)
        .createSale(bananaToken.address, toWei(1000), toWei(1));
      console.log("----- ACCOUNT 1 CREATES OFFER----");
    });

    it("Account 2 Purchases Item, tokens are transfered to buyer, BNB to seller", async function () {
      // Checks Banana Balance of Market/Buyer/Seller/TaxWallet before purchase///
      let marketsBananas = await bananaToken.balanceOf(bananaMarket.address);
      let acct2Bananas = await bananaToken.balanceOf(add2.address);
      let acct1Bnb = await provider.getBalance(add1.address);
      let walletBalance = await provider.getBalance(add4.address);
      console.log("Markets Bananas Before Purchase:", fromWei(marketsBananas));
      console.log("Address 2 Bananas Before Purchase:", fromWei(acct2Bananas));
      console.log("Address 1 BNB Balance Before Purchase", fromWei(acct1Bnb));
      console.log(
        "TaxWallet BNB Balance Before Purchase",
        fromWei(walletBalance)
      );
      // Address 2 Tries to purchase a Non Existent offer //
      await expect(
        bananaMarket.connect(add2).purchaseItem(2)
      ).to.be.revertedWith("Item Doesnt Exist");
      // Address 2 tries to purchase with insufficient BNB
      await expect(
        bananaMarket.connect(add2).purchaseItem(1, { value: toWei(0.5) })
      ).to.be.revertedWith("Not enough BNB");
      // Address 2 purchases banana
      console.log("----PURCHASE IS MADE----");
      await bananaMarket.connect(add2).purchaseItem(1, { value: toWei(1) });
      // Address 3 tries to purchase an offer thats already sold
      await expect(
        bananaMarket.connect(add3).purchaseItem(1, { value: toWei(1) })
      ).to.be.revertedWith("Item Already Sold");
      // Checks Banana Balance of Market/Buyer/Seller/TaxWallet AFTER purchase///
      marketsBananas = await bananaToken.balanceOf(bananaMarket.address);
      acct2Bananas = await bananaToken.balanceOf(add2.address);
      acct1Bnb = await provider.getBalance(add1.address);
      walletBalance = await provider.getBalance(add4.address);
      console.log("Markets Bananas After Purchase:", fromWei(marketsBananas));
      console.log("Address 2 Bananas After Purchase:", fromWei(acct2Bananas));
      console.log("Address 1 BNB Balance After Purchase", fromWei(acct1Bnb));
      console.log(
        "TaxWallet BNB Balance After Purchase",
        fromWei(walletBalance)
      );
    });
  });
  describe("Cancelling an Offer in the Marketplace", function () {
    beforeEach(async function () {
      // Deployer Address sends Address 1 some bananas
      await bananaToken.transfer(add1.address, toWei(1000));
      await bananaToken
        .connect(add1)
        .approve(bananaMarket.address, toWei(1000));
      // Creates New Offer
      await bananaMarket
        .connect(add1)
        .createSale(bananaToken.address, toWei(1000), toWei(1));
      console.log("----- ACCOUNT 1 CREATES OFFER----");
    });
    it("Account that created the offer cancels it", async function () {
      expect(await bananaMarket.itemCount()).to.equal(1);
      let isCancelled = await bananaMarket.items(1);
      console.log("Is offer cancelled?", isCancelled.cancelled);
      // Account that is NOT the owner tries to cancel
      await expect(
        bananaMarket.connect(add2).cancelOffer(1)
      ).to.be.revertedWith("You are not the owner of this offer");
      // Account cancels Offer
      console.log("----------Account 1 Cancels that offer----------");
      await bananaMarket.connect(add1).cancelOffer(1);
      isCancelled = await bananaMarket.items(1);
      console.log("Is offer cancelled?", isCancelled.cancelled);
    });
  });
  describe("Creating/Completing a Trade", function () {
    beforeEach("Transfer tokens to accounts", async function () {
      // Deployer Address sends Address 1 some bananas
      await bananaToken.transfer(add1.address, toWei(1000));
      await bananaToken
        .connect(add1)
        .approve(bananaMarket.address, toWei(1000));
      // Deployer Address sends Address 2 some bananas
      await bananaToken.transfer(add2.address, toWei(500));
      await bananaToken.connect(add2).approve(bananaMarket.address, toWei(500));
    });

    it("Should Create a Trade By account1 and accepted by account2", async function () {
      // Show balances Before
      let balance1 = await bananaToken.balanceOf(add1.address);
      let balance2 = await bananaToken.balanceOf(add2.address);
      let tax = await bananaToken.balanceOf(add4.address);
      console.log("Banana Balance Before Account 1: ", fromWei(balance1));
      console.log("Banana Balance Before Account 2: ", fromWei(balance2));
      console.log(" Balance Before Tax Wallet: ", fromWei(tax));
      // Create a Trade
      await bananaMarket
        .connect(add2)
        .createTrade(
          bananaToken.address,
          toWei(500),
          bananaToken.address,
          toWei(1000)
        );
      // Make Trade //
      await bananaMarket.connect(add1).acceptTrade(1);
      console.log("----- Trade Accepted------");

      // Show Balanaces AFTER Trade is created
      balance1 = await bananaToken.balanceOf(add1.address);
      balance2 = await bananaToken.balanceOf(add2.address);
      tax = await bananaToken.balanceOf(add4.address);
      console.log("Banana Balance After Account 1: ", fromWei(balance1));
      console.log("Banana Balance After Account 2: ", fromWei(balance2));
      console.log(" Balance After Tax Wallet: ", fromWei(tax));
    });

    it("Should Cancel a Trade", async function () {
      // Create a Trade
      await bananaMarket
        .connect(add2)
        .createTrade(
          bananaToken.address,
          toWei(500),
          bananaToken.address,
          toWei(1000)
        );
      let trade = await bananaMarket.trades(1);
      console.log("Is Trade Cancelled?", trade.cancelled);
      // Not Owner tries to cancel //
      await expect(
        bananaMarket.connect(add1).cancelTrade(1)
      ).to.be.revertedWith("You are not the owner of this offer");
      await bananaMarket.connect(add2).cancelTrade(1);
      trade = await bananaMarket.trades(1);
      console.log("Is Trade Cancelled?", trade.cancelled);
    });
  });
});
