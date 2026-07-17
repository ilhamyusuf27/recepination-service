-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "email_token_expires_at" TIMESTAMP(3),
ADD COLUMN "password_reset_token" TEXT,
ADD COLUMN "password_reset_expires_at" TIMESTAMP(3),
ADD COLUMN "photo_path" TEXT,
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Recipe"
ALTER COLUMN "instructions" SET DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "image_path" TEXT;

-- AlterTable
ALTER TABLE "Ingredient"
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Comment"
ADD COLUMN "parentId" UUID;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_user_id_idx" ON "Recipe"("user_id");
CREATE INDEX "Recipe_created_at_idx" ON "Recipe"("created_at");
CREATE INDEX "Ingredient_recipeId_idx" ON "Ingredient"("recipeId");
CREATE INDEX "RecipeCategory_categoryId_idx" ON "RecipeCategory"("categoryId");
CREATE INDEX "Favorite_recipeId_idx" ON "Favorite"("recipeId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "RefreshToken"("token_hash");
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");
CREATE INDEX "RefreshToken_expires_at_idx" ON "RefreshToken"("expires_at");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
