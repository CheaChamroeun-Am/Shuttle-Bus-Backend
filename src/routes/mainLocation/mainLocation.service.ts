import { PrismaClient } from "@prisma/client";
import { MainLocationDto } from "../../payload/request/mainLocationDto";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();

// Select default
const selectMainWithSubLocationDefault = {
  id: true,
  createdAt: true,
  updatedAt: true,
  mainLocationName: true,
  SubLocation: {
    select: {
      id: true,
      subLocationName: true,
    },
  },
};

async function createMainLocationService(mainlocation: MainLocationDto) {
  const check = await prisma.mainLocation.findUnique({
    where: {
      mainLocationName: mainlocation.mainLocationName.toLowerCase(),
    },
  });
  if (check) throw new CustomError(409, "Main Location already exist");
  return await prisma.mainLocation.create({
    data: {
      mainLocationName: mainlocation.mainLocationName.toLowerCase(),
    },
    select: selectMainWithSubLocationDefault,
  });
}
async function getAllMainLocationServie() {
  return await prisma.mainLocation.findMany({
    select: selectMainWithSubLocationDefault,
    orderBy: {
      createdAt: "desc",
    },
  });
}
async function getPaginatedAllMainLocationServie(limit: number, page: number) {
  const total = await prisma.mainLocation.count();
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);
  const res = await prisma.mainLocation.findMany({
    take: limit,
    skip: (page - 1) * limit,
    select: selectMainWithSubLocationDefault,
    orderBy: {
      createdAt: "desc",
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
async function getMainLocationByIdService(id: string) {
  return await prisma.mainLocation.findUnique({
    where: {
      id: id,
    },
    select: selectMainWithSubLocationDefault,
  });
}
async function deleteMainLocationService(id: string) {
  const check = await prisma.mainLocation.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(404, "Main Location not found");
  return await prisma.mainLocation.delete({
    where: {
      id: id,
    },
    select: selectMainWithSubLocationDefault,
  });
}
async function updateMainLocationService(
  id: string,
  mainlocation: MainLocationDto
) {
  const check = await prisma.mainLocation.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(404, "Main Location not found");
  return await prisma.mainLocation.update({
    where: {
      id: id,
    },
    data: {
      mainLocationName: mainlocation.mainLocationName.toLowerCase(),
    },
    select: selectMainWithSubLocationDefault,
  });
}

async function getMainLocationIdByNameService(name: string) {
  const check = await prisma.mainLocation.findUnique({
    where: {
      mainLocationName: name,
    },
  });
  return check;
}

export default {
  createMainLocationService,
  getAllMainLocationServie,
  getPaginatedAllMainLocationServie,
  getMainLocationByIdService,
  deleteMainLocationService,
  updateMainLocationService,
  getMainLocationIdByNameService,
};
