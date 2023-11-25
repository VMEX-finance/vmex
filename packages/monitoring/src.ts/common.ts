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
