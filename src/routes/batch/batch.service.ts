import { DepartmentEnum, PrismaClient } from "@prisma/client";
import { BatchDto } from "../../payload/request/batchDto";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();
//create default select for all service
const selectDefault = {
  id: true,
  department: true,
  batchNum: true,
  createdAt: true,
  updatedAt: true,
};
//create  batch service
async function createBatchService(batch: BatchDto) {
  const checkBatch = await prisma.batch.findUnique({
    where: {
      department_batchNum: {
        department: batch.department,
        batchNum: batch.batchNum,
      },
    },
  });
  if (checkBatch) {
    throw new CustomError(409, "Batch already exist");
  }
  return await prisma.batch.create({
    data: {
      batchNum: batch.batchNum,
      department: batch.department,
    },
    select: selectDefault,
  });
}

//get all batch
async function getAllBatchServie() {
  return await prisma.batch.findMany({
    select: selectDefault,
    orderBy: [
      {
        department: "asc",
      },
      {
        batchNum: "asc",
      },
    ],
  });
}
//get batch by id
async function getBatchByIdService(id: string) {
  return await prisma.batch.findUnique({
    where: {
      id,
    },
    select: selectDefault,
  });
}
//delete batch by id
async function deleteBatchService(id: string) {
  const check = await prisma.batch.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(204, "Batch not found");
  return await prisma.batch.delete({
    where: {
      id,
    },
    select: selectDefault,
  });
}

//update batch by id
async function updateBatchService(id: string, batch: BatchDto) {
  const check = await prisma.batch.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(204, "Batch not found");
  return await prisma.batch.update({
    where: {
      id,
    },
    data: {
      batchNum: batch.batchNum,
      department: batch.department,
    },
    select: selectDefault,
  });
}
async function getBatchByDepartmentService(department: string) {
  return await prisma.batch.findMany({
    where: {
      department: department.toUpperCase() as DepartmentEnum,
    },
    select: selectDefault,
  });
}
export default {
  getBatchByDepartmentService,
  createBatchService,
  getAllBatchServie,
  getBatchByIdService,
  deleteBatchService,
  updateBatchService,
};
