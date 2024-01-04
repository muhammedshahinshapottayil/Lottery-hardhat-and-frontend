import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// import { ethers, network } from "hardhat";
import "dotenv/config";

const deployLottery: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Started Deploying");
  const LOTTERY_PRICE = process.env.LOTTERY_PRICE;
  const PRICE_FEED_ADDRESS = process.env.PRICE_FEED_ADDRESS;
  const WAIT_CONFIRMATION = process.env.WAIT_CONFIRMATION;
  const MAX_PARTICIPATION_COUNT = process.env.MAX_PARTICIPATION_COUNT;
  const VRF_CONSUMER_BASE_ADDRESS = process.env.VRF_CONSUMER_BASE_ADDRESS;
  const SUBSCRIPTION_ID = process.env.SUBSCRIPTION_ID;
  const MIN_PARTICIPANTS = process.env.MIN_PARTICIPANTS;
  const TIME_INTERVAL = process.env.TIME_INTERVAL;
  const SEPOLIA_HASH_KEY = process.env.SEPOLIA_HASH_KEY;
  const CB_GASLIMIT = process.env.CB_GASLIMIT;
  const args = [
    LOTTERY_PRICE,
    PRICE_FEED_ADDRESS,
    MAX_PARTICIPATION_COUNT,
    VRF_CONSUMER_BASE_ADDRESS,
    SUBSCRIPTION_ID,
    MIN_PARTICIPANTS,
    TIME_INTERVAL,
    SEPOLIA_HASH_KEY,
    WAIT_CONFIRMATION,
    CB_GASLIMIT,
  ];
  await deploy("Lottery", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: Number(WAIT_CONFIRMATION),
  });
  log("Successfully Completed Deploying");
};

export default deployLottery;
deployLottery.tags = ["all", "lottery"];
