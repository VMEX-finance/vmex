import schedule from "node-schedule";
import { MonitorReserves, getPnlReport } from "./monitor-reserve";
import {
  batchSendMessage,
  vmexReportsDiscordWebhook,
  NETWORKS,
} from "./common";

async function monitorMarkets() {
  const job = new MonitorReserves(NETWORKS);
  await job.monitorAllNetworks();
  await job.sendMessages();
}
async function monitorMarketsDry() {
  const job = new MonitorReserves(NETWORKS);
  await job.monitorAllNetworks();
  await job.sendMessages(true);
}

function pnlReport() {
  const report = getPnlReport(NETWORKS);
  batchSendMessage(report, vmexReportsDiscordWebhook);
}

function pnlReportDry() {
  const report = getPnlReport(NETWORKS);
  console.log("Report is:\n\n", report);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && args[0] === "--run") {
    monitorMarkets().then(() => {
      console.log("FIRST RUN SUCCESSFUL");
      pnlReport();
      console.log("Done sending report");
    });
  } else if (args.length && args[0] === "--dry-run") {
    monitorMarketsDry().then(() => {
      console.log("FIRST RUN SUCCESSFUL");
      pnlReportDry();
    });
  }
  // cron job runs every 5 minutes
  schedule.scheduleJob("00 */5 * * * *", monitorMarkets);

  // run every day
  schedule.scheduleJob("00 00 00 * * *", pnlReport);
}
