import { PrismaClient } from "@prisma/client";
import { BusDto } from "../../payload/request/busDto";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();
//create default select for all service
const selectDefault = {
  id: true,
  createdAt: true,
  updatedAt: true,
  driverName: true,
  driverContact: true,
  model: true,
  enable: true,
  numOfSeat: true,
  plateNumber: true,
};

async function createBusService(bus: BusDto) {
  const existingPlateNumber = await prisma.bus.findUnique({
    where: {
      plateNumber: bus.plateNumber,
    },
  });
  if (existingPlateNumber) {
    throw new CustomError(409, "Bus already exist with PlateNumber");
  }
  const check = await prisma.bus.findUnique({
    where: {
      model_plateNumber_driverName_driverContact_numOfSeat: {
        model: bus.model,
        plateNumber: bus.plateNumber,
        driverName: bus.driverName,
        driverContact: bus.driverContact,
        numOfSeat: bus.numOfSeat,
      },
    },
  });
  if (check) {
    throw new CustomError(409, "Bus already exist");
  }
  return await prisma.bus.create({
    data: {
      driverName: bus.driverName,
      driverContact: bus.driverContact,
      model: bus.model,
      numOfSeat: bus.numOfSeat,
      plateNumber: bus.plateNumber,
      updatedAt: null,
    },
    select: selectDefault,
  });
}
async function getAllBusServie() {
  return await prisma.bus.findMany({
    select: selectDefault,
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getPaginatedAllBusServie(limit: number, page: number) {
  const res = await prisma.bus.findMany({
    take: limit,
    skip: (page - 1) * limit,
    select: selectDefault,
    orderBy: {
      createdAt: "desc",
    },
  });
  const total = await prisma.bus.count();
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
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
async function getBusByIdService(id: string) {
  return await prisma.bus.findUnique({
    where: {
      id: id,
    },
    select: selectDefault,
  });
}
async function deleteBusService(id: string) {
  const check = await prisma.bus.findUnique({
    where: {
      id,
    },
  });
  if (!check) throw new CustomError(204, "Bus not found");
  return await prisma.bus.delete({
    where: {
      id,
    },
    select: selectDefault,
  });
}
async function updateBusService(id: string, bus: BusDto) {
  const check = await prisma.bus.findUnique({
    where: {
      id,
    },
  });

  if (!check) throw new CustomError(404, "Bus not found");

  const existingPlateNumber = await prisma.bus.findUnique({
    where: {
      plateNumber: bus.plateNumber,
    },
  });
  if (existingPlateNumber && bus.plateNumber !== check.plateNumber) {
    console.log(existingPlateNumber);
    throw new CustomError(
      409,
      "Bus already exist with PlateNumber, please choose different Platenumber."
    );
  }

  // update bus
  const updateBus = await prisma.bus.update({
    where: {
      id,
    },
    data: {
      driverName: bus.driverName,
      driverContact: bus.driverContact,
      model: bus.model,
      numOfSeat: bus.numOfSeat,
      plateNumber: bus.plateNumber,
      enable: bus.enable,
    },
    select: selectDefault,
  });

  // updateBus --> seat in schedule also update:
  await prisma.schedule.updateMany({
    where: {
      busId: updateBus.id,
    },
    data: {
      availableSeat: updateBus.numOfSeat,
    },
  });
  return updateBus;
}
export default {
  createBusService,
  getAllBusServie,
  getPaginatedAllBusServie,
  getBusByIdService,
  deleteBusService,
  updateBusService,
};
