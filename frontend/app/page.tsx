"use client";
import { MoralisProvider } from "react-moralis";

import Home from "./components/Home";
import { NotificationProvider } from "@web3uikit/core";

export default function page() {
  return (
    <div>
      <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
          <Home />
        </NotificationProvider>
      </MoralisProvider>
    </div>
  );
}
