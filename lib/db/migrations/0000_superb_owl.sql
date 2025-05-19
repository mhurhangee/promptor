CREATE TABLE "prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"description" text,
	"category" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
