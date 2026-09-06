-- CreateIndex
CREATE UNIQUE INDEX "GSTReturnPeriod_businessId_period_returnType_key" ON "GSTReturnPeriod"("businessId", "period", "returnType");
