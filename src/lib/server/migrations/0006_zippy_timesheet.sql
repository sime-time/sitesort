CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT auth.user_id () NOT NULL,
	"clock_in" timestamp with time zone NOT NULL,
	"clock_out" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "time_entries_clock_order_check" CHECK ("clock_out" IS NULL OR "clock_out" >= "clock_in")
);
--> statement-breakpoint
CREATE INDEX "time_entries_user_clock_in_idx" ON "time_entries" USING btree ("user_id","clock_in" DESC);
