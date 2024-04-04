import { PrismaClient } from "@prisma/client";
import { DepartureDto } from "./../../payload/request/departureDto";
import { ResponseDepartureDto } from "../../payload/respone/departureResponseDto";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();

//create default select for all service
const selectDefault = {
  id: true,
  departureTime: true,
  from: {
    select: {
      id: true,
      mainLocationName: true,
    },
  },
  destination: {
    select: {
      id: true,
      mainLocationName: true,
    },
  },
  pickupLocation: {
    select: {
      id: true,
      subLocationName: true,
    },
  },
  dropLocation: {
    select: {
      id: true,
      subLocationName: true,
    },
  },
};

// get departure by unigue fromId, destinationId, departureTime --> for checking to prevent duplicate data whhen create or update
async function getDepartureByFromIdDestinationIdAndDepartureTime(
  fromId: string,
  destinationId: string,
  departureTime: Date
) {
  return await prisma.departure.findUnique({
    where: {
      fromId_destinationId_departureTime: {
        fromId,
        destinationId,
        departureTime,
      },
    },
  });
}

// create
async function createDepartureService(departure: DepartureDto) {
  // -- check existing:
  const existingDeparture =
    await getDepartureByFromIdDestinationIdAndDepartureTime(
      departure.fromId,
      departure.destinationId,
      departure.departureTime
    );

  if (existingDeparture) {
    throw new CustomError(409, "Departure is already existed");
  }
  const departureData = await prisma.departure.create({
    data: departure,
    select: selectDefault,
  });
  return departureData;
}

// delete departure by Id:
async function deleteDepartureByIdService(id: string) {
  const departureData = await prisma.departure.delete({
    where: {
      id,
    },
    select: selectDefault,
  });
  if (!departureData) {
    throw new CustomError(204, "no data");
  }
  return departureData;
}

// get departure:
async function getDepartureByIdService(id: string) {
  const departureData = await prisma.departure.findUnique({
    where: {
      id,
    },
    select: selectDefault,
  });

  return departureData;
}

// get all departure:
async function getAllDepatureService() {
  const listDeparture = await prisma.departure.findMany({
    select: selectDefault,
  });

  return listDeparture;
}

async function getPaginatedAllDepatureService(limit: number, page: number) {
  const res = await prisma.departure.findMany({
    take: limit,
    skip: (page - 1) * limit,
    select: selectDefault,
  });
  const total = await prisma.departure.count();
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);

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

// update Departure:
async function updateDepartureByIdService(id: string, departure: DepartureDto) {
  // -- check existing:
  const existingDeparture =
    await getDepartureByFromIdDestinationIdAndDepartureTime(
      departure.fromId,
      departure.destinationId,
      departure.departureTime
    );

  // to throw error when update data that already exist
  if (existingDeparture) {
    throw new CustomError(409, "Departure already existed");
  }
  const departureData = await prisma.departure.update({
    where: {
      id,
    },
    data: departure,
    select: selectDefault,
  });
  return departureData;
}

export default {
  createDepartureService,
  getDepartureByIdService,
  getAllDepatureService,
  getPaginatedAllDepatureService,
  updateDepartureByIdService,
  deleteDepartureByIdService,
  getDepartureByFromIdDestinationIdAndDepartureTime,
};
