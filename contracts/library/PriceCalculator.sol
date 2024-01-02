// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

library PriceCalculator {
    function getPriceFeedRate(
        AggregatorV3Interface priceFeed
    ) private view returns (uint256) {
        (, int answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer * 1e18);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPriceFeedRate(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
