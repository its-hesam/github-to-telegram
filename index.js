const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/github-webhook", (req, res) => {
  const payload = req.body;
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
    const chatId = req.query.chat_id;
    const botToken = req.query.token;
    console.log("chatid", chatId);
    console.log("token", botToken);
    sendTelegramMessage(message, chatId, botToken);
  }
  res.end("Received GitHub webhook");
});

async function sendTelegramMessage(message, chatId, botToken) {
  const bot = new Telegraf(botToken);
  await bot.telegram.sendMessage(Number(chatId), `${message}`, {
    parse_mode: "Markdown",
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
