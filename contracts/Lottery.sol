// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./library/PriceCalculator.sol";

contract Lottery {
    using PriceCalculator for uint256;
    uint256 private immutable i_ticket_value;
    AggregatorV3Interface private immutable priceFeed;

    constructor(uint256 ticketValue, address priceFeedAdress) {
        i_ticket_value = ticketValue;
        priceFeed = AggregatorV3Interface(priceFeedAdress);
    }

    function Enter_Lottery() public payable {
        
    }

    function ticketValuePrice() public view returns (uint256) {
        return i_ticket_value;
    }
}
