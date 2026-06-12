import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");

  try {
    const update = await req.json();

    if (update.message?.text?.startsWith("/start ")) {
      const sessionId = update.message.text.split(" ")[1];
      const telegramUserId = update.message.from.id;

      await supabase.from("telegram_auth_requests").update({
        telegram_user_id: telegramUserId,
        status: "waiting_for_contact"
      }).eq("id", sessionId);

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: update.message.chat.id,
          text: "Пожалуйста, нажмите кнопку ниже, чтобы поделиться контактом для входа в приложение:",
          reply_markup: {
            keyboard: [[{ text: "📞 Поделиться контактом", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        })
      });
      return new Response("ok");
    }

    if (update.message?.contact) {
      const contact = update.message.contact;
      const telegramUserId = update.message.from.id;

      if (contact.user_id !== telegramUserId) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: update.message.chat.id, text: "Ошибка: Вы отправили чужой контакт. Пожалуйста, отправьте свой контакт с помощью кнопки." })
        });
        return new Response("ok");
      }

      const { data: session } = await supabase.from("telegram_auth_requests")
        .select("*")
        .eq("telegram_user_id", telegramUserId)
        .eq("status", "waiting_for_contact")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!session) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: update.message.chat.id, text: "Сессия не найдена или истекла. Пожалуйста, начните вход заново на сайте." })
        });
        return new Response("ok");
      }

      const rawPhone = contact.phone_number;
      const cleanPhone = rawPhone.replace("+", "");
      const phoneWithPlus = `+${cleanPhone}`;
      const tempPassword = crypto.randomUUID();

      let authUserId = null;

      // 1. Попробуем найти пользователя в profiles
      const { data: profile } = await supabase.from('profiles')
        .select('id')
        .or(`phone.eq.${phoneWithPlus},phone.eq.${cleanPhone}`)
        .single();
      
      if (profile) {
        authUserId = profile.id;
      } else {
        // Если профиля нет, возможно он есть в auth.users. Получим всех юзеров (или до 1000)
        const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingUser = users.find(u => u.phone === cleanPhone || u.phone === phoneWithPlus);
        if (existingUser) {
          authUserId = existingUser.id;
        }
      }

      if (authUserId) {
        // Обновляем пароль
        const { error: updateErr } = await supabase.auth.admin.updateUserById(authUserId, { password: tempPassword });
        if (updateErr) console.error("Error updating password:", updateErr);
      } else {
        // Создаем нового
        const { error: createErr } = await supabase.auth.admin.createUser({
          phone: cleanPhone, // Supabase ожидает телефон без плюса обычно
          password: tempPassword,
          phone_confirm: true,
        });
        if (createErr) console.error("Error creating user:", createErr);
      }

      // Обновляем сессию. Будем использовать телефон с плюсом, но если клиент 
      // использует cleanPhone для входа, лучше отправить cleanPhone
      await supabase.from("telegram_auth_requests").update({
        phone: cleanPhone,
        temp_password: tempPassword,
        status: "verified"
      }).eq("id", session.id);

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chat_id: update.message.chat.id, 
          text: "✅ Вы успешно авторизованы! Возвращайтесь на сайт/в приложение.",
          reply_markup: { remove_keyboard: true }
        })
      });

      return new Response("ok");
    }

    return new Response("ok");
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 500 });
  }
});
