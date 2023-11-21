import schedule from "node-schedule";
import { heartbeat, monitorAllMarkets, formatAlert } from "./reserve-data";

async function tryToMonitorNetwork(network, alerts, messages) {
  try {
    await monitorAllMarkets(network, alerts, messages);
  } catch (e) {
    console.error(e);
    formatAlert(
      `Unable to monitor network ${network}. Failed with error: ${e
        .toString()
        .substring(0, 100)}`,
      3,
      alerts
    );
  }
}

async function marketsMonitor() {
  const messages = [];
  const alerts = [];
  const currentDate = new Date();
  messages.push(`Summary for ${currentDate.toUTCString()}`);
  alerts.push(`Summary for ${currentDate.toUTCString()}`);

  await Promise.all([
    tryToMonitorNetwork("optimism", messages, alerts),
    tryToMonitorNetwork("arbitrum", messages, alerts),
    tryToMonitorNetwork("base", messages, alerts),
    // tryToMonitorNetwork("sepolia"),
  ]);
  await heartbeat(messages, alerts);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && args[0] === "--run") {
    marketsMonitor().then(() => console.log("FIRST RUN SUCCESSFUL"));
  }
  // // cron job runs every 5 minutes
  schedule.scheduleJob("00 */5 * * * *", marketsMonitor);
}
