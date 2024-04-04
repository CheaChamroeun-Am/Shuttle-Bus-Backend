-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('SUPERADMIN', 'ADMIN', 'STUDENT', 'STAFF', 'CUSTOMER', 'DRIVER');

-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "DepartmentEnum" AS ENUM ('SOFTWAREENGINEERING', 'TOURISMANDMANAGEMENT', 'ARCHITECTURE');

-- CreateEnum
CREATE TYPE "BookingStatusEnum" AS ENUM ('BOOKED', 'USED');

-- CreateEnum
CREATE TYPE "WaitingStatusEnum" AS ENUM ('WAITING', 'USED');

-- CreateTable
CREATE TABLE "Cost" (
    "id" TEXT NOT NULL,
    "targetPeople" TEXT NOT NULL,
    "costPerPerson" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "department" "DepartmentEnum",
    "batchNum" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CustomerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT,

    CONSTRAINT "StudentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StaffInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AdminInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdminInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SuperAdminInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "remainTicket" INTEGER NOT NULL DEFAULT 36,
    "ticketLimitInhand" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DriverInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "password" TEXT,
    "googlePassword" TEXT,
    "role" "RoleEnum" NOT NULL,
    "phone" TEXT,
    "gender" "GenderEnum",
    "inKRR" BOOLEAN DEFAULT true,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "numOfSeat" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverContact" TEXT NOT NULL,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "payStatus" BOOLEAN NOT NULL DEFAULT false,
    "status" "BookingStatusEnum" NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "numberBooking" INTEGER NOT NULL,
    "adult" INTEGER NOT NULL,
    "child" INTEGER NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "remark" TEXT,
    "scheduleId" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ManualBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "departureId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "availableSeat" INTEGER DEFAULT 24,
    "busId" TEXT,
    "enable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancel" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Cancel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "payStatus" BOOLEAN NOT NULL DEFAULT false,
    "status" "WaitingStatusEnum" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Waitting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departure" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "departureTime" TIME(0) NOT NULL,
    "pickupLocationId" TEXT NOT NULL,
    "dropLocationId" TEXT NOT NULL,

    CONSTRAINT "Departure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainLocation" (
    "id" TEXT NOT NULL,
    "mainLocationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MainLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubLocation" (
    "id" TEXT NOT NULL,
    "subLocationName" TEXT NOT NULL,
    "mainLocationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SubLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cost_targetPeople_key" ON "Cost"("targetPeople");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_department_batchNum_key" ON "Batch"("department", "batchNum");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInfo_userId_key" ON "CustomerInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentInfo_userId_key" ON "StudentInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffInfo_userId_key" ON "StaffInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInfo_userId_key" ON "AdminInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdminInfo_userId_key" ON "SuperAdminInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_userId_key" ON "Ticket"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverInfo_userId_key" ON "DriverInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_plateNumber_key" ON "Bus"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_model_plateNumber_driverName_driverContact_numOfSeat_key" ON "Bus"("model", "plateNumber", "driverName", "driverContact", "numOfSeat");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_userId_scheduleId_key" ON "Booking"("userId", "scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_departureId_date_busId_key" ON "Schedule"("departureId", "date", "busId");

-- CreateIndex
CREATE UNIQUE INDEX "Waitting_userId_scheduleId_key" ON "Waitting"("userId", "scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Departure_fromId_destinationId_departureTime_key" ON "Departure"("fromId", "destinationId", "departureTime");

-- CreateIndex
CREATE UNIQUE INDEX "MainLocation_mainLocationName_key" ON "MainLocation"("mainLocationName");

-- CreateIndex
CREATE UNIQUE INDEX "SubLocation_subLocationName_key" ON "SubLocation"("subLocationName");

-- CreateIndex
CREATE UNIQUE INDEX "SubLocation_mainLocationId_subLocationName_key" ON "SubLocation"("mainLocationId", "subLocationName");

-- AddForeignKey
ALTER TABLE "CustomerInfo" ADD CONSTRAINT "CustomerInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInfo" ADD CONSTRAINT "StudentInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInfo" ADD CONSTRAINT "StudentInfo_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffInfo" ADD CONSTRAINT "StaffInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInfo" ADD CONSTRAINT "AdminInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperAdminInfo" ADD CONSTRAINT "SuperAdminInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverInfo" ADD CONSTRAINT "DriverInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualBooking" ADD CONSTRAINT "ManualBooking_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "Departure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancel" ADD CONSTRAINT "Cancel_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancel" ADD CONSTRAINT "Cancel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitting" ADD CONSTRAINT "Waitting_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitting" ADD CONSTRAINT "Waitting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "MainLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "MainLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "SubLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_dropLocationId_fkey" FOREIGN KEY ("dropLocationId") REFERENCES "SubLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubLocation" ADD CONSTRAINT "SubLocation_mainLocationId_fkey" FOREIGN KEY ("mainLocationId") REFERENCES "MainLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
