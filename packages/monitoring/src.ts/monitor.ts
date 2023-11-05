import schedule from "node-schedule";
import { heartbeat, monitorAllMarkets, sendAlert } from "./reserve-data";

async function tryToMonitorNetwork(network, alerts) {
  try {
    await monitorAllMarkets(network, alerts);
  } catch (e) {
    console.error(e);
    sendAlert(
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
  const currentDate = new Date();
  messages.push(`Summary for ${currentDate.toUTCString()}`);

  await Promise.all([
    tryToMonitorNetwork("optimism", messages),
    tryToMonitorNetwork("arbitrum", messages),
    tryToMonitorNetwork("base", messages),
    // tryToMonitorNetwork("sepolia"),
  ]);
  await heartbeat(messages);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && args[0] === "--run") {
    marketsMonitor().then(() => console.log("FIRST RUN SUCCESSFUL"));
  }
  // // cron job runs every 5 minutes
  schedule.scheduleJob("00 */5 * * * *", marketsMonitor);
}
