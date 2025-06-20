                                                                             

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_email_confirmation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (auth_user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_user_email_confirmation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."soft_delete_app_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if exists (
    select 1 from public.users where auth_user_id = old.id
  ) then
    update public.users
    set is_deleted = true,
        auth_user_id = null
    where auth_user_id = old.id;
  end if;

  return old;
end;
$$;


ALTER FUNCTION "public"."soft_delete_app_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."allow_list" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "domain" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."allow_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."credit_purchases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "stripe_price_id" "text",
    "stripe_payment_intent_id" "text",
    "credits_added" integer NOT NULL,
    "purchase_amount" numeric NOT NULL,
    "status" "text" NOT NULL,
    "expires_at" timestamp without time zone,
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "auth_user_id" "uuid"
);


ALTER TABLE "public"."credit_purchases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_list" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."email_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_offers" (
    "stripe_price_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "button_text" "text" DEFAULT 'Buy'::"text",
    "popular" boolean DEFAULT false,
    "plan_type" "text" NOT NULL,
    "price" numeric NOT NULL,
    "annual_price" numeric,
    "credits" integer DEFAULT 0 NOT NULL,
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "label" "text",
    CONSTRAINT "product_offers_plan_type_check" CHECK (("plan_type" = ANY (ARRAY['subscription'::"text", 'credit'::"text"])))
);


ALTER TABLE "public"."product_offers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."product_offers"."label" IS 'Used as the display name';



CREATE TABLE IF NOT EXISTS "public"."stripe_webhook_events" (
    "id" bigint NOT NULL,
    "stripe_event_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "processed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."stripe_webhook_events" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."stripe_webhook_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."stripe_webhook_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."stripe_webhook_events_id_seq" OWNED BY "public"."stripe_webhook_events"."id";



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "auth_user_id" "uuid",
    "stripe_subscription_id" "text" NOT NULL,
    "stripe_price_id" "text",
    "status" "text",
    "cancel_at_period_end" boolean DEFAULT false,
    "current_period_start" timestamp without time zone,
    "current_period_end" timestamp without time zone,
    "trial_end" timestamp without time zone,
    "is_active" boolean DEFAULT true,
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "description" "text",
    "credits_used" integer DEFAULT 1,
    "usage_type" "text",
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "auth_user_id" "uuid"
);


ALTER TABLE "public"."usage_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_credits" (
    "user_id" "uuid" NOT NULL,
    "purchased_credits" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "auth_user_id" "uuid"
);


ALTER TABLE "public"."user_credits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "email" "text" NOT NULL,
    "full_name" "text",
    "preferred_name" "text",
    "user_role" "text" DEFAULT 'user'::"text",
    "stripe_customer_id" "text",
    "active_subscription_id" "uuid",
    "is_subscription_active" boolean DEFAULT false,
    "is_on_grace_period" boolean DEFAULT false,
    "is_user_active" boolean DEFAULT true,
    "onboarding_complete" boolean DEFAULT false,
    "timezone" "text" DEFAULT 'UTC'::"text",
    "locale" "text" DEFAULT 'en'::"text",
    "referral_code" "text",
    "referred_by" "text",
    "utm_source" "text",
    "utm_campaign" "text",
    "feature_flags" "jsonb" DEFAULT '{}'::"jsonb",
    "is_beta_approved" boolean DEFAULT false,
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."stripe_webhook_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."stripe_webhook_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."allow_list"
    ADD CONSTRAINT "allow_list_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."allow_list"
    ADD CONSTRAINT "allow_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."credit_purchases"
    ADD CONSTRAINT "credit_purchases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_list"
    ADD CONSTRAINT "email_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_offers"
    ADD CONSTRAINT "product_offers_pkey" PRIMARY KEY ("stripe_price_id");



ALTER TABLE ONLY "public"."stripe_webhook_events"
    ADD CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_webhook_events"
    ADD CONSTRAINT "stripe_webhook_events_stripe_event_id_key" UNIQUE ("stripe_event_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_credits"
    ADD CONSTRAINT "user_credits_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_email_list_created_at" ON "public"."email_list" USING "btree" ("created_at");



CREATE INDEX "idx_email_list_email" ON "public"."email_list" USING "btree" ("email");



CREATE INDEX "idx_stripe_webhook_events_stripe_event_id" ON "public"."stripe_webhook_events" USING "btree" ("stripe_event_id");



ALTER TABLE ONLY "public"."credit_purchases"
    ADD CONSTRAINT "credit_purchases_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."credit_purchases"
    ADD CONSTRAINT "credit_purchases_stripe_price_id_fkey" FOREIGN KEY ("stripe_price_id") REFERENCES "public"."product_offers"("stripe_price_id");



ALTER TABLE ONLY "public"."credit_purchases"
    ADD CONSTRAINT "credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "fk_active_subscription" FOREIGN KEY ("active_subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_price_id_fkey" FOREIGN KEY ("stripe_price_id") REFERENCES "public"."product_offers"("stripe_price_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_credits"
    ADD CONSTRAINT "user_credits_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_credits"
    ADD CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Allow anyone to insert into email_list" ON "public"."email_list" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow read for sign-up" ON "public"."allow_list" FOR SELECT USING (("auth"."uid"() IS NULL));



CREATE POLICY "Service role only" ON "public"."stripe_webhook_events" TO "authenticated" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can read their own credit purchases" ON "public"."credit_purchases" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "auth_user_id"));



CREATE POLICY "Users can read their own profile" ON "public"."users" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "auth_user_id"));



CREATE POLICY "Users can read their own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Users can read their own usage logs" ON "public"."usage_logs" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "auth_user_id"));



CREATE POLICY "Users can update their preferred_name" ON "public"."users" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "auth_user_id")) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "auth_user_id") AND ("preferred_name" IS NOT NULL)));



CREATE POLICY "Users can view their own credits" ON "public"."user_credits" FOR SELECT USING (("auth"."uid"() = "auth_user_id"));



ALTER TABLE "public"."allow_list" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credit_purchases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_list" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_offers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_all_policy" ON "public"."product_offers" FOR SELECT USING (true);



ALTER TABLE "public"."stripe_webhook_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_credits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_email_confirmation"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_email_confirmation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_email_confirmation"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_user_email_confirmation"() TO "authenticator";



GRANT ALL ON FUNCTION "public"."soft_delete_app_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_app_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_app_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."soft_delete_app_user"() TO "authenticator";


















GRANT ALL ON TABLE "public"."allow_list" TO "anon";
GRANT ALL ON TABLE "public"."allow_list" TO "authenticated";
GRANT ALL ON TABLE "public"."allow_list" TO "service_role";



GRANT ALL ON TABLE "public"."credit_purchases" TO "anon";
GRANT ALL ON TABLE "public"."credit_purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."credit_purchases" TO "service_role";



GRANT ALL ON TABLE "public"."email_list" TO "anon";
GRANT ALL ON TABLE "public"."email_list" TO "authenticated";
GRANT ALL ON TABLE "public"."email_list" TO "service_role";



GRANT ALL ON TABLE "public"."product_offers" TO "anon";
GRANT ALL ON TABLE "public"."product_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."product_offers" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."stripe_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_webhook_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stripe_webhook_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stripe_webhook_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stripe_webhook_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."usage_logs" TO "anon";
GRANT ALL ON TABLE "public"."usage_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_credits" TO "anon";
GRANT ALL ON TABLE "public"."user_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."user_credits" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
