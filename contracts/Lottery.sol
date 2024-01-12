// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./library/PriceCalculator.sol";

// Errors ----------------------------------
error Doesnt__Match__Required__Eth();
error Maximum__Contribution__Limits__Five__Try__In__Next__Session();
error Lottery__Currently__Not__Available();
error Transaction__Failed(address winner, uint256 balance);
error Validation__Error__Occured(bool status);

contract Lottery is VRFConsumerBaseV2, AutomationCompatibleInterface {
    using PriceCalculator for uint256;

    // Interfaces or Types----------------------
    struct valueHolderStruct {
        uint256 value;
        int256 count;
    }
    struct MapStruct {
        address payable[] arrAddress;
        mapping(address => valueHolderStruct) mapAddress;
    }
    enum Status {
        Active,
        Inactive
    }

    VRFCoordinatorV2Interface private immutable COORDINATOR;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private immutable i_requestConfirmations;
    uint32 private constant numWords = 1;

    MapStruct private s_participants;
    uint64 private immutable s_subscriptionId;
    uint256 private s_Max_Participation_Count;
    uint256 private immutable i_ticket_value;
    uint256 private immutable i_minParticipants;
    Status private s_lottery_status;
    uint256 private noOfWinners;
    AggregatorV3Interface private immutable i_priceFeed;

    // Events ----------------------------------
    event Evt__Participants__Name(address indexed participantAddress);
    event Evt__RecentWinner(address indexed winner);
    event Evt__RequestId(uint256 indexed requestId);

    // Modifiers--------------------------------
    modifier onlyDuringTossingCountValidation() {
        if (
            s_participants.mapAddress[msg.sender].count >=
            int256(s_Max_Participation_Count)
        ) {
            revert Maximum__Contribution__Limits__Five__Try__In__Next__Session();
        }
        _;
    }

    constructor(
        uint64 subscriptionId,
        uint256 max_participation,
        uint256 ticketValue,
        uint256 minParticipants,
        address vrfAddress,
        address priceFeedAddress,
        bytes32 keyHash,
        uint16 requestConfirmations,
        uint32 cbLimit
    ) VRFConsumerBaseV2(vrfAddress) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfAddress);
        s_subscriptionId = subscriptionId;
        s_Max_Participation_Count = max_participation;
        i_ticket_value = ticketValue;
        i_minParticipants = minParticipants;
        s_lottery_status = Status.Active;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_keyHash = keyHash;
        i_requestConfirmations = requestConfirmations;
        i_callbackGasLimit = cbLimit;
    }

    function enter_Lottery() public payable onlyDuringTossingCountValidation {
        if (s_lottery_status == Status.Inactive)
            revert Lottery__Currently__Not__Available();
        uint256 ethMinRequired = getTicketValuePriceInEth();
        if (msg.value != ethMinRequired) revert Doesnt__Match__Required__Eth();
        s_participants.arrAddress.push(payable(msg.sender));
        int256 count = s_participants.mapAddress[msg.sender].count;
        uint256 value = s_participants.mapAddress[msg.sender].value;
        s_participants.mapAddress[msg.sender] = valueHolderStruct({
            count: count + 1,
            value: value + msg.value
        });
        emit Evt__Participants__Name(msg.sender);
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool, bytes memory /* performData */) {}

    function checkUpkeepValidation() private view returns (bool) {
        bool hasBalance = address(this).balance > 0;
        bool participantsLimit = s_participants.arrAddress.length >
            i_minParticipants;
        bool isValid = (hasBalance &&
            participantsLimit &&
            s_lottery_status == Status.Active);
        return isValid;
    }

    function performUpkeep(bytes calldata) external {
        bool valid = checkUpkeepValidation();
        if (valid) {
            s_lottery_status = Status.Inactive;
            uint256 requestId = COORDINATOR.requestRandomWords(
                i_keyHash,
                s_subscriptionId,
                i_requestConfirmations,
                i_callbackGasLimit,
                numWords
            );
            emit Evt__RequestId(requestId);
        } else revert Validation__Error__Occured(valid);
    }

    function fulfillRandomWords(
        uint256,
        // _requestId
        uint256[] memory _randomWords
    ) internal override {
        uint256 luckyIndex = _randomWords[0] % s_participants.arrAddress.length;
        address payable winner = s_participants.arrAddress[luckyIndex];
        s_lottery_status = Status.Active;
        uint256 contractPrice = (2 * address(this).balance) / 100;
        uint256 totalBalance = address(this).balance;
        (bool success, ) = winner.call{value: totalBalance - contractPrice}("");
        if (!success)
            revert Transaction__Failed(winner, totalBalance - contractPrice);

        for (uint256 i = 0; i < s_participants.arrAddress.length; i++) {
            address participantAddress = s_participants.arrAddress[i];
            s_participants.mapAddress[participantAddress].value = 0;
            s_participants.mapAddress[participantAddress].count = 0;
        }
        s_participants.arrAddress = new address payable[](0);
        noOfWinners = noOfWinners + 1;
        emit Evt__RecentWinner(winner);
    }

    function getTicketValuePriceInEth() public view returns (uint256) {
        return i_ticket_value.getParticipationEthPrice(i_priceFeed);
    }

    function getTicketValuePriceInUSD() public view returns (uint256) {
        return i_ticket_value;
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

    function currentStatus() public view returns (Status) {
        return s_lottery_status;
    }

    fallback() external payable {
        enter_Lottery();
    }

    receive() external payable {
        enter_Lottery();
    }
}
