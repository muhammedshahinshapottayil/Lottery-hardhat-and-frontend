"use client";
import { MoralisProvider } from "react-moralis";

import Home from "./components/Home";
import { NotificationProvider } from "@web3uikit/core";

export default function page() {
  return (
    <div className="m-2 p-2" >
      <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
          <Home />
        </NotificationProvider>
      </MoralisProvider>
    </div>
  );
}
