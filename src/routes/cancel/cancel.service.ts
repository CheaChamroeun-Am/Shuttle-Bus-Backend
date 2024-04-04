import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();
async function getAllCancelService() {
  return await prisma.cancel.findMany();
}
async function getPaginatedAllCancelService(limit: number, page: number) {
  const total = await prisma.cancel.count();
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);
  const res = await prisma.cancel.findMany({
    take: limit,
    skip: (page - 1) * limit,
  });
  return {
    pagination: {
      totalData: total,
      totalPages: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: res,
  };
}
async function getCancelByScheduleIdService(id: string) {
  return await prisma.cancel.findMany({
    where: {
      scheduleId: id,
    },
  });
}
async function getPaginatedCancelByScheduleIdService(
  id: string,
  limit: number,
  page: number
) {
  const total = await prisma.cancel.count({
    where: {
      scheduleId: id,
    },
  });
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);
  const res = await prisma.cancel.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      scheduleId: id,
    },
  });
  return {
    pagination: {
      totalData: total,
      totalPages: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: res,
  };
}
export default {
  getAllCancelService,
  getPaginatedAllCancelService,
  getCancelByScheduleIdService,
  getPaginatedCancelByScheduleIdService,
};
