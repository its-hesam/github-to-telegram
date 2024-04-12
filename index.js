const { Telegraf } = require("telegraf");
const http = require("http");
require("dotenv").config("./.env");

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const CHAT_ID = process.env.CHAT_ID || -1002114261445;

const bot = new Telegraf(`${BOT_TOKEN}`);
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/github-webhook") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const payload = JSON.parse(body);
      if (payload && payload.hasOwnProperty("commits")) {
        const commits = payload.commits;
        const commitMessages = commits
          .map((commit) => {
            return `
            [${commit.id.substring(0, 5)}](${commit.url}) ${commit.message} - ${
              commit.author.name
            }
            `;
          })
          .join("\n");
        const message = `[[${payload.repository.name}:${payload.repository.master_branch}](${payload.repository.html_url})]New commits:\n${commitMessages}`;
        sendTelegramMessage(message);
      }
      res.end("Received GitHub webhook");
    });
  } else {
    res.statusCode = 202;
    res.end("Uptime");
  }
});

async function sendTelegramMessage(message) {
  await bot.telegram.sendMessage(CHAT_ID, `${message}`, {
    parse_mode: "Markdown",
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.launch({
  dropPendingUpdates: true,
});
