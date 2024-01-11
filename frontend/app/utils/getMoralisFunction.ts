import { useMoralis } from "react-moralis";
import { abi, contract as contractAddresses } from "../constants";
function getMoralisFunction() {
  const { chainId: HexChainId, isWeb3Enabled, account } = useMoralis();
  const contractAddress: ContractAddressMap = JSON.parse(
    JSON.stringify(contractAddresses)
  );
  const chainId = parseInt(HexChainId!);
  const address = contractAddress[chainId]?.pop();
  return { abi, address, isWeb3Enabled, account };
}
export default getMoralisFunction;
