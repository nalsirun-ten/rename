import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv"; // vite-node might load it automatically if vite is used, but we can just read the file manually
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const [key, ...vals] = line.split("=");
  if (key) env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('branches').select('*');
  console.log(JSON.stringify(data, null, 2));
}
run();
