import { PrismaClient } from "@prisma/client";
import { SubLocationDto } from "../../payload/request/subLocatonDto";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();

const selectDefault = {
  id: true,
  subLocationName: true,
  mainLocation: {
    select: {
      id: true,
      mainLocationName: true,
    },
  },
};
async function createSubLocationService(subLocation: SubLocationDto) {
  const check = await prisma.subLocation.findUnique({
    where: {
      mainLocationId_subLocationName: {
        subLocationName: subLocation.subLocationName.toLowerCase(),
        mainLocationId: subLocation.mainLocationId,
      },
    },
  });
  if (check) throw new CustomError(409, "Sub Location already exist");
  const data = await prisma.subLocation.create({
    data: {
      subLocationName: subLocation.subLocationName.toLowerCase(),
      mainLocationId: subLocation.mainLocationId,
    },
    select: selectDefault,
  });
  return data;
}
async function getAllSubLocationServie() {
  return await prisma.subLocation.findMany({
    select: selectDefault,
    orderBy: {
      createdAt: "desc",
    },
  });
}
async function getPaginatedAllSubLocationServie(limit: number, page: number) {
  const total = await prisma.subLocation.count();
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);
  const res = await prisma.subLocation.findMany({
    take: limit,
    skip: (page - 1) * limit,
    select: selectDefault,
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
async function getSubLocationByIdService(id: string) {
  return await prisma.subLocation.findUnique({
    where: {
      id: id,
    },
    select: selectDefault,
  });
}
async function deleteSubLocationService(id: string) {
  const check = await prisma.subLocation.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(404, "Sub Location not found");
  const isUsing = await prisma.subLocation.findUnique({
    where: {
      id,
    },
    select: {
      pickupLocation: true,
      dropLocation: true,
    },
  });
  console.log(isUsing);
  if (
    isUsing?.dropLocation &&
    isUsing.dropLocation &&
    isUsing?.pickupLocation.length + isUsing?.dropLocation.length !== 0
  ) {
    throw new CustomError(409, "Cannot delete, sub location is in use now.");
  }

  return await prisma.subLocation.delete({
    where: {
      id: id,
    },
    select: selectDefault,
  });
}

async function updateSubLocationService(
  sublocation: SubLocationDto,
  id: string
) {
  const check = await prisma.subLocation.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(404, "Sub Location not found");
  return await prisma.subLocation.update({
    where: {
      id: id,
    },
    data: {
      subLocationName: sublocation.subLocationName.toLowerCase(),
      mainLocationId: sublocation.mainLocationId,
    },
    select: selectDefault,
  });
}
async function getSubLocationByMainLocationIdService(id: string) {
  return await prisma.subLocation.findMany({
    where: {
      mainLocationId: id,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: selectDefault,
  });
}

async function getSubLocationIdByNameService(name: string) {
  const check = await prisma.subLocation.findUnique({
    where: {
      subLocationName: name,
    },
  });

  return check;
}

export default {
  createSubLocationService,
  getAllSubLocationServie,
  getPaginatedAllSubLocationServie,
  getSubLocationByIdService,
  deleteSubLocationService,
  updateSubLocationService,
  getSubLocationByMainLocationIdService,
  getSubLocationIdByNameService,
};
