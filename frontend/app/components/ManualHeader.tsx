"use client";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);
  const {
    enableWeb3,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  const disConnectMetamask = () => {
    deactivateWeb3();
    localStorage.removeItem("metaConnection");
  };

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    const metaConnection = localStorage.getItem("metaConnection");
    if (typeof ethereum !== "undefined") {
      setHasMetaMask(true);
      if (metaConnection === "connected" && isWeb3Enabled === false)
        enableWeb3();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onWeb3Enabled(() => {
      localStorage.setItem("metaConnection", "connected");
    });
    Moralis.onAccountChanged((account) => {
      if (account == null) disConnectMetamask();
    });
  }, []);

  return hasMetaMask ? (
    <div>
      {isWeb3Enabled ? (
        <button
          onClick={disConnectMetamask}
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Disconnect
        </button>
      ) : (
        <button
          disabled={isWeb3EnableLoading}
          onClick={() => {
            enableWeb3();
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Connect Wallet
        </button>
      )}
    </div>
  ) : (
    <div>
      <a target="_blank" href="https://metamask.io/download">
        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
          Download Metamask
        </button>
      </a>
    </div>
  );
}
