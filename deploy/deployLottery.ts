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
  await deploy("Lottery", {
    from: deployer,
    args: ["10", process.env.PRICE_FEED_ADDRESS!],
    log: true,
    waitConfirmations: Number(process.env.WAIT_CONFIRMATION!),
  });
  log("Successfully Completed Deploying");
};

export default deployLottery;
deployLottery.tags = ["all", "lottery"];
