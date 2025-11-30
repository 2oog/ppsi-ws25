ALTER TABLE "tutors" ADD COLUMN "certificate_file_paths" json;--> statement-breakpoint
ALTER TABLE "tutors" DROP COLUMN IF EXISTS "certificate_file_path";