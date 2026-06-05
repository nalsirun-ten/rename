import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.15.5/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getAccessToken = async (clientEmail: string, privateKey: string) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; 

  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat,
  };

  const key = await importPKCS8(privateKey, "RS256");
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Failed to get access token");
  return data.access_token;
};

const sendFcmMessage = async (token: string, title: string, body: string, notificationId: string, accessToken: string, projectId: string, imageUrl?: string) => {
  const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      message: {
        token: token,
        notification: {
          title: title || 'Новое уведомление',
          body: body || '',
          ...(imageUrl ? { image: imageUrl } : {})
        },
        webpush: {
          notification: {
            title: title || 'Новое уведомление',
            body: body || '',
            icon: "https://dentapp-18e25.web.app/icons/icon-192x192.png",
            ...(imageUrl ? { image: imageUrl } : {})
          },
          fcm_options: {
            link: "https://dentapp-18e25.web.app/"
          }
        },
        data: {
          notification_id: String(notificationId),
        }
      },
    }),
  });
  const data = await fcmRes.json();
  if (!fcmRes.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data.name;
};

const chunkArray = (arr: any[], size: number) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    // We only care about INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: "Not an insert event" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const record = payload.record;
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Load Firebase credentials
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountStr) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT secret")
    }
    const serviceAccount = JSON.parse(serviceAccountStr)

    // Get access token
    const accessToken = await getAccessToken(serviceAccount.client_email, serviceAccount.private_key)
    
    const isBroadcast = !record.user_id;

    let targetTokens: string[] = [];

    if (isBroadcast) {
      let page = 0;
      while (true) {
        let query = supabaseClient
          .from('profiles')
          .select('user_fcm_tokens(token)')
          .range(page * 1000, (page + 1) * 1000 - 1);
        
        const aud = record.target_audience || 'all';
        if (aud === 'almost_free') query = query.eq('stamps_count', 5);
        else if (aud === 'newbies') query = query.eq('stamps_count', 0);
        else if (aud === 'vip') query = query.gte('stamps_count', 10);
        else if (aud === 'specific_user' && record.target_phone) query = query.eq('phone', record.target_phone);

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching tokens:", error);
          break;
        }
        if (!data || data.length === 0) break;
        
        data.forEach((p: any) => {
          if (p.user_fcm_tokens && Array.isArray(p.user_fcm_tokens)) {
            p.user_fcm_tokens.forEach((t: any) => {
              if (t.token) targetTokens.push(t.token);
            });
          }
        });
        
        if (data.length < 1000) break;
        page++;
      }
    } else {
      const { data: tokensData, error } = await supabaseClient
        .from('user_fcm_tokens')
        .select('token')
        .eq('user_id', record.user_id);

      if (tokensData && tokensData.length > 0) {
        targetTokens.push(...tokensData.map(t => t.token));
      }
    }

    if (targetTokens.length === 0) {
      return new Response(JSON.stringify({ message: "No target FCM tokens found", success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // De-duplicate tokens just in case
    targetTokens = [...new Set(targetTokens)];

    // Send in chunks of 50
    const chunks = chunkArray(targetTokens, 50);
    let successCount = 0;
    let failureCount = 0;

    for (const chunk of chunks) {
      const promises = chunk.map(async (token) => {
        try {
          await sendFcmMessage(token, record.title, record.body, record.id, accessToken, serviceAccount.project_id, record.image_url);
        } catch (err: any) {
          // If the token is invalid or unregistered, we should delete it
          const errorMsg = err.message || String(err);
          if (errorMsg.includes('NOT_FOUND') || errorMsg.includes('UNREGISTERED') || errorMsg.includes('INVALID_ARGUMENT')) {
            console.log(`Deleting dead token: ${token}`);
            await supabaseClient.from('user_fcm_tokens').delete().eq('token', token);
          }
          throw err;
        }
      });
      
      const results = await Promise.allSettled(promises);
      results.forEach(result => {
        if (result.status === 'fulfilled') successCount++;
        else {
          failureCount++;
          console.error("FCM Send Error:", result.reason);
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Push sent. Success: ${successCount}, Failed: ${failureCount}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
