const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/github-webhook", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.hasOwnProperty("commits")) {
      throw new Error("Invalid payload");
    }
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
    const message = `[[${payload.repository.name}:${payload.repository.master_branch}](${payload.repository.html_url})]New commits:\n${commitMessages} \n Coded By = @Hesam_0G`;

    const chatId = req.query.chat_id;
    const botToken = req.query.token;

    if (!chatId || !botToken) {
      throw new Error("Missing chat_id or token");
    }

    await sendTelegramMessage(message, chatId, botToken);

    res.end("Received GitHub webhook");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

async function sendTelegramMessage(message, chatId, botToken) {
  const bot = new Telegraf(botToken);
  const escapedMessage = message.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&");
  await bot.telegram.sendMessage(Number(chatId), `${escapedMessage}`, {
    parse_mode: "Markdown",
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
