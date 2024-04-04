import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();
const selectWaitingDefault = {
  id: true,
  payStatus: true,
  status: true,
  schedule: {
    select: {
      id: true,
      date: true,
      departure: {
        select: {
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
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      phone: true,
      gender: true,
      inKRR: true,
      enable: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};
// done
async function getAllWaitingService() {
  const data = await prisma.waitting.findMany({
    where: {
      status: "WAITING",
    },
    select: selectWaitingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });
  return data;
}

async function getPaginatedAllWaitingService(limit: number, page: number) {
  const res = await prisma.waitting.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      status: "WAITING",
    },
    select: selectWaitingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });
  const total = await prisma.waitting.count({
    where: {
      status: "WAITING",
    },
  });
  const pages = Math.ceil(total / limit);
  if (page > pages) {
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
  }
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

// done
async function getWaitingByScheduleIdService(id: string) {
  const data = await prisma.waitting.findMany({
    where: {
      AND: [{ scheduleId: id }, { status: "WAITING" }],
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
            },
          },
        },
      },
      user: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return data;
}
async function getPaginatedWaitingByScheduleIdService(
  id: string,
  limit: number,
  page: number
) {
  const res = await prisma.waitting.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      AND: [{ scheduleId: id }, { status: "WAITING" }],
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
            },
          },
        },
      },
      user: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const total = await prisma.waitting.count({
    where: {
      AND: [{ scheduleId: id }, { status: "WAITING" }],
    },
  });
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
// done
async function deleteAllWaitingService() {
  return await prisma.waitting.deleteMany();
}

async function deleteWaitingByScheduleId(scheduleId: string) {
  return await prisma.waitting.deleteMany({
    where: {
      scheduleId,
    },
  });
}

async function getAllWaitingByUserIdService(userId: string) {
  const data = await prisma.waitting.findMany({
    where: {
      AND: [{ userId: userId }, { status: "WAITING" }],
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
              dropLocation: true,
              departureTime: true,
              pickupLocation: true,
            },
          },
          bus: {
            select: {
              id: true,
              model: true,
              plateNumber: true,
              numOfSeat: true,
              driverName: true,
              driverContact: true,
            },
          },
        },
      },

      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return data;
}
export default {
  getAllWaitingByUserIdService,
  getAllWaitingService,
  getPaginatedAllWaitingService,
  getWaitingByScheduleIdService,
  getPaginatedWaitingByScheduleIdService,
  deleteAllWaitingService,
  deleteWaitingByScheduleId,
};
