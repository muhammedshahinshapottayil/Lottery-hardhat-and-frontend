import React, { useEffect } from "react";
import Header from "./Header";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../constants/abi.json";
import contractAddresses from "../constants/contract.json";
import { IPosition, notifyType, useNotification } from "@web3uikit/core";
interface ContractAddressMap {
  [chainId: string]: string[];
}

export default function Home() {
  const { chainId: HexChainId, isWeb3Enabled } = useMoralis();
  const dispatchToast = useNotification();
  const handleNewNotification = (
    message: string,
    type: notifyType,
    title: string,
    icon?: React.ReactElement
  ) => {
    dispatchToast({
      type,
      message,
      title,
      icon,
      position: "topR",
    });
  };
  const contractAddress: ContractAddressMap = JSON.parse(
    JSON.stringify(contractAddresses)
  );
  const chainId = parseInt(HexChainId!);
  const address = contractAddress[chainId]?.pop();
  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi,
    contractAddress: address,
    functionName: "getTicketValuePriceInUSD",
  });

  useEffect(() => {
    const name = async () => {
      try {
        const a: any = await enterRaffle({
          onSuccess(results) {
            handleNewNotification("Got it" + results, "success", "Success");
          },
          onError(error) {
            handleNewNotification("Got it", "error", "Error in enterRaffle");

            console.log(error);
          },
        });
        console.log(a.toString());
      } catch (error) {}
    };
    if (isWeb3Enabled) name();
  }, [isWeb3Enabled]);

  return (
    <div>
      <Header />
    </div>
  );
}
