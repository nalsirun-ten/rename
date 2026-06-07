-- In case there is an RLS policy missing
CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_fcm_tokens"
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON "public"."user_fcm_tokens"
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."user_fcm_tokens"
FOR DELETE USING (auth.uid() = user_id);
