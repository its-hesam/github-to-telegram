const axios = require("axios");
const http = require("http");
const url = require("url");
require("dotenv").config("./.env");
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const { token, chat_id } = queryObject;

  if (req.method === "POST" && req.url === "/github-webhook" && token && chat_id) {
    handleGitHubWebhook(req, res, token, chat_id);
  } else {
    res.statusCode = 202;
    res.end("Uptime");
  }
});

async function handleGitHubWebhook(req, res, token, chat_id) {
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
      const message = `✅[[${payload.repository.name}:${payload.repository.master_branch}](${payload.repository.html_url})]New commits:\n${commitMessages}`;
      sendTelegramMessage(token, chat_id, message);
    }
    res.end("Received GitHub webhook");
  });
}

async function sendTelegramMessage(token, chat_id, message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chat_id,
        text: message,
        parse_mode: "Markdown",
      }
    );
    console.log("Message sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending message:", error.response.data);
  }
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
