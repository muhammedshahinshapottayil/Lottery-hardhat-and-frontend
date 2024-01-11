import { useWeb3Contract } from "react-moralis";
import { getMoralisFunction } from "../utils";

const web3ContractGetFunctions = (functionName: string) => {
  const { abi, address } = getMoralisFunction();
  const { runContractFunction } = useWeb3Contract({
    abi,
    contractAddress: address,
    functionName,
  });
  return runContractFunction;
};

const web3ContractTransactionFunctions = (
  functionName: string,
  value: string
) => {
  const { abi, address } = getMoralisFunction();

  const { runContractFunction } = useWeb3Contract({
    abi,
    contractAddress: address,
    functionName,
    msgValue: value,
  });
  return runContractFunction;
};
export { web3ContractGetFunctions, web3ContractTransactionFunctions };
