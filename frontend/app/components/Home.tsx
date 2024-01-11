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

  const participateInLottery = async () => {
    setIsTransaction(true);
    await enterLottery({
      async onSuccess(results: any) {
        try {
          await waitAndSentNotification(results, handleNewNotification);
          getParticipantsCount();
          getCurrentContractStatus();
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
            <div className="container mx-auto p-8 bg-gray-100 rounded-lg shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Participation Amount in USD
                  </h2>
                  <p className="text-lg font-medium">{EthInUSD}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Participation Amount in WEI
                  </h2>
                  <p className="text-lg font-medium">{USDInEth}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Participants Count
                  </h2>
                  <p className="text-lg font-medium">{ParticipantsCount}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Previous Winner
                  </h2>
                  <p className="text-lg font-medium">{PreviousWinner}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Current Status</h2>
                  <p className="text-lg font-medium">{lotteryStatus}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Participation Amount in ETH
                  </h2>
                  <p className="text-lg font-medium">
                    {ethers.utils.formatUnits(BigInt(USDInEth), "ether")}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Invested Amount in this session as ETH
                  </h2>
                  <p className="text-lg font-medium">
                    {ethers.utils.formatUnits(
                      BigInt(CurrentDetails.value),
                      "ether"
                    )}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Invested Count in this session
                  </h2>
                  <p className="text-lg font-medium">{CurrentDetails.count}</p>
                </div>
              </div>

              <div className="mt-8">
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
          <h1>Unsupported Network</h1>
        )
      ) : (
        <h1>Please Connect to Metamask</h1>
      )}
    </div>
  );
}
