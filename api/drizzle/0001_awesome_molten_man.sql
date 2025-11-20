ALTER TYPE "public"."plan_status" ADD VALUE 'REFUNDED';--> statement-breakpoint
ALTER TABLE "store_branches" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "store_branches" CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "store_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_branch_id_store_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_store_id_stores_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "branch_id";