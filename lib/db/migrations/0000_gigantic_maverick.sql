CREATE TABLE "prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"description" text,
	"category" text,
	"tags" text[],
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"upvotes" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_upvotes" (
	"user_id" text NOT NULL,
	"prompt_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_upvotes_user_id_prompt_id_pk" PRIMARY KEY("user_id","prompt_id")
);
--> statement-breakpoint
ALTER TABLE "user_upvotes" ADD CONSTRAINT "user_upvotes_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;