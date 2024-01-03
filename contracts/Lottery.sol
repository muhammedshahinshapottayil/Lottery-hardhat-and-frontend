// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "./library/PriceCalculator.sol";

error Doesnt__Match__Required__Eth();
error Maximum__Contribution__Limits__Five();

contract Lottery is VRFConsumerBaseV2 {
    using PriceCalculator for uint256;
    event Evt__Participants__Name(address indexed participantAddress);
    struct valueHolderStruct {
        uint256 value;
        int count;
    }
    struct MapStruct {
        address payable[] arrAddress;
        mapping(address => valueHolderStruct) mapAddress;
    }

    MapStruct private s_participants;
    int256 private s_max_Participation_Count;
    uint256 private s_subscriptionId;
    uint256 private immutable i_ticket_value;
    AggregatorV3Interface private immutable priceFeed;
    VRFCoordinatorV2Interface private VRFV2;

    constructor(
        uint256 ticketValue,
        address priceFeedAdress,
        int256 maxParticipationCount,
        address vrfConsumerBaseV2Address,
        uint256 subscriptionId
    ) VRFConsumerBaseV2(vrfConsumerBaseV2Address) {
        i_ticket_value = ticketValue;
        priceFeed = AggregatorV3Interface(priceFeedAdress);
        s_max_Participation_Count = maxParticipationCount;
        s_subscriptionId = subscriptionId;
    }

    function getTicketValuePriceInEth() public view returns (uint256) {
        return i_ticket_value.getParticipationEthPrice(priceFeed);
    }

    function enter_Lottery() public payable countValidation {
        uint256 ethMinRequired = getTicketValuePriceInEth();
        if (msg.value != ethMinRequired) revert Doesnt__Match__Required__Eth();
        s_participants.arrAddress.push(payable(msg.sender));
        int256 count = s_participants.mapAddress[msg.sender].count;
        uint256 value = s_participants.mapAddress[msg.sender].value;
        s_participants.mapAddress[msg.sender].count = count + count;
        s_participants.mapAddress[msg.sender].value = value + msg.value;
        emit Evt__Participants__Name(msg.sender);
    }

    function getTicketValuePriceInUSD() public view returns (uint256) {
        return i_ticket_value;
    }

    function calculateEthtoUSD(uint256 weiValue) public view returns (uint256) {
        return weiValue.getConversionRate(priceFeed);
    }

    function getParticipantDetails()
        public
        view
        returns (valueHolderStruct memory)
    {
        return s_participants.mapAddress[msg.sender];
    }

    function getNumberOfParticipants() public view returns (uint256) {
        return s_participants.arrAddress.length;
    }

    fallback() external payable {
        enter_Lottery();
    }

    receive() external payable {
        enter_Lottery();
    }

    modifier countValidation() {
        if (
            s_participants.mapAddress[msg.sender].count >=
            int256(s_max_Participation_Count)
        ) {
            revert Maximum__Contribution__Limits__Five();
        }
        _;
    }
}
