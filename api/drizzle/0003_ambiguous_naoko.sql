CREATE TABLE "attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributes_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stocks_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "variant_attributes" (
	"product_variant_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "variant_attributes_attribute_id_product_variant_id_pk" PRIMARY KEY("attribute_id","product_variant_id")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products_variations" ADD COLUMN "sku" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "attributes_values" ADD CONSTRAINT "attributes_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_variant_id_products_variations_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."products_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_product_variant_id_products_variations_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."products_variations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products_variations" DROP COLUMN "size";--> statement-breakpoint
ALTER TABLE "products_variations" DROP COLUMN "color";--> statement-breakpoint
ALTER TABLE "products_variations" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "products_variations" DROP COLUMN "dimensions";--> statement-breakpoint
ALTER TABLE "products_variations" DROP COLUMN "stock";