import { DepartureDto } from "./../../payload/request/departureDto";
import { BookingStatusEnum, PrismaClient } from "@prisma/client";
import bookingService from "../booking/booking.service";
import busService from "../bus/bus.service";
import { ScheduleDto } from "./../../payload/request/scheduleDto";
import waitingService from "../waiting/waiting.service";
import mainLocationService from "../mainLocation/mainLocation.service";
import subLocationService from "../subLocation/subLocation.service";
import departureService from "../departure/departure.service";
import { mailConfirmSchedule } from "../../util/mailSender";
import { CustomError } from "../../handler/customError";
const readXlsxFile = require("read-excel-file/node");
const prisma = new PrismaClient();

const selectDefault = {
  id: true,
  date: true,
  availableSeat: true,
  departureId: true,
  enable: true,
  departure: {
    select: {
      id: true,
      departureTime: true,
      from: true,
      destination: true,
      pickupLocation: true,
      dropLocation: true,
    },
  },
  booking: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  },
  Waitting: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  },
  Cancel: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  },
  bus: true,
};

async function batchCreateScheduleService(file: any) {
  await readXlsxFile(Buffer.from(file.buffer)).then(async (data: any) => {
    for (let i = 1; i < data.length; i++) {
      var location = await mainLocationService.getMainLocationIdByNameService(
        data[i][0].toLowerCase()
      );
      if (!location) {
        location = await mainLocationService.createMainLocationService({
          mainLocationName: data[i][0].toLowerCase(),
        });
      }
      var destination =
        await mainLocationService.getMainLocationIdByNameService(
          data[i][1].toLowerCase()
        );
      if (!destination) {
        destination = await mainLocationService.createMainLocationService({
          mainLocationName: data[i][1].toLowerCase(),
        });
      }
      const time = await data[i][2];
      var pickupLocation =
        (await subLocationService.getSubLocationIdByNameService(
          data[i][3].toLowerCase()
        )) ??
        (await subLocationService.createSubLocationService({
          mainLocationId: location.id,
          subLocationName: data[i][3],
        } as SubLocationDto));
      var dropLocation =
        (await subLocationService.getSubLocationIdByNameService(
          data[i][4].toLowerCase()
        )) ??
        (await subLocationService.createSubLocationService({
          subLocationName: data[i][4],
          mainLocationId: destination.id,
        }));
      const departure = {
        fromId: location.id,
        destinationId: destination.id,
        departureTime: time,
        pickupLocationId: pickupLocation?.id,
        dropLocationId: dropLocation?.id,
      };
      const checkDeparture =
        (await departureService.getDepartureByFromIdDestinationIdAndDepartureTime(
          departure.fromId,
          departure.destinationId,
          departure.departureTime
        )) ??
        (await departureService.createDepartureService(
          departure as DepartureDto
        ));
      //schedule date
      const schedleDate = data[i][5];
      //check schedule
      const checkSchedule = await prisma.schedule.findFirst({
        where: {
          AND: [
            { departureId: checkDeparture!.id },
            { date: new Date(schedleDate) },
          ],
        },
      });
      if (!checkSchedule) {
        const schedule = {
          departureId: checkDeparture!.id,
          date: schedleDate,
        };
        const test = await prisma.schedule.create({
          data: {
            departureId: schedule.departureId,
            date: new Date(schedule.date),
            availableSeat: 24,
          },
        });
      }
    }
  });
}

// get Unique Schedule: by dapartureId and busId:
async function getScheduleByDepartureIdAndDateService(
  departureId: string,
  date: Date,
  busId: string
) {
  return await prisma.schedule.findUnique({
    where: {
      departureId_date_bus: {
        departureId: departureId,
        date: new Date(date),
        busId: busId ?? "",
      },
    },
    select: selectDefault,
  });
}

// get Unique Schedule: by dapartureId and busId:
async function getScheduleByDepartureIdDateAndBusIdService(
  departureId: string,
  date: Date,
  busId: string
) {
  return await prisma.schedule.findFirst({
    where: {
      AND: [{ departureId }, { date }, { busId }],
    },
  });
}

// get all Schedule:
async function getAllScheduleService() {
  return await prisma.schedule.findMany({
    select: selectDefault,
    orderBy: {
      date: "desc",
    },
  });
}

async function getAllSchedulePaginatedService(limit: number, page: number) {
  const total = await prisma.schedule.count();
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
  const res = await prisma.schedule.findMany({
    take: limit,
    skip: (page - 1) * limit,
    select: selectDefault,
    orderBy: {
      date: "desc",
    },
  });

  return {
    pagination: {
      totalData: total,
      totalPage: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: res,
  };
}
// get Schedule by Id:
async function getScheduleByIdService(id: string) {
  const data = await prisma.schedule.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      date: true,
      availableSeat: true,
      departureId: true,
      enable: true,
      departure: {
        select: {
          id: true,
          departureTime: true,
          from: true,
          destination: true,
          pickupLocation: true,
          dropLocation: true,
        },
      },
      booking: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      Waitting: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      Cancel: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      bus: true,
    },
  });
  return data;
}

// create schedule
async function createScheduleService(schedule: ScheduleDto) {
  const isBusIdAvailable = await busService.getBusByIdService(schedule.busId);

  // -- if busId not imput:  --> seat = 24
  if (isBusIdAvailable) {
    schedule.availableSeat = isBusIdAvailable.numOfSeat;
  }

  // -- check duplicate with 3 property:
  const existingScheduleWithBus = await getScheduleByDepartureIdAndDateService(
    schedule.departureId,
    schedule.date,
    schedule.busId
  );
  if (existingScheduleWithBus) {
    throw new CustomError(
      409,
      "Schedule is already existed with same departureId, bus and date"
    );
  }
  // -- check duplicate with 2 property:
  const existingSchedule = await prisma.schedule.findFirst({
    where: {
      AND: [
        { departureId: schedule.departureId },
        { date: new Date(schedule.date) },
      ],
    },
  });
  if (existingSchedule) {
    throw new CustomError(
      409,
      "Schedule is already existed with same departureId and date"
    );
  }
  try {
    return await prisma.schedule.create({
      data: {
        departureId: schedule.departureId,
        availableSeat: schedule.availableSeat,
        date: new Date(schedule.date),
        busId: schedule.busId || "",
      },
      select: selectDefault,
    });
  } catch (error) {
    console.log(error);
  }
}

// delete Schedule by Id:
async function deleteScheduleByIdService(id: string) {
  const schedule = await getScheduleByIdService(id);
  if (!schedule) {
    throw new CustomError(404, "Schedule not found");
  }
  const scheduleUpdate = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  console.log(scheduleUpdate);
}

// update schedule by Id :
async function updateScheduleByIdService(id: string, schedule: ScheduleDto) {
  const scheduleData = await getScheduleByIdService(id);
  if (!scheduleData) {
    throw new CustomError(401, "Bad request(schedule not found)");
  }

  // check: 3 prop
  const existingScheduleWithBus = await getScheduleByDepartureIdAndDateService(
    schedule.departureId,
    schedule.date,
    schedule.busId
  );

  if (
    existingScheduleWithBus &&
    scheduleData?.departureId === schedule.departureId &&
    scheduleData?.date === new Date(schedule.date)
  ) {
    throw new CustomError(
      409,
      "Schedule is already exist with departure, date annd bus"
    );
  }

  // check 2 prop:
  const existingSchedule = await prisma.schedule.findFirst({
    where: {
      AND: [
        { departureId: schedule.departureId },
        { date: new Date(schedule.date) },
      ],
    },
  });
  if (
    existingSchedule &&
    scheduleData?.departureId === schedule.departureId &&
    scheduleData?.date === new Date(schedule.date)
  ) {
    throw new CustomError(
      409,
      "Schedule is already exist with departure and date"
    );
  }

  // -- if busId is input: numOfSeat >= booking num
  const booking = await bookingService.getBookingByScheduleIdService(id);
  if (schedule.busId) {
    const bus = await busService.getBusByIdService(schedule.busId);
    schedule.availableSeat = bus?.numOfSeat;

    // --- if bus that assigne have numOfSeat < numOfBooking
    if (Number(bus?.numOfSeat) < booking.length) {
      throw new CustomError(
        400,
        "Can't assign bus that have number of seat less than number of booking"
      );
    }
  } else {
    schedule.availableSeat = 24;
  }

  const newSchedule = await prisma.schedule.update({
    where: {
      id,
    },
    data: {
      departureId: schedule.departureId,
      availableSeat: schedule.availableSeat,
      date: new Date(schedule.date),
      busId: schedule.busId || null,
      enable: schedule.enable,
    },
    select: selectDefault,
  });
  if (!newSchedule) throw new CustomError(404, "Fail to update schedule");
  //get all wating by scheduleId: then update to booking
  const getAllWaitingBySchedule =
    await waitingService.getWaitingByScheduleIdService(id);
  const currentSeat = Number(newSchedule.availableSeat);
  if (getAllWaitingBySchedule.length > 0 && currentSeat > booking.length) {
    const numOfNewBookingUsers = currentSeat - booking.length;
    // get new booking users --> find from waitng to put into booking:
    for (let i = 0; i < numOfNewBookingUsers; i++) {
      await prisma.booking.create({
        data: {
          userId: getAllWaitingBySchedule[i].user.id,
          scheduleId: newSchedule.id,
          payStatus: true,
          status: "BOOKED",
        },
      });
      await prisma.waitting.delete({
        where: {
          id: getAllWaitingBySchedule[i].id,
        },
      });
    }
    return newSchedule;
  } else {
    return newSchedule;
  }

  // Sync data of booking after update:

  // const numberOfBooking = booking.length;
  // // -- if busId is input: numOfSeat >= booking num
  // if (numberOfBooking < Number(newSchedule?.availableSeat)) {
  //   const numOfNewBookingUsers =
  //     Number(newSchedule?.availableSeat) - numberOfBooking;

  //   // get new booking users --> find from waitng to put into booking:
  //   const newBookingUsers = await prisma.waitting.findMany({
  //     where: {
  //       scheduleId: id,
  //     },
  //     orderBy: { createdAt: "asc" },
  //     take: numOfNewBookingUsers,
  //     select: {
  //       id: true,
  //       userId: true,
  //       scheduleId: true,
  //     },
  //   });
  //   console.log("newBookingUsers", newBookingUsers);

  //   // create booking for new booking users:
  //   newBookingUsers.forEach(async (user: any) => {
  //     await prisma.booking.create({
  //       data: {
  //         userId: user.userId,
  //         scheduleId: user.scheduleId,
  //         payStatus: true,
  //         status: "BOOKED",
  //       },
  //     });
  //   });
  //   // // Remove new booking users from waiting:
  //   await prisma.waitting.deleteMany({
  //     where: {
  //       id: {
  //         in: newBookingUsers.map((item: any) => item.id), // Delete by IDs
  //       },
  //     },
  //   });
  // }
}

// confirm schedule
async function confirmSchedule2(scheduleId: string, confirm: boolean) {
  try {
    const schedule = await getScheduleByIdService(scheduleId);
    const book = await bookingService.getBookingByScheduleIdService(scheduleId);
    const listUsers = await prisma.booking.findMany({
      where: {
        AND: [{ scheduleId }, { status: "BOOKED" }],
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    const destination =
      schedule?.departure.destination.mainLocationName.toLocaleLowerCase();
    // console.log(destination);
    var userInKrr: (string | null)[] = [];
    var userOutKrr: (string | null)[] = [];

    if (confirm === true) {
      //update booking status to used
      book.forEach(async (item: any) => {
        const book = await prisma.booking.update({
          where: {
            id: item.id,
          },
          data: {
            status: "USED",
          },
        });
        const user = await prisma.user.findUnique({
          where: {
            id: book.userId,
          },
        });
        // update status inKRR
        await prisma.user.update({
          where: {
            id: book.userId,
          },
          data: {
            inKRR: destination == "kirirom" ? true : false,
          },
        });
      });

      //update ticket
      const allWaitings = await waitingService.getWaitingByScheduleIdService(
        scheduleId
      );
      //return ticket back to user
      for (let i = 0; i < allWaitings.length; i++) {
        const getTicketsbyUserId = await prisma.ticket.findUnique({
          where: { userId: allWaitings[i].user.id },
        });
        await prisma.ticket.update({
          where: { userId: allWaitings[i].user.id },
          data: {
            remainTicket: getTicketsbyUserId!.remainTicket + 1,
            ticketLimitInhand:
              getTicketsbyUserId!.ticketLimitInhand <= 0
                ? 0
                : getTicketsbyUserId!.ticketLimitInhand - 1,
          },
        });
      }
      await waitingService.deleteWaitingByScheduleId(scheduleId);
      const send = await mailConfirmSchedule(schedule, book);

      //returnIntoList

      if (destination === "kirirom") {
        listUsers?.map((userInfo) => {
          userInKrr.push(userInfo.user.email);
        });
      } else {
        listUsers?.map((userInfo) => {
          userOutKrr.push(userInfo.user.email);
        });
      }
    }

    //update schedule status to disable
    await prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: {
        enable: !confirm,
        bus: {
          update: {
            enable: !confirm,
          },
        },
      },
    });
    await updateUserStatusLaundry(userInKrr, userOutKrr);
    return schedule;
  } catch (error) {
    console.log("Hello " + error);
  }
}

async function confirmSchedule(scheduleId: string, confirm: boolean) {
  try {
    const schedule = await getScheduleByIdService(scheduleId);
    const books = await prisma.booking.findMany({
      where: {
        AND: [{ scheduleId }, { status: "BOOKED" }],
      },
    });
    const listUsers = await prisma.booking.findMany({
      where: {
        AND: [{ scheduleId }, { status: "BOOKED" }],
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    const destination =
      schedule?.departure.destination.mainLocationName.toLocaleLowerCase();
    // console.log(destination);
    var userInKrr: (string | null)[] = [];
    var userOutKrr: (string | null)[] = [];

    const isInKRR = destination === "kirirom" ? true : false;
    // set all user Booking to USED
    if (confirm === true) {
      //update booking status to used
      books.forEach(async (item: any) => {
        // update status of booking:
        await prisma.booking.update({
          where: {
            id: item.id,
          },
          data: {
            status: "USED",
          },
        });

        // update status inKRR
        await prisma.user.update({
          where: {
            id: item.userId,
          },
          data: {
            inKRR: isInKRR,
          },
        });

        //  update ticketInhand:
        await prisma.ticket.update({
          where: {
            userId: item.userId,
          },
          data: {
            ticketLimitInhand: {
              decrement: 1,
            },
          },
        });
      });

      //update ticket
      const allWaitings = await waitingService.getWaitingByScheduleIdService(
        scheduleId
      );

      //return ticket back to user
      for (let i = 0; i < allWaitings.length; i++) {
        const getTicketsbyUserId = await prisma.ticket.findUnique({
          where: { userId: allWaitings[i].user.id },
        });

        // update ticket for waiting user:
        await prisma.ticket.update({
          where: { userId: allWaitings[i].user.id },
          data: {
            remainTicket: getTicketsbyUserId!.remainTicket + 1,
            ticketLimitInhand:
              getTicketsbyUserId!.ticketLimitInhand <= 0
                ? 0
                : getTicketsbyUserId!.ticketLimitInhand - 1,
          },
        });
      }

      // delete all waiting user after validate:
      await waitingService.deleteWaitingByScheduleId(scheduleId);
      const send = await mailConfirmSchedule(schedule, books);

      //returnIntoList
      if (destination === "kirirom") {
        listUsers?.map((userInfo) => {
          userInKrr.push(userInfo.user.email);
        });
      } else {
        listUsers?.map((userInfo) => {
          userOutKrr.push(userInfo.user.email);
        });
      }
    }

    //update schedule status to disable
    await prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: {
        enable: !confirm,
        bus: {
          update: {
            enable: !confirm,
          },
        },
      },
    });
    await updateUserStatusLaundry(userInKrr, userOutKrr);
    return schedule;
  } catch (error) {
    console.log("Hello " + error);
  }
}

// get schedule by month
async function getScheduleByYearAndMonthService(
  startDate: Date,
  endDate: Date
) {
  const schedule = await prisma.schedule.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  return schedule;
}
async function getPaginatedScheduleByYearAndMonthService(
  startDate: Date,
  endDate: Date,
  limit: number,
  page: number
) {
  const res = await prisma.schedule.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  const total = await prisma.schedule.count({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
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

async function getScheduleByDateService(date: string) {
  console.log("Date:", new Date(date));

  const schedule = await prisma.schedule.findMany({
    where: {
      date: new Date(date),
      enable: true,
    },
    select: selectDefault,
  });
  return schedule;
}

async function getAllScheduleByStatusService(enable: boolean) {
  const date = new Date();
  const schedules = await prisma.schedule.findMany({
    where: {
      enable: enable,
    },
    select: selectDefault,
  });
  const filterAvailableSchedule = schedules.filter(
    (sch: any) => sch.date >= date
  );
  return filterAvailableSchedule;
}
async function getPaginatedAllScheduleByStatusService(
  enable: boolean,
  limit: number,
  page: number
) {
  const date = new Date();
  const schedules = await prisma.schedule.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      enable: enable, // Replace 'enable' with your actual condition.
      date: {
        gte: date, // Use "greater than or equal to" (gte) to compare dates.
      },
    },
    select: selectDefault,
  });

  const total = await prisma.schedule.count({
    where: {
      enable: enable, // Replace 'enable' with your actual condition.
      date: {
        gte: date, // Use "greater than or equal to" (gte) to compare dates.
      },
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
    data: schedules,
  };
}
import moment from "moment";
import { SubLocationDto } from "../../payload/request/subLocatonDto";
import updateUserStatusLaundry from "../../services/laundry.service";
async function cronJobUpdateSchedule(time: string) {
  const today = moment.utc(new Date()).utcOffset(7).format("YYYY-MM-DD");
  //find all schedule that have date less than today
  const scheduleList = await getScheduleByDateService(today);
  if (time == "8:00") {
    for (let i = 0; i < scheduleList.length; i++) {
      const schedule = scheduleList[i];
      const hour = schedule.departure.departureTime
        .toISOString()
        .split("T")[1]
        .split(":")[0];
      if (
        (hour as unknown as number) >= 8 &&
        (hour as unknown as number) < 13
      ) {
        await prisma.booking.updateMany({
          where: {
            scheduleId: schedule.id,
          },
          data: {
            status: BookingStatusEnum.USED,
          },
        });
      }
    }
    console.log("update schedule at 8:00");
  } else if (time == "13:00") {
    for (let i = 0; i < scheduleList.length; i++) {
      const schedule = scheduleList[i];
      const hour = schedule.departure.departureTime
        .toISOString()
        .split("T")[1]
        .split(":")[0];
      if ((hour as unknown as number) >= 13) {
        await prisma.booking.updateMany({
          where: {
            scheduleId: schedule.id,
          },
          data: {
            status: BookingStatusEnum.USED,
          },
        });
      }
    }
    console.log("update schedule at 13:00");
  }
}

export default {
  cronJobUpdateSchedule,
  getAllScheduleByStatusService,
  getPaginatedAllScheduleByStatusService,
  getScheduleByDateService,
  batchCreateScheduleService,
  getAllScheduleService,
  getAllSchedulePaginatedService,
  getScheduleByIdService,
  getScheduleByYearAndMonthService,
  getPaginatedScheduleByYearAndMonthService,
  createScheduleService,
  deleteScheduleByIdService,
  updateScheduleByIdService,
  confirmSchedule,
};
