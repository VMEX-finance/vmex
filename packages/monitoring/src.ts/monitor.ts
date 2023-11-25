import schedule from "node-schedule";
import { MonitorReserves } from "./monitor-reserve";

async function monitorMarkets() {
  const job = new MonitorReserves(["optimism", "base", "arbitrum"]);
  await job.monitorAllNetworks();
  await job.sendMessages();
}
async function monitorMarketsDry() {
  const job = new MonitorReserves(["optimism", "base", "arbitrum"]);
  await job.monitorAllNetworks();
  await job.sendMessages(true);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && args[0] === "--run") {
    monitorMarkets().then(() => console.log("FIRST RUN SUCCESSFUL"));
  } else if (args.length && args[0] === "--dry-run") {
    monitorMarketsDry().then(() => console.log("FIRST RUN SUCCESSFUL"));
  }
  // // cron job runs every 5 minutes
  schedule.scheduleJob("00 */5 * * * *", monitorMarkets);
}
