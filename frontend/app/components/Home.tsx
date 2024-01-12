import { useEffect, useState, ReactElement } from "react";
import Header from "./Header";
import { Button } from "@web3uikit/core";
import { ethers } from "ethers";
import { getMoralisFunction, waitAndSentNotification } from "../utils";
import {
  web3ContractGetFunctions,
  web3ContractTransactionFunctions,
} from "../contractFunctions";
import { notifyType, useNotification } from "@web3uikit/core";

export default function Home() {
  const [EthInUSD, setEthInUSD] = useState<string>("");
  const [USDInEth, setUSDInEth] = useState<string>("");
  const [ParticipantsCount, setParticipantsCount] = useState<number>(0);
  const [PreviousWinner, setPreviousWinner] = useState<string>("");
  const [lotteryStatus, setLotteryStatus] = useState<string>("");
  const [IsTransaction, setIsTransaction] = useState<boolean>(false);
  const [CurrentDetails, setCurrentDetails] = useState<valueHolder>({
    count: "0",
    value: "0",
  });

  const { address, isWeb3Enabled } = getMoralisFunction();

  const dispatchToast = useNotification();
  const handleNewNotification = (
    message: string,
    type: notifyType,
    title: string,
    icon?: ReactElement
  ) => {
    dispatchToast({
      type,
      message,
      title,
      icon,
      position: "topR",
    });
  };

  const getTicketValuePriceInUSD = web3ContractGetFunctions(
    "getTicketValuePriceInUSD"
  );
  const getTicketValuePriceInEth = web3ContractGetFunctions(
    "getTicketValuePriceInEth"
  );
  const getNumberOfParticipants = web3ContractGetFunctions(
    "getNumberOfParticipants"
  );
  const getParticipantDetails = web3ContractGetFunctions(
    "getParticipantDetails"
  );
  const getCurrentStatus = web3ContractGetFunctions("currentStatus");

  const enterLottery = web3ContractTransactionFunctions(
    "enter_Lottery",
    USDInEth
  );

  const getParticipantsCount = async () => {
    await getNumberOfParticipants({
      onSuccess(results: any) {
        setParticipantsCount(results.toString());
      },
      onError(error) {
        handleNewNotification(
          "Error in get number of participants",
          "error",
          "Something went wrong"
        );
        console.log(error);
      },
    });
  };

  const getCurrentContractStatus = async () => {
    await getCurrentStatus({
      onSuccess(results: any) {
        setLotteryStatus(results.toString());
      },
      onError(error) {
        handleNewNotification(
          "Error fetching lottery status",
          "error",
          "Something went wrong"
        );
        console.log(error);
      },
    });
  };

  const getUserParticipantDetails = async () => {
    await getParticipantDetails({
      onSuccess(results: any) {
        setCurrentDetails({
          count: results.count.toString(),
          value: results.value.toString(),
        });
      },
      onError(error) {
        handleNewNotification(
          "Error fetching get participant details",
          "error",
          "Something went wrong"
        );
        console.log(error);
      },
    });
  };

  const getOnLoadData = async () => {
    await getTicketValuePriceInUSD({
      onSuccess(results: any) {
        setEthInUSD(results.toString());
      },
      onError(error) {
        handleNewNotification(
          "Error in get ticket value price in USD",
          "error",
          "Something went wrong"
        );
        console.log(error);
      },
    });
    await getTicketValuePriceInEth({
      onSuccess(results: any) {
        setUSDInEth(results.toString());
      },
      onError(error) {
        handleNewNotification(
          "Error in get ticket value price in ETH/Wei",
          "error",
          "Something went wrong"
        );
        console.log(error);
      },
    });
    await getParticipantsCount();
    await getCurrentContractStatus();
    await getUserParticipantDetails();
  };
  const participateInLottery = async () => {
    setIsTransaction(true);
    await enterLottery({
      async onSuccess(results: any) {
        try {
          await waitAndSentNotification(results, handleNewNotification);
          await getOnLoadData();
        } catch (error) {
          handleNewNotification(
            "Error While Transaction Being Confirmed",
            "error",
            "Transaction Notification"
          );
        }
      },
      onComplete() {
        setIsTransaction(false);
      },
      onError(error) {
        handleNewNotification(
          "Error in Participation Transaction",
          "error",
          "Something went wrong"
        );
        console.log(error);
      },
    });
  };
  useEffect(() => {
    if (isWeb3Enabled && address) getOnLoadData();
  }, [isWeb3Enabled, address]);

  useEffect(() => {
    const provider = new ethers.providers.WebSocketProvider(
      process.env.NEXT_PUBLIC_WSS_URL!
    );
    provider.on("Evt__Participants__Name", (sender, evtDetails) => {
      getOnLoadData();
    });
    provider.on("Evt__RecentWinner", (winner, evtDetails) => {
      setPreviousWinner(winner);
    });
  }, []);

  return (
    <div>
      <Header />
      {isWeb3Enabled ? (
        address ? (
          <div>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md px-4 py-8 md:px-8 md:py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold mb-4 md:text-4xl">
                  🎉 <strong>Welcome to the Lottery Smart Contract!</strong> 🎉
                </h1>

                <p className="text-lg font-semibold mb-5 md:text-xl">
                  🕒 <strong>Session Duration:</strong> Each lottery session
                  lasts for 15 minutes.
                </p>
                <p className="text-lg font-semibold mb-5 md:text-xl">
                  💰 <strong>Contract Fee:</strong> A 2% fee will be deducted by
                  the contract from the total prize pool in each session.
                </p>

                <p className="text-lg font-semibold mb-5 md:text-xl">
                  👤 <strong>Participant Limit:</strong> Each person can
                  participate up to 5 times in a single session.
                </p>
                <p className="text-lg font-semibold mb-5 md:text-xl">
                  Get Ready to Participate and Win Big!
                </p>

                <p className="text-sm">
                  <b>
                    Feel free to reach out if you have any questions. Good luck!
                  </b>
                </p>
              </div>

              <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-4 justify-center">
                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Participation Amount in USD
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {EthInUSD}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Participation Amount in WEI
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {USDInEth}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Participants Count
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {ParticipantsCount}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Previous Winner
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {PreviousWinner}
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-4 justify-center">
                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Current Status
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {lotteryStatus === "0"
                      ? "Active"
                      : "Session Closed and Waiting to Restart"}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Participation Amount in ETH
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {ethers.utils.formatUnits(BigInt(USDInEth), "ether")}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Invested Amount in this session as ETH
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {ethers.utils.formatUnits(
                      BigInt(CurrentDetails.value),
                      "ether"
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Invested Count in this session
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {CurrentDetails.count}
                  </p>
                </div>
                <Button
                  theme="moneyPrimary"
                  text="Participate"
                  size="large"
                  onClick={participateInLottery}
                  isLoading={IsTransaction}
                  loadingText="Transaction Pending"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md p-4 md:p-8">
            <div>
              <h1 className="text-3xl font-bold mb-4 md:text-4xl">
                Unsupported Network
              </h1>
              <p className="text-lg font-medium mb-4">
                This application currently only supports these networks:
              </p>
              <ul className="mx-auto my-4 list-none">
                <li className="mb-2">Sepolia</li>
              </ul>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md p-4 md:p-8">
          <div>
            <h1 className="text-3xl font-bold mb-4 md:text-4xl">
              Please Connect to MetaMask
            </h1>
          </div>
        </div>
      )}
    </div>
  );
}
