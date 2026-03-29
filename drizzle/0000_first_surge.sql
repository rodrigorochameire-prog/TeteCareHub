CREATE TABLE IF NOT EXISTS "behavior_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"behavior_log_id" integer NOT NULL,
	"document_id" integer,
	"file_url" text NOT NULL,
	"file_name" varchar(255),
	"mime_type" varchar(100),
	"file_size" integer,
	"file_type" varchar(20),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "behavior_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"log_date" timestamp NOT NULL,
	"socialization" varchar(50),
	"energy" varchar(50),
	"obedience" varchar(50),
	"anxiety" varchar(50),
	"aggression" varchar(50),
	"notes" text,
	"activities" text,
	"attachments" text,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"request_type" varchar(50) DEFAULT 'daycare' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"rejection_reason" text,
	"admin_notes" text,
	"approved_by_id" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"trigger_type" varchar(50) NOT NULL,
	"trigger_entity" varchar(50),
	"trigger_field" varchar(100),
	"trigger_condition" varchar(50),
	"trigger_value" text,
	"action_type" varchar(50) NOT NULL,
	"action_config" text NOT NULL,
	"execution_count" integer DEFAULT 0 NOT NULL,
	"last_executed_at" timestamp,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"label" varchar(200) NOT NULL,
	"description" text,
	"data_type" varchar(20) NOT NULL,
	"updated_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"end_date" timestamp,
	"event_type" varchar(100) NOT NULL,
	"pet_id" integer,
	"is_all_day" boolean DEFAULT true NOT NULL,
	"color" varchar(20),
	"location" varchar(200),
	"notes" text,
	"reminder_minutes" integer,
	"priority" varchar(20) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'scheduled',
	"is_recurring" boolean DEFAULT false,
	"recurrence_type" varchar(20),
	"recurrence_interval" integer DEFAULT 1,
	"recurrence_end_date" timestamp,
	"recurrence_count" integer,
	"recurrence_days" varchar(50),
	"parent_event_id" integer,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"deleted_at" timestamp,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"credits" integer NOT NULL,
	"price_in_cents" integer NOT NULL,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"log_date" timestamp NOT NULL,
	"source" varchar(50) NOT NULL,
	"log_type" varchar(50) DEFAULT 'general',
	"mood" varchar(50),
	"stool" varchar(50),
	"appetite" varchar(50),
	"energy" varchar(50),
	"water_intake" varchar(50),
	"notes" text,
	"attachments" text,
	"stool_quality" varchar(50),
	"urine_quality" varchar(50),
	"physical_integrity" varchar(50),
	"physical_notes" text,
	"nap_quality" varchar(50),
	"group_role" varchar(50),
	"best_friend_pet_id" integer,
	"activities_performed" jsonb DEFAULT '[]'::jsonb,
	"checkout_observations" jsonb DEFAULT '[]'::jsonb,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"uploaded_by_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"file_url" text NOT NULL,
	"file_key" text,
	"file_name" varchar(255),
	"mime_type" varchar(100),
	"file_size" integer,
	"related_module" varchar(50),
	"related_id" integer,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dynamic_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20) NOT NULL,
	"icon" varchar(50),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"auto_assign_condition" text,
	"show_on_checkin" boolean DEFAULT true NOT NULL,
	"show_on_calendar" boolean DEFAULT true NOT NULL,
	"show_on_pet_card" boolean DEFAULT true NOT NULL,
	"show_on_daily_log" boolean DEFAULT true NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "log_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"log_id" integer NOT NULL,
	"document_id" integer,
	"file_url" text NOT NULL,
	"file_name" varchar(255),
	"mime_type" varchar(100),
	"file_size" integer,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medication_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text,
	"common_dosage" varchar(200),
	"is_common" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pet_id" integer,
	"type" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"resolved_at" timestamp,
	"resolved_by_id" integer,
	"resolution_notes" text,
	"related_log_id" integer,
	"related_event_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_feeding_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"feeding_date" timestamp NOT NULL,
	"meal_type" varchar(20) NOT NULL,
	"amount_grams" integer NOT NULL,
	"consumption" varchar(20) NOT NULL,
	"notes" text,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"flag_id" integer NOT NULL,
	"assigned_by_id" integer,
	"assigned_by_rule" integer,
	"notes" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_food_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"food_plan_id" integer,
	"brand" varchar(200) NOT NULL,
	"product_name" varchar(200),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"acceptance" varchar(20),
	"digestion" varchar(20),
	"stool_quality" varchar(20),
	"coat_condition" varchar(20),
	"energy_level" varchar(20),
	"allergic_reaction" boolean DEFAULT false,
	"allergic_details" text,
	"overall_rating" integer,
	"notes" text,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_food_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"brand" varchar(200) NOT NULL,
	"product_name" varchar(200),
	"quantity_received" integer NOT NULL,
	"quantity_remaining" integer NOT NULL,
	"received_date" timestamp DEFAULT now() NOT NULL,
	"expiration_date" timestamp,
	"batch_number" varchar(100),
	"notes" text,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_food_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"food_type" varchar(50) NOT NULL,
	"brand" varchar(200) NOT NULL,
	"product_name" varchar(200),
	"daily_amount" integer NOT NULL,
	"portions_per_day" integer DEFAULT 2 NOT NULL,
	"portion_times" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"medication_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"dosage" varchar(200) NOT NULL,
	"frequency" varchar(100),
	"administration_times" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_natural_food" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"meal_type" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"ingredients" text,
	"protein_source" varchar(200),
	"portion_size" integer,
	"frequency" varchar(50),
	"preparation_notes" text,
	"acceptance" varchar(20),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_social_circle" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"related_pet_id" integer NOT NULL,
	"relationship_type" varchar(20) NOT NULL,
	"notes" text,
	"severity" varchar(20),
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_training_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"status" varchar(20) NOT NULL,
	"last_practiced" timestamp,
	"notes" text,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_treats" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"treat_type" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"brand" varchar(200),
	"purpose" varchar(100),
	"frequency" varchar(50),
	"max_per_day" integer,
	"calories_per_unit" integer,
	"acceptance" varchar(20),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_tutors" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_vaccinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"vaccine_id" integer NOT NULL,
	"application_date" timestamp NOT NULL,
	"next_due_date" timestamp,
	"dose_number" integer DEFAULT 1,
	"veterinarian" varchar(200),
	"clinic" varchar(200),
	"notes" text,
	"document_url" text,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_weight_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"weight" integer NOT NULL,
	"measured_at" timestamp NOT NULL,
	"notes" text,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"breed" varchar(100),
	"species" varchar(50) DEFAULT 'dog' NOT NULL,
	"birth_date" timestamp,
	"weight" integer,
	"photo_url" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"approval_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"size" varchar(20),
	"coat_type" varchar(30),
	"is_castrated" boolean,
	"last_heat_date" timestamp,
	"sex" varchar(10),
	"energy_level" varchar(20),
	"dog_sociability" varchar(20),
	"human_sociability" varchar(20),
	"play_style" varchar(20),
	"correction_sensitivity" varchar(20),
	"human_focus" varchar(20),
	"fear_triggers" jsonb DEFAULT '[]'::jsonb,
	"calming_technique" varchar(30),
	"equipment_restrictions" jsonb DEFAULT '[]'::jsonb,
	"sociability_level" varchar(20),
	"anxiety_separation" varchar(20),
	"room_preference" varchar(50),
	"convivence_restrictions" jsonb DEFAULT '[]'::jsonb,
	"confidence_level" integer,
	"impulsivity_level" integer,
	"resilience_level" integer,
	"food_brand" varchar(200),
	"food_type" varchar(50),
	"food_amount" integer,
	"food_stock_grams" integer,
	"food_stock_last_update" timestamp,
	"feeding_instructions" text,
	"food_preparation" varchar(30),
	"has_food_allergy" boolean,
	"food_allergy_details" text,
	"has_medication_allergy" boolean,
	"medication_allergy_details" text,
	"has_chronic_condition" boolean,
	"chronic_condition_details" text,
	"emergency_vet_name" varchar(200),
	"emergency_vet_phone" varchar(50),
	"emergency_vet_address" text,
	"severe_allergies" text,
	"medical_conditions" text,
	"credits" integer DEFAULT 0 NOT NULL,
	"admin_locked_fields" jsonb DEFAULT '[]'::jsonb,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preventive_treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"application_date" timestamp NOT NULL,
	"next_due_date" timestamp,
	"dosage" varchar(100),
	"notes" text,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rule_execution_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer NOT NULL,
	"pet_id" integer,
	"trigger_data" text,
	"action_result" text,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_log_id" integer NOT NULL,
	"document_id" integer,
	"file_url" text NOT NULL,
	"file_name" varchar(255),
	"mime_type" varchar(100),
	"file_size" integer,
	"file_type" varchar(20),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_commands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"difficulty" varchar(20),
	"steps" text,
	"tips" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"log_date" timestamp NOT NULL,
	"command" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"success_rate" integer,
	"duration" integer,
	"treats" integer,
	"method" varchar(100),
	"notes" text,
	"video_url" text,
	"attachments" text,
	"source" varchar(10) DEFAULT 'admin' NOT NULL,
	"created_by_user_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer,
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"credits" integer,
	"description" text,
	"stripe_payment_id" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"phone" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"approval_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"onboarding_status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"invited_by" integer,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vaccine_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"interval_days" integer,
	"doses_required" integer DEFAULT 1,
	"is_common" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wall_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wall_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wall_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"pet_id" integer,
	"content" text NOT NULL,
	"image_url" text,
	"visibility" varchar(50) DEFAULT 'all' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"access_token" text,
	"phone_number_id" text,
	"business_account_id" text,
	"webhook_verify_token" text,
	"display_phone_number" text,
	"verified_name" text,
	"quality_rating" varchar(20),
	"is_active" boolean DEFAULT false NOT NULL,
	"last_verified_at" timestamp,
	"auto_notify_checkin" boolean DEFAULT false NOT NULL,
	"auto_notify_checkout" boolean DEFAULT false NOT NULL,
	"auto_notify_daily_log" boolean DEFAULT false NOT NULL,
	"auto_notify_booking" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_config_admin_id_unique" UNIQUE("admin_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_id" integer NOT NULL,
	"to_phone" text NOT NULL,
	"to_name" text,
	"pet_id" integer,
	"message_type" varchar(50) NOT NULL,
	"template_name" text,
	"content" text,
	"message_id" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"context" varchar(50),
	"sent_by_id" integer,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "behavior_attachments" ADD CONSTRAINT "behavior_attachments_behavior_log_id_behavior_logs_id_fk" FOREIGN KEY ("behavior_log_id") REFERENCES "public"."behavior_logs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "behavior_attachments" ADD CONSTRAINT "behavior_attachments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "behavior_logs" ADD CONSTRAINT "behavior_logs_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "behavior_logs" ADD CONSTRAINT "behavior_logs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "behavior_logs" ADD CONSTRAINT "behavior_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_rules" ADD CONSTRAINT "business_rules_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_best_friend_pet_id_pets_id_fk" FOREIGN KEY ("best_friend_pet_id") REFERENCES "public"."pets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dynamic_flags" ADD CONSTRAINT "dynamic_flags_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log_attachments" ADD CONSTRAINT "log_attachments_log_id_daily_logs_id_fk" FOREIGN KEY ("log_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log_attachments" ADD CONSTRAINT "log_attachments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_alerts" ADD CONSTRAINT "pet_alerts_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_alerts" ADD CONSTRAINT "pet_alerts_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_alerts" ADD CONSTRAINT "pet_alerts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_feeding_logs" ADD CONSTRAINT "pet_feeding_logs_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_feeding_logs" ADD CONSTRAINT "pet_feeding_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_flags" ADD CONSTRAINT "pet_flags_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_flags" ADD CONSTRAINT "pet_flags_flag_id_dynamic_flags_id_fk" FOREIGN KEY ("flag_id") REFERENCES "public"."dynamic_flags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_flags" ADD CONSTRAINT "pet_flags_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_flags" ADD CONSTRAINT "pet_flags_assigned_by_rule_business_rules_id_fk" FOREIGN KEY ("assigned_by_rule") REFERENCES "public"."business_rules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_history" ADD CONSTRAINT "pet_food_history_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_history" ADD CONSTRAINT "pet_food_history_food_plan_id_pet_food_plans_id_fk" FOREIGN KEY ("food_plan_id") REFERENCES "public"."pet_food_plans"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_history" ADD CONSTRAINT "pet_food_history_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_inventory" ADD CONSTRAINT "pet_food_inventory_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_inventory" ADD CONSTRAINT "pet_food_inventory_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_plans" ADD CONSTRAINT "pet_food_plans_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_plans" ADD CONSTRAINT "pet_food_plans_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_food_plans" ADD CONSTRAINT "pet_food_plans_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_medications" ADD CONSTRAINT "pet_medications_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_medications" ADD CONSTRAINT "pet_medications_medication_id_medication_library_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medication_library"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_medications" ADD CONSTRAINT "pet_medications_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_natural_food" ADD CONSTRAINT "pet_natural_food_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_natural_food" ADD CONSTRAINT "pet_natural_food_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_social_circle" ADD CONSTRAINT "pet_social_circle_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_social_circle" ADD CONSTRAINT "pet_social_circle_related_pet_id_pets_id_fk" FOREIGN KEY ("related_pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_social_circle" ADD CONSTRAINT "pet_social_circle_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_training_skills" ADD CONSTRAINT "pet_training_skills_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_training_skills" ADD CONSTRAINT "pet_training_skills_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_treats" ADD CONSTRAINT "pet_treats_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_treats" ADD CONSTRAINT "pet_treats_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_tutors" ADD CONSTRAINT "pet_tutors_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_tutors" ADD CONSTRAINT "pet_tutors_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_vaccinations" ADD CONSTRAINT "pet_vaccinations_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_vaccinations" ADD CONSTRAINT "pet_vaccinations_vaccine_id_vaccine_library_id_fk" FOREIGN KEY ("vaccine_id") REFERENCES "public"."vaccine_library"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_vaccinations" ADD CONSTRAINT "pet_vaccinations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_weight_history" ADD CONSTRAINT "pet_weight_history_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_weight_history" ADD CONSTRAINT "pet_weight_history_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_weight_history" ADD CONSTRAINT "pet_weight_history_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preventive_treatments" ADD CONSTRAINT "preventive_treatments_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preventive_treatments" ADD CONSTRAINT "preventive_treatments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preventive_treatments" ADD CONSTRAINT "preventive_treatments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rule_execution_log" ADD CONSTRAINT "rule_execution_log_rule_id_business_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."business_rules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rule_execution_log" ADD CONSTRAINT "rule_execution_log_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_attachments" ADD CONSTRAINT "training_attachments_training_log_id_training_logs_id_fk" FOREIGN KEY ("training_log_id") REFERENCES "public"."training_logs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_attachments" ADD CONSTRAINT "training_attachments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wall_comments" ADD CONSTRAINT "wall_comments_post_id_wall_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."wall_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wall_comments" ADD CONSTRAINT "wall_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wall_likes" ADD CONSTRAINT "wall_likes_post_id_wall_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."wall_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wall_likes" ADD CONSTRAINT "wall_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wall_posts" ADD CONSTRAINT "wall_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wall_posts" ADD CONSTRAINT "wall_posts_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_config" ADD CONSTRAINT "whatsapp_config_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_config_id_whatsapp_config_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."whatsapp_config"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "behavior_logs_pet_id_idx" ON "behavior_logs" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "behavior_logs_log_date_idx" ON "behavior_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "behavior_logs_pet_date_idx" ON "behavior_logs" USING btree ("pet_id","log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_requests_status_idx" ON "booking_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_requests_pet_id_idx" ON "booking_requests" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_requests_tutor_id_idx" ON "booking_requests" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_requests_request_type_idx" ON "booking_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_requests_date_range_idx" ON "booking_requests" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_rules_is_active_idx" ON "business_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_rules_trigger_type_idx" ON "business_rules" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_rules_priority_idx" ON "business_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_settings_key_idx" ON "business_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_settings_category_idx" ON "business_settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_events_event_date_idx" ON "calendar_events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_events_pet_id_idx" ON "calendar_events" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_events_event_type_idx" ON "calendar_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_events_status_idx" ON "calendar_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_events_deleted_at_idx" ON "calendar_events" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "calendar_events_date_range_idx" ON "calendar_events" USING btree ("event_date","end_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_logs_pet_id_idx" ON "daily_logs" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_logs_log_date_idx" ON "daily_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_logs_source_idx" ON "daily_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_logs_log_type_idx" ON "daily_logs" USING btree ("log_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_logs_pet_date_idx" ON "daily_logs" USING btree ("pet_id","log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_pet_id_idx" ON "documents" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_category_idx" ON "documents" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_related_module_idx" ON "documents" USING btree ("related_module");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_module_related_idx" ON "documents" USING btree ("related_module","related_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dynamic_flags_is_active_idx" ON "dynamic_flags" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_alerts_pet_id_idx" ON "pet_alerts" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_alerts_alert_type_idx" ON "pet_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_alerts_severity_idx" ON "pet_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_alerts_is_active_idx" ON "pet_alerts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_feeding_logs_pet_id_idx" ON "pet_feeding_logs" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_feeding_logs_feeding_date_idx" ON "pet_feeding_logs" USING btree ("feeding_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_feeding_logs_consumption_idx" ON "pet_feeding_logs" USING btree ("consumption");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_flags_pet_id_idx" ON "pet_flags" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_flags_flag_id_idx" ON "pet_flags" USING btree ("flag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_social_circle_pet_id_idx" ON "pet_social_circle" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_social_circle_related_pet_id_idx" ON "pet_social_circle" USING btree ("related_pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_social_circle_relationship_type_idx" ON "pet_social_circle" USING btree ("relationship_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_training_skills_pet_id_idx" ON "pet_training_skills" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_training_skills_status_idx" ON "pet_training_skills" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_tutors_pet_id_idx" ON "pet_tutors" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_tutors_tutor_id_idx" ON "pet_tutors" USING btree ("tutor_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pet_tutors_pet_tutor_unique" ON "pet_tutors" USING btree ("pet_id","tutor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_weight_history_pet_id_idx" ON "pet_weight_history" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_weight_history_measured_at_idx" ON "pet_weight_history" USING btree ("measured_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_status_idx" ON "pets" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_approval_status_idx" ON "pets" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_species_idx" ON "pets" USING btree ("species");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_deleted_at_idx" ON "pets" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_energy_level_idx" ON "pets" USING btree ("energy_level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_room_preference_idx" ON "pets" USING btree ("room_preference");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pets_dog_sociability_idx" ON "pets" USING btree ("dog_sociability");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rule_execution_log_rule_id_idx" ON "rule_execution_log" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rule_execution_log_pet_id_idx" ON "rule_execution_log" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rule_execution_log_executed_at_idx" ON "rule_execution_log" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_logs_pet_id_idx" ON "training_logs" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_logs_log_date_idx" ON "training_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_logs_category_idx" ON "training_logs" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_logs_status_idx" ON "training_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_logs_pet_date_idx" ON "training_logs" USING btree ("pet_id","log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_approval_status_idx" ON "users" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_config_admin_id_idx" ON "whatsapp_config" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_config_is_active_idx" ON "whatsapp_config" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_config_id_idx" ON "whatsapp_messages" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_pet_id_idx" ON "whatsapp_messages" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_status_idx" ON "whatsapp_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_context_idx" ON "whatsapp_messages" USING btree ("context");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_created_at_idx" ON "whatsapp_messages" USING btree ("created_at");