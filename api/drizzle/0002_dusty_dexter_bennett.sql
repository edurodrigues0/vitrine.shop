CREATE TABLE "store_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_visits" ADD CONSTRAINT "store_visits_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;