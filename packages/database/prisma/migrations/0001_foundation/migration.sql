-- CreateTable
CREATE TABLE "Organization" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Organization_pkey" PRIMARY KEY ("id"));
CREATE TABLE "User" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Membership" ("id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "userId" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Membership_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "actorUserId" TEXT, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT, "requestId" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Membership_organizationId_userId_key" ON "Membership"("organizationId", "userId");
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");
CREATE INDEX "AuditLog_organizationId_entityType_entityId_idx" ON "AuditLog"("organizationId", "entityType", "entityId");
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
