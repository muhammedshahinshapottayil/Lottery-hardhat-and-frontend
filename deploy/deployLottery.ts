import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployLottery: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Started Deploying");
  const CONTRACT_ADDRESS_FILE_LOCATION =
    "../Lottery/frontend/app/constants/contract.json";
  const CONTRACT_ABI_FILE_LOCATION =
    "../Lottery/frontend/app/constants/abi.json";
  const {
    LOTTERY_PRICE,
    PRICE_FEED_ADDRESS,
    WAIT_CONFIRMATION,
    MAX_PARTICIPATION_COUNT,
    VRF_CONSUMER_BASE_ADDRESS,
    SUBSCRIPTION_ID,
    MIN_PARTICIPANTS,
    SEPOLIA_HASH_KEY,
    CB_GASLIMIT,
    UPDATE_FRONTEND,
  } = process.env;
  const args = [
    SUBSCRIPTION_ID,
    MAX_PARTICIPATION_COUNT,
    LOTTERY_PRICE,
    MIN_PARTICIPANTS,
    VRF_CONSUMER_BASE_ADDRESS,
    PRICE_FEED_ADDRESS,
    SEPOLIA_HASH_KEY,
    WAIT_CONFIRMATION,
    CB_GASLIMIT,
  ];
  const deployedContract = await deploy("Lottery", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: Number(WAIT_CONFIRMATION),
  });
  if (!developmentChains.includes(network.name))
    await verify(deployedContract.address, args);

  if (UPDATE_FRONTEND) {
    const chainId = network.config.chainId!;
    const currentAddresses = JSON.parse(
      readFileSync(CONTRACT_ADDRESS_FILE_LOCATION, "utf8")
    );
    if (chainId in currentAddresses)
      currentAddresses[chainId].push(deployedContract.address);
    else currentAddresses[chainId] = [deployedContract.address];

    writeFileSync(
      CONTRACT_ADDRESS_FILE_LOCATION,
      JSON.stringify(currentAddresses)
    );

    writeFileSync(
      CONTRACT_ABI_FILE_LOCATION,
      JSON.stringify(deployedContract.abi)
    );
  }
  log("Successfully Completed Deploying");
};

export default deployLottery;
deployLottery.tags = ["all", "lottery"];
