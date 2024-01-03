// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceCalculator {
    function getPriceFeedRate(
        AggregatorV3Interface priceFeed
    ) private view returns (uint256) {
        (, int answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer * 1e10);
    }

    function getParticipationEthPrice(
        uint256 doller,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPriceFeedRate(priceFeed);
        uint256 dollerPrice = doller * 1e18;
        return (dollerPrice * 1e18) / ethPrice;
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPriceFeedRate(priceFeed);
        return (ethPrice * ethAmount) / 1e18;
    }
}
