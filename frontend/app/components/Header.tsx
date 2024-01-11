"use client";
import { ConnectButton } from "@web3uikit/web3";
export default function Header() {
  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow-md flex flex-col items-center justify-between mb-2">
    <div className="flex flex-col items-start justify-center mb-4 sm:mb-0 sm:flex-row sm:justify-start">
      <h1 className="text-2xl font-bold underline decoration-2 sm:items-center">
        Lottery Information
      </h1>
      <div className="flex items-center justify-center sm:justify-end">
        <ConnectButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full" />
      </div>
    </div>
  </div>
  
  

  );
}
