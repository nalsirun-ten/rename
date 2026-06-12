import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_ORDERS_CHAT_ID = Deno.env.get("TELEGRAM_ORDERS_CHAT_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const TOPICS: Record<string, number> = {
  '6ad72a49-b87d-41e0-b63c-90de86d1bed3': 10, // Юнусалиева
  'ab75655c-251e-4195-b90e-80fe05907dcf': 12  // Айтматова
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Fetch order details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        branches ( name, address )
      `)
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), { 
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Format the items list
    let itemsText = "";
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const variantText = item.variant_name ? ` (${item.variant_name})` : '';
        itemsText += `• ${item.name}${variantText} x${item.quantity} - ${item.price * item.quantity} сом\n`;
      });
    }

    const isDelivery = order.delivery_method === 'delivery';
    
    // Construct the message
    const message = `
🍔 <b>Новый заказ!</b> #${order.id.split('-')[0]}

<b>Способ получения:</b> ${isDelivery ? '🚚 Доставка' : '🏃 Самовывоз'}
${!isDelivery && order.branches ? `<b>Филиал:</b> ${order.branches.name} (${order.branches.address})\n` : ''}
<b>Клиент:</b> ${order.recipient_name || 'Не указано'}
<b>Телефон:</b> <code>${order.phone || 'Не указано'}</code>
${isDelivery ? `<b>Адрес:</b> ${order.delivery_address || 'Не указан'}\n` : ''}
<b>Комментарий:</b> ${order.notes || 'Нет'}

<b>Заказ:</b>
${itemsText}
<b>Итого к оплате:</b> ${order.total_price} сом
    `.trim();

    let message_thread_id: number | undefined = undefined;
    if (order.branch_id && TOPICS[order.branch_id]) {
      message_thread_id = TOPICS[order.branch_id];
    }

    const telegramPayload: any = {
      chat_id: TELEGRAM_ORDERS_CHAT_ID,
      text: message,
      parse_mode: "HTML"
    };

    if (message_thread_id) {
      telegramPayload.message_thread_id = message_thread_id;
    }

    // Send to Telegram
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramPayload)
    });

    const telegramResult = await response.json();

    if (!telegramResult.ok) {
      console.error("Telegram error:", telegramResult);
      throw new Error("Failed to send message to Telegram");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in notify-order:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
