//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract BananaToken is ERC20{
    constructor() ERC20("Bananas", "BANANA"){
         _mint(msg.sender, 10000000 * 10 ** decimals());
    }
}

