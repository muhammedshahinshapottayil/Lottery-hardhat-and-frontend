"use client";
import { ConnectButton } from "@web3uikit/web3";
export default function Header() {
  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md flex items-center justify-between mb-2 md:mb-4 w-full">
      <div className="flex flex-col items-start justify-center mb-4 sm:mb-0 sm:flex-row sm:justify-start">
        <h1 className="text-3xl font-bold mb-4 md:text-4xl">
          Lottery Information
        </h1>
        <div className="flex items-center justify-center sm:justify-end">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
