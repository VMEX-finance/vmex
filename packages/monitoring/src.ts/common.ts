import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

export const ONE_ETH = ethers.utils.parseUnits("1", "ether");

export const vmexAlertsDiscordWebhook = process.env.DISCORD_ALERTS_WEBHOOK_URL;
export const vmexHeartbeatDiscordWebhook =
  process.env.DISCORD_HEARTBEAT_WEBHOOK_URL;

export const vmexReportsDiscordWebhook =
  process.env.DISCORD_REPORTS_WEBHOOK_URL;

export function formatAlert(message: string, severity: number) {
  let alertMessage = `SEV ${severity} ALERT: ${message}`;
  if (severity <= 1) {
    alertMessage +=
      "\n<@377672785591402496> <@976609805949091911> <@174610463655460865> <@374108299743985676> <@170740980746551296>";
  }
  return alertMessage;
  // TODO: More alerting depending on severity
}

export function sendMessage(message: string, webhook: string) {
  if (!webhook) {
    throw new Error(
      "Vmex discord messages webhook is not defined in env variables"
    );
  }
  if (message.length > 2000) {
    message = "Output exceeds 2000 characters, not able to send on discord";
  }
  const data = typeof message === "string" ? { content: message } : message;
  return new Promise<void>((resolve, reject) => {
    fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          response.text().then((text) => {
            reject(
              new Error(`Could not send message: ${response.status}, ${text}`)
            );
          });
        }
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

export async function batchSendMessage(message: string, webhook: string) {
  if (!webhook) {
    throw new Error(
      "Vmex discord messages webhook is not defined in env variables"
    );
  }
  if (message.length > 2000) {
    for (let idx = 0; idx < message.length; idx += 2000) {
      await sendMessage(message.slice(idx, idx + 2000), webhook);
    }
  } else {
    await sendMessage(message, webhook);
  }
}

export const getCurrentTime = (): string => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
};
