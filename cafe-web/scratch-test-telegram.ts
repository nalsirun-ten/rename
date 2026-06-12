import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const [key, ...vals] = line.split("=");
  if (key) env[key.trim()] = vals.join("=").trim();
});

const BOT_TOKEN = env.VITE_TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
// But the bot token is not in .env.local usually, it's in the edge function env.
// Let's use the local bot token if available, or I'll just write an edge function to test.
