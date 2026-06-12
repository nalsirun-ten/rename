import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const [key, ...vals] = line.split("=");
  if (key) env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1);
  console.log(JSON.stringify(data, null, 2));
}
run();
