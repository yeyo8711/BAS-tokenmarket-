/*
echo "########  #### ########  ########  ##    ##  ######     ##     ##    ###    ########  ##    ## ######## ######## ";
echo "##     ##  ##  ##     ## ##     ##  ##  ##  ##    ##    ###   ###   ## ##   ##     ## ##   ##  ##          ##    ";
echo "##     ##  ##  ##     ## ##     ##   ####   ##          #### ####  ##   ##  ##     ## ##  ##   ##          ##    ";
echo "##     ##  ##  ########  ########     ##     ######     ## ### ## ##     ## ########  #####    ######      ##    ";
echo "##     ##  ##  ##        ##           ##          ##    ##     ## ######### ##   ##   ##  ##   ##          ##    ";
echo "##     ##  ##  ##        ##           ##    ##    ##    ##     ## ##     ## ##    ##  ##   ##  ##          ##    ";
echo "########  #### ##        ##           ##     ######     ##     ## ##     ## ##     ## ##    ## ########    ##    ";
 */


//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BananaMarket is  Ownable, ReentrancyGuard{
    // Accepted Tokens //
    IERC20 public s_bananas;
    IERC20 public s_juice;
    IERC20 public s_rocks;
    IERC20 public s_essence;
    IERC20 public s_lootbox;

    // State Variables
    bool public isMarketOpen;
    uint256 public itemCount;
    uint256 public tradeCount;
    uint256 public marketplaceFee;
    address payable taxWallet;

    struct Item {
        uint256 itemId;
        IERC20 token;
        uint256 amount;
        uint256 totalPrice;
        address payable seller;
        bool sold;
        bool cancelled;
    }

    struct Trade {
         uint256 itemId;
        IERC20 token;
        uint256 amount;
        IERC20 swappedFor;
        uint256 swappedForAmount;
        address payable seller;
        bool sold;
        bool cancelled;
    }
    mapping(uint256 => Item) public items;
    mapping(uint256 => Trade) public trades;

    // Events // 
    //// Sales ///
    event SaleCreated(uint256 itemId, address indexed token, uint256 amount, uint256 indexed price, address indexed seller );
    event SaleComplete(uint256 indexed itemId, address token, uint256 amount, uint256 price, address indexed seller, bool indexed sold, bool cancelled);
    //// Trades ////
    event TradeCreated(uint256 itemId, address indexed token, uint256 amount, address swappedFor, uint256 indexed swappedForAmount, address indexed seller );
    event TradeComplete(uint256  itemId, address token, uint256 amount, address swappedFor, uint256 indexed swappedForAmount, address indexed seller, bool indexed sold, bool cancelled );

    constructor(){}

    ////// Token / Market Management ///
    function addAllowedToken(IERC20 _address, uint256 _token) public onlyOwner { 
        if(_token == 0) s_bananas = _address;
        if(_token == 1) s_rocks = _address;  
        if(_token == 2) s_essence = _address; 
        if(_token == 3) s_juice = _address;
        if(_token == 4) s_lootbox = _address;  
    }
    function openMarket() onlyOwner external{
        isMarketOpen = !isMarketOpen;
    }
    function updateFee(uint256 _newFee)public onlyOwner{
        marketplaceFee = _newFee;
    }
    function updateTaxWallet(address _address) public onlyOwner{
        taxWallet = payable(_address);
    }
    ///-------- OFFERS ------//
    ////// Create Offers /////
    function createSale(IERC20 _token, uint256 _amount, uint256 _price) nonReentrant public{
        // Require that trading is enabled and token is valid
        require(isMarketOpen, "Trading not enabled");
        require(_price > 0, "Price must be greater than 0");
        require(_amount > 0, "Amount must be greater than 0");
        require(_token == s_bananas || _token == s_essence || _token == s_juice || _token == s_rocks);
        // Increment Count
        itemCount++;
        // Transfer token to contract
        _token.transferFrom(msg.sender, address(this), _amount );
        // Add new item to Mapping
        items[itemCount] = Item (
            itemCount,
            _token,
            _amount,
            _price,
             payable(msg.sender),
             false, 
             false
       );
       emit SaleCreated(itemCount, address(_token), _amount, _price, msg.sender );
    }

    ////// Make a Purchase /////
    function purchaseItem(uint256 _itemId) external payable nonReentrant{
        require(isMarketOpen, "Trading not enabled");
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item Doesnt Exist");
        require(msg.value >= item.totalPrice, "Not enough BNB");
        require(!item.sold, "Item Already Sold");
        // Update Sold Item
        item.sold = true;
        // Send Tax to Wallet
        uint256 fee = getSaleTax(item.totalPrice);
        taxWallet.transfer(fee);
        // Send seller his BNB
        address seller = item.seller;
        payable(seller).transfer(item.totalPrice - fee);
        // Send Buyer his Tokens
        item.token.transfer(msg.sender, item.amount);
        // Emit Purchased Event
        emit SaleComplete(item.itemId, address(item.token), item.amount, item.totalPrice, address(item.seller), true, false);
    }

    ////// Cancel an offer /////
    function cancelOffer(uint256 _itemId) public  nonReentrant{
        // Checks that owner is calling function
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item Doesnt Exist");
        require(item.seller == msg.sender, "You are not the owner of this offer");
        require(item.cancelled == false, "This offer is already cancelled");
        // Changes booleans 
        item.cancelled = true;
        item.sold = true;
        // Sends back token to seller
        item.token.transfer( msg.sender, item.amount);
        // Emit Cancelled Event
        emit SaleComplete(item.itemId, address(item.token), item.amount, item.totalPrice, address(item.seller), true, true);
        
    }

    //----------- Trades ----------------//
    ////// Create Trade /////
    function createTrade(IERC20 _token, uint256 _amount,IERC20 _swappedFor, uint256 _swappedForAmount) nonReentrant public{
        // Require that trading is enabled and token is valid
        require(isMarketOpen, "Trading not enabled");
        require(_amount > 0, "Amount must be greater than 0");
        require(_swappedForAmount > 0, "Amount must be greater than 0");
        require(_token == s_bananas || _token == s_essence || _token == s_juice || _token == s_rocks);
        require(_swappedFor == s_bananas || _swappedFor == s_essence || _swappedFor == s_juice || _swappedFor == s_rocks);
        // Increment Count
        tradeCount++;
        // Transfer token to contract
        _token.transferFrom(msg.sender, address(this), _amount );
        // Add new item to Mapping
        trades[tradeCount] = Trade (
            tradeCount,
            _token,
            _amount,
            _swappedFor,
            _swappedForAmount,
             payable(msg.sender),
             false, 
             false
       );
       emit TradeCreated(tradeCount, address(_token), _amount, address(_swappedFor), _swappedForAmount, msg.sender );
    }
    ////// Complete a Trade/////
    function acceptTrade(uint256 _itemId) external  nonReentrant{
        require(isMarketOpen, "Trading not enabled");
        Trade storage trade = trades[_itemId];
        require(_itemId > 0 && _itemId <= tradeCount, "Trade Doesnt Exist");
        require(trade.swappedFor.balanceOf(msg.sender) >= trade.swappedForAmount, "Insufficient Balance");
        require(!trade.sold, "Item Already Traded");
        // Update Sold Item
        trade.sold = true;
        // Send Tax to Wallet
        uint256 fee = getTradeTax(trade.amount);
        trade.token.transfer(taxWallet, fee);
        trade.swappedFor.transferFrom(msg.sender, taxWallet, fee);
        // Make the trade
        address seller = trade.seller;
        trade.token.transfer(payable(msg.sender), trade.amount - fee);
        trade.swappedFor.transferFrom(msg.sender, payable(seller), trade.swappedForAmount - fee);
        // Emit Purchased Event
        emit TradeComplete(trade.itemId, address(trade.token), trade.amount, address(trade.swappedFor), trade.swappedForAmount,  address(trade.seller), true, false);
    }

    ////// Cancel A Trade /////
    function cancelTrade(uint256 _itemId) public  nonReentrant{
        // Checks that owner is calling function
        Trade storage trade = trades[_itemId];
        require(_itemId > 0 && _itemId <= tradeCount, "Item Doesnt Exist");
        require(trade.seller == msg.sender, "You are not the owner of this offer");
        require(trade.cancelled == false, "Trade already cancelled");
        // Changes booleans 
        trade.cancelled = true;
        trade.sold = true;
        // Sends back token to seller
        trade.token.transfer( msg.sender, trade.amount);
        // Emit Cancelled Event
        emit TradeComplete(trade.itemId, address(trade.token), trade.amount, address(trade.swappedFor), trade.swappedForAmount,  address(trade.seller), true, true);
    }





    /********************/
    /* Getter Functions */
    /********************/
    
    function getTaxWallet() external view returns(address){
        return taxWallet;
    }
    /********************/
    /* Helper Functions */
    /********************/
    function getSaleTax(uint256 _price) internal view returns(uint256){
        return _price * marketplaceFee / 100;
    }
    function getTradeTax(uint256 _price) internal view returns(uint256){
        return ( _price * marketplaceFee / 100) /2;
    }

}
