import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envStr = fs.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const [key, ...vals] = line.split("=");
  if (key) env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY); // Need service key? Anon key can update if RLS is disabled, wait! RLS might be active.
// Let's use service key if it's there. 
