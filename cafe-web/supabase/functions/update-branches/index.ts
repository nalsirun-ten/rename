import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  try {
    // 1. Update first branch
    await supabase.from('branches').update({
      name: 'Юнусалиева',
      address: 'Улица Юнусалиева 74, город Бишкек',
      longitude: 74.623655,
      latitude: 42.849363
    }).eq('id', '6ad72a49-b87d-41e0-b63c-90de86d1bed3');

    // 2. Update second branch
    await supabase.from('branches').update({
      name: 'Айтматова',
      address: 'Проспект Чынгыза Айтматова, 20 город Бишкек',
      longitude: 74.587273,
      latitude: 42.857766
    }).eq('id', 'ab75655c-251e-4195-b90e-80fe05907dcf');

    // 3. Delete third branch
    await supabase.from('branches').delete().eq('id', '9cd72a49-b87d-41e0-b63c-90de86d1bed5');

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
