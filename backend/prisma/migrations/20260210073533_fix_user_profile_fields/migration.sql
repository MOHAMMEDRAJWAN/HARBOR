-- 1️⃣ Fix existing rows that violate the new constraint
UPDATE "User"
SET "name" = 'Unknown User'
WHERE "name" IS NULL;

-- 2️⃣ Now safely enforce NOT NULL
ALTER TABLE "User"
ALTER COLUMN "name" SET NOT NULL;
