-- CreateTable
CREATE TABLE "login_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "deviceType" VARCHAR(50),
    "browser" VARCHAR(100),
    "location" VARCHAR(255),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "login_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_verifications_token_key" ON "login_verifications"("token");

-- AddForeignKey
ALTER TABLE "login_verifications" ADD CONSTRAINT "login_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
