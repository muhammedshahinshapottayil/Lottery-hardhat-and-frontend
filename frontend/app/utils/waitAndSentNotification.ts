import { notifyType } from "@web3uikit/core";
import { ReactElement } from "react";

const waitAndSentNotification = async (
  tx: any,
  handleNewNotification: (
    message: string,
    type: notifyType,
    title: string,
    icon?: ReactElement
  ) => void
) => {
  try {
    await tx.wait(3);
    handleNewNotification(
      "Successfully Completed",
      "success",
      "Transaction Notification"
    );
  } catch (error) {
    handleNewNotification(
      "Error While Transaction Being Confirmed",
      "error",
      "Transaction Notification"
    );
  }
};
export default waitAndSentNotification;
