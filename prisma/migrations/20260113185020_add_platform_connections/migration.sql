-- AlterTable
ALTER TABLE "links" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformConnectionId" TEXT;

-- CreateTable
CREATE TABLE "platform_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "platformUserId" VARCHAR(255) NOT NULL,
    "platformUsername" VARCHAR(255) NOT NULL,
    "profileUrl" VARCHAR(500) NOT NULL,
    "displayName" VARCHAR(255),
    "avatarUrl" VARCHAR(500),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_connections_userId_platform_key" ON "platform_connections"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "platform_connections_platform_platformUserId_key" ON "platform_connections"("platform", "platformUserId");

-- AddForeignKey
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "platform_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
